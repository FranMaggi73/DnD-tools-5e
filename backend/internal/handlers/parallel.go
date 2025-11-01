// backend/internal/handlers/parallel.go
package handlers

import (
	"context"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"google.golang.org/api/iterator"

	"github.com/FranMaggi73/dm-events-backend/internal/models"
)

// ===========================
// CONSTANTES DE TTL
// ===========================

const (
	CacheFreshnessThreshold = 10 * time.Second
	CombatDataFreshness     = 3 * time.Second  // Datos de combate críticos
	CampaignDataFreshness   = 10 * time.Second // Campañas cambian menos
)

// ===========================
// ENDPOINT OPTIMIZADO CON VALIDACIÓN DE TIMESTAMPS
// ===========================

// GetCampaignFullData obtiene todos los datos de una campaña en paralelo
// ✅ MEJORADO: Valida timestamps antes de usar caché
func (h *Handler) GetCampaignFullData(c *gin.Context) {
	campaignID := c.Param("id")
	ctx := context.Background()

	// ===== PASO 1: Verificar caché con timestamps =====
	cachedCampaign, campaignCachedAt, foundCampaign := h.cache.GetCampaign(campaignID)
	cachedMembers, membersCachedAt, foundMembers := h.cache.GetMembers(campaignID)
	cachedCharacters, charsCachedAt, foundCharacters := h.cache.GetCharacters(campaignID)

	// ===== PASO 2: Validar frescura del caché =====
	now := time.Now()
	// ✅ FIX: Usar threshold correcto según tipo de dato
	campaignFresh := foundCampaign && now.Sub(campaignCachedAt) < CampaignDataFreshness
	membersFresh := foundMembers && now.Sub(membersCachedAt) < CampaignDataFreshness
	charactersFresh := foundCharacters && now.Sub(charsCachedAt) < CampaignDataFreshness

	// ✅ SI TODO ESTÁ FRESCO, devolver inmediatamente
	if campaignFresh && membersFresh && charactersFresh {
		c.JSON(http.StatusOK, gin.H{
			"campaign":   cachedCampaign,
			"members":    cachedMembers,
			"characters": cachedCharacters,
			"cached":     true,
			"cache_age": map[string]string{
				"campaign":   now.Sub(campaignCachedAt).String(),
				"members":    now.Sub(membersCachedAt).String(),
				"characters": now.Sub(charsCachedAt).String(),
			},
		})
		return
	}

	// ===== PASO 3: Caché obsoleto o missing, refrescar en paralelo =====
	var campaign *models.Campaign
	var members []models.CampaignMember
	var characters []models.Character
	var wg sync.WaitGroup
	var mu sync.Mutex
	var errors []error

	// Fetch campaign si no está fresco
	if !campaignFresh {
		// Fetch characters (con validación de caché MÁS ESTRICTA para datos de combate)
		wg.Add(1)
		go func() {
			defer wg.Done()

			cached, cachedAt, found := h.cache.GetCharacters(campaignID)
			// ✅ FIX: En combate, necesitamos datos más frescos
			if found && time.Since(cachedAt) < CombatDataFreshness {
				mu.Lock()
				characters = cached
				mu.Unlock()
				return
			}

			ch, err := h.getCampaignCharacters(ctx, campaignID)
			if err != nil {
				mu.Lock()
				errors = append(errors, err)
				mu.Unlock()
				return
			}
			mu.Lock()
			characters = ch
			h.cache.SetCharacters(campaignID, ch)
			mu.Unlock()
		}()
	} else {
		campaign = cachedCampaign
	}

	// Fetch members si no está fresco
	if !membersFresh {
		wg.Add(1)
		go func() {
			defer wg.Done()
			m, err := h.getCampaignMembers(ctx, campaignID)
			if err != nil {
				mu.Lock()
				errors = append(errors, err)
				mu.Unlock()
				return
			}
			mu.Lock()
			members = m
			h.cache.SetMembers(campaignID, m) // TTL: 30 segundos
			mu.Unlock()
		}()
	} else {
		members = cachedMembers
	}

	// Fetch characters si no está fresco
	if !charactersFresh {
		wg.Add(1)
		go func() {
			defer wg.Done()
			ch, err := h.getCampaignCharacters(ctx, campaignID)
			if err != nil {
				mu.Lock()
				errors = append(errors, err)
				mu.Unlock()
				return
			}
			mu.Lock()
			characters = ch
			h.cache.SetCharacters(campaignID, ch) // TTL: 30 segundos
			mu.Unlock()
		}()
	} else {
		characters = cachedCharacters
	}

	// Esperar a que terminen todas las goroutines
	wg.Wait()

	// Verificar errores
	if len(errors) > 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": errors[0].Error()})
		return
	}

	// Organizar miembros (DM y jugadores)
	var dm *models.CampaignMember
	var players []models.CampaignMember
	for _, m := range members {
		if m.Role == "dm" {
			dm = &m
		} else {
			players = append(players, m)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"campaign":   campaign,
		"dm":         dm,
		"players":    players,
		"characters": characters,
		"cached":     false, // Datos refrescados
		"refreshed": map[string]bool{
			"campaign":   !campaignFresh,
			"members":    !membersFresh,
			"characters": !charactersFresh,
		},
	})
}

// ===========================
// HELPERS PRIVADOS (sin cambios)
// ===========================

func (h *Handler) getCampaignByID(ctx context.Context, campaignID string) (*models.Campaign, error) {
	doc, err := h.db.Collection("events").Doc(campaignID).Get(ctx)
	if err != nil {
		return nil, err
	}

	var campaign models.Campaign
	if err := doc.DataTo(&campaign); err != nil {
		return nil, err
	}

	return &campaign, nil
}

func (h *Handler) getCampaignMembers(ctx context.Context, campaignID string) ([]models.CampaignMember, error) {
	iter := h.db.Collection("event_members").
		Where("campaignId", "==", campaignID).
		Documents(ctx)

	var members []models.CampaignMember
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		var member models.CampaignMember
		if err := doc.DataTo(&member); err != nil {
			continue
		}
		members = append(members, member)
	}

	if members == nil {
		members = []models.CampaignMember{}
	}

	return members, nil
}

func (h *Handler) getCampaignCharacters(ctx context.Context, campaignID string) ([]models.Character, error) {
	iter := h.db.Collection("characters").
		Where("campaignId", "==", campaignID).
		Documents(ctx)

	var characters []models.Character
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		var char models.Character
		if err := doc.DataTo(&char); err != nil {
			continue
		}
		characters = append(characters, char)
	}

	if characters == nil {
		characters = []models.Character{}
	}

	return characters, nil
}

// ===========================
// ENDPOINT PARA COMBATE (SIN CAMBIOS MAYORES)
// ===========================

func (h *Handler) GetCombatFullData(c *gin.Context) {
	campaignID := c.Param("id")
	ctx := context.Background()

	var encounter *models.Encounter
	var combatants []models.Combatant
	var characters []models.Character
	var wg sync.WaitGroup
	var mu sync.Mutex
	var errors []error

	// Fetch encounter activo
	wg.Add(1)
	go func() {
		defer wg.Done()
		enc, err := h.getActiveEncounter(ctx, campaignID)
		if err != nil {
			mu.Lock()
			errors = append(errors, err)
			mu.Unlock()
			return
		}
		mu.Lock()
		encounter = enc
		mu.Unlock()
	}()

	// Fetch characters (con validación de caché)
	wg.Add(1)
	go func() {
		defer wg.Done()

		cached, cachedAt, found := h.cache.GetCharacters(campaignID)
		if found && time.Since(cachedAt) < CacheFreshnessThreshold {
			mu.Lock()
			characters = cached
			mu.Unlock()
			return
		}

		ch, err := h.getCampaignCharacters(ctx, campaignID)
		if err != nil {
			mu.Lock()
			errors = append(errors, err)
			mu.Unlock()
			return
		}
		mu.Lock()
		characters = ch
		h.cache.SetCharacters(campaignID, ch)
		mu.Unlock()
	}()

	wg.Wait()

	if len(errors) > 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No hay encuentro activo"})
		return
	}

	if encounter == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No hay encuentro activo"})
		return
	}

	// Fetch combatants (NO cachear, datos en tiempo real)
	wg.Add(1)
	go func() {
		defer wg.Done()
		cb, err := h.getEncounterCombatants(ctx, encounter.ID)
		if err != nil {
			mu.Lock()
			errors = append(errors, err)
			mu.Unlock()
			return
		}
		mu.Lock()
		combatants = cb
		mu.Unlock()
	}()

	wg.Wait()

	if len(errors) > 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": errors[0].Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"encounter":  encounter,
		"combatants": combatants,
		"characters": characters,
	})
}

func (h *Handler) getActiveEncounter(ctx context.Context, campaignID string) (*models.Encounter, error) {
	iter := h.db.Collection("encounters").
		Where("campaignId", "==", campaignID).
		Where("isActive", "==", true).
		Limit(1).
		Documents(ctx)

	doc, err := iter.Next()
	if err == iterator.Done {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	var encounter models.Encounter
	if err := doc.DataTo(&encounter); err != nil {
		return nil, err
	}

	return &encounter, nil
}

func (h *Handler) getEncounterCombatants(ctx context.Context, encounterID string) ([]models.Combatant, error) {
	iter := h.db.Collection("combatants").
		Where("encounterId", "==", encounterID).
		Documents(ctx)

	var combatants []models.Combatant
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		var combatant models.Combatant
		if err := doc.DataTo(&combatant); err != nil {
			continue
		}
		combatants = append(combatants, combatant)
	}

	if combatants == nil {
		combatants = []models.Combatant{}
	}

	return combatants, nil
}
