// backend/internal/handlers/parallel.go
package handlers

import (
	"context"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"google.golang.org/api/iterator"

	"github.com/FranMaggi73/dm-events-backend/internal/models"
)

// ===========================
// ENDPOINT OPTIMIZADO CON GOROUTINES
// ===========================

// GetCampaignFullData obtiene todos los datos de una campaña en paralelo
func (h *Handler) GetCampaignFullData(c *gin.Context) {
	campaignID := c.Param("id")
	ctx := context.Background()

	// Intentar obtener de caché primero
	cachedCampaign, foundCampaign := h.cache.GetCampaign(campaignID)
	cachedMembers, foundMembers := h.cache.GetMembers(campaignID)
	cachedCharacters, foundCharacters := h.cache.GetCharacters(campaignID)

	// Si todo está en caché, devolver inmediatamente
	if foundCampaign && foundMembers && foundCharacters {
		c.JSON(http.StatusOK, gin.H{
			"campaign":   cachedCampaign,
			"members":    cachedMembers,
			"characters": cachedCharacters,
			"cached":     true,
		})
		return
	}

	// Variables para almacenar resultados
	var campaign *models.Campaign
	var members []models.CampaignMember
	var characters []models.Character
	var wg sync.WaitGroup
	var mu sync.Mutex
	var errors []error

	// Fetch campaign en paralelo si no está en caché
	if !foundCampaign {
		wg.Add(1)
		go func() {
			defer wg.Done()
			c, err := h.getCampaignByID(ctx, campaignID)
			if err != nil {
				mu.Lock()
				errors = append(errors, err)
				mu.Unlock()
				return
			}
			mu.Lock()
			campaign = c
			h.cache.SetCampaign(c)
			mu.Unlock()
		}()
	} else {
		campaign = cachedCampaign
	}

	// Fetch members en paralelo si no está en caché
	if !foundMembers {
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
			h.cache.SetMembers(campaignID, m)
			mu.Unlock()
		}()
	} else {
		members = cachedMembers
	}

	// Fetch characters en paralelo si no está en caché
	if !foundCharacters {
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
			h.cache.SetCharacters(campaignID, ch)
			mu.Unlock()
		}()
	} else {
		characters = cachedCharacters
	}

	// Esperar a que todas las goroutines terminen
	wg.Wait()

	// Verificar si hubo errores
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
		"cached":     false,
	})
}

// ===========================
// HELPER FUNCTIONS (privadas)
// ===========================

// getCampaignByID obtiene una campaña por ID
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

// getCampaignMembers obtiene los miembros de una campaña
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

// getCampaignCharacters obtiene los personajes de una campaña
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
// ENDPOINT PARA COMBATE CON GOROUTINES
// ===========================

// GetCombatFullData obtiene todos los datos de combate en paralelo
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

	// Fetch characters
	wg.Add(1)
	go func() {
		defer wg.Done()

		// Intentar caché primero
		cached, found := h.cache.GetCharacters(campaignID)
		if found {
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

	// Esperar a que termine el fetch del encounter
	wg.Wait()

	// Si hay errores o no hay encounter, devolver apropiadamente
	if len(errors) > 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No hay encuentro activo"})
		return
	}

	if encounter == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No hay encuentro activo"})
		return
	}

	// Ahora fetch combatants del encounter encontrado
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

// getActiveEncounter obtiene el encuentro activo
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

// getEncounterCombatants obtiene los combatientes de un encuentro
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
