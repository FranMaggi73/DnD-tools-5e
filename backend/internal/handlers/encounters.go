// backend/internal/handlers/encounters.go
package handlers

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"sort"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/iterator"

	"github.com/FranMaggi73/dm-events-backend/internal/models"
)

// ===========================
// ENCUENTROS DE COMBATE
// ===========================

func (h *Handler) CreateEncounter(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	campaignID := c.Param("id")
	ctx := context.Background()

	var req models.CreateEncounterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	campaignDoc, err := h.db.Collection("events").Doc(campaignID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Campaña no encontrada"})
		return
	}

	var campaign models.Campaign
	if err := campaignDoc.DataTo(&campaign); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando campaña"})
		return
	}

	if campaign.DmID != uid {
		c.JSON(http.StatusForbidden, gin.H{"error": "Solo el DM puede crear encuentros"})
		return
	}

	// ===== OPTIMIZACIÓN: Desactivar encuentros anteriores con batch =====
	batch := h.db.Batch()
	deactivatedCount := 0

	activeEncounters := h.db.Collection("encounters").
		Where("campaignId", "==", campaignID).
		Where("isActive", "==", true).
		Documents(ctx)

	for {
		doc, err := activeEncounters.Next()
		if err == iterator.Done {
			break
		}
		if err == nil {
			batch.Update(doc.Ref, []firestore.Update{
				{Path: "isActive", Value: false},
			})
			deactivatedCount++
		}
	}

	// Crear nuevo encuentro
	encounterRef := h.db.Collection("encounters").NewDoc()
	encounter := models.Encounter{
		ID:         encounterRef.ID,
		CampaignID: campaignID,
		Name:       req.Name,
		IsActive:   true,
		Round:      1,
		TurnIndex:  0,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	batch.Set(encounterRef, encounter)

	// Commit batch
	if _, err := batch.Commit(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando encuentro"})
		return
	}

	// Invalidar caché
	h.cache.InvalidateEncounter(encounter.ID)

	log.Printf("✅ Encuentro creado: %s (desactivados: %d)", encounter.ID, deactivatedCount)
	c.JSON(http.StatusCreated, encounter)
}

func (h *Handler) GetActiveEncounter(c *gin.Context) {
	campaignID := c.Param("id")
	ctx := context.Background()

	iter := h.db.Collection("encounters").
		Where("campaignId", "==", campaignID).
		Where("isActive", "==", true).
		Limit(1).
		Documents(ctx)

	doc, err := iter.Next()
	if err == iterator.Done {
		c.JSON(http.StatusNotFound, gin.H{"error": "No hay encuentro activo"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo encuentro"})
		return
	}

	var encounter models.Encounter
	if err := doc.DataTo(&encounter); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando encuentro"})
		return
	}

	c.JSON(http.StatusOK, encounter)
}

// ===========================
// ✅ ARREGLADO: EndEncounter - ELIMINACIÓN COMPLETA
// ===========================

func (h *Handler) EndEncounter(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	encounterID := c.Param("encounterId")
	ctx := context.Background()

	encounterDoc, err := h.db.Collection("encounters").Doc(encounterID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Encuentro no encontrado"})
		return
	}

	var encounter models.Encounter
	if err := encounterDoc.DataTo(&encounter); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando encuentro"})
		return
	}

	campaignDoc, err := h.db.Collection("events").Doc(encounter.CampaignID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Campaña no encontrada"})
		return
	}

	var campaign models.Campaign
	if err := campaignDoc.DataTo(&campaign); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando campaña"})
		return
	}

	if campaign.DmID != uid {
		c.JSON(http.StatusForbidden, gin.H{"error": "Solo el DM puede finalizar encuentros"})
		return
	}

	log.Printf("🏁 Finalizando encuentro: %s (ELIMINACIÓN COMPLETA)", encounterID)

	// ===== SINCRONIZACIÓN Y ELIMINACIÓN OPTIMIZADA CON BATCH =====
	batch := h.db.Batch()
	syncedChars := 0
	deletedCombatants := 0

	combatantsIter := h.db.Collection("combatants").
		Where("encounterId", "==", encounterID).
		Documents(ctx)

	for {
		doc, err := combatantsIter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			continue
		}

		var combatant models.Combatant
		if err := doc.DataTo(&combatant); err != nil {
			continue
		}

		// ✅ Sincronizar personajes (guardar HP Y CONDICIONES)
		if combatant.CharacterID != "" && (combatant.Type == "character" || combatant.Type == "player") {
			characterRef := h.db.Collection("characters").Doc(combatant.CharacterID)

			// Asegurar que conditions no sea nil
			conditions := combatant.Conditions
			if conditions == nil {
				conditions = []string{}
			}

			batch.Update(characterRef, []firestore.Update{
				{Path: "currentHp", Value: combatant.CurrentHP},
				{Path: "conditions", Value: conditions}, // ✅ SINCRONIZAR CONDICIONES
				{Path: "updatedAt", Value: time.Now()},
			})
			syncedChars++
		}

		// ✅ ELIMINAR combatiente (en lugar de solo marcar como inactivo)
		batch.Delete(doc.Ref)
		deletedCombatants++

		// Firestore batch limit es 500 operaciones
		if (syncedChars + deletedCombatants) >= 400 {
			if _, err := batch.Commit(ctx); err != nil {
				log.Printf("❌ Error en batch commit: %v", err)
			}
			batch = h.db.Batch()
		}
	}

	// ✅ ELIMINAR encuentro completamente (en lugar de marcar como inactivo)
	batch.Delete(h.db.Collection("encounters").Doc(encounterID))

	// Commit todas las operaciones pendientes
	if _, err := batch.Commit(ctx); err != nil {
		log.Printf("❌ Error en batch commit final: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error finalizando encuentro"})
		return
	}

	// Invalidar caché
	h.cache.InvalidateEncounter(encounterID)

	log.Printf("✅ Encuentro ELIMINADO: %d personajes sincronizados, %d combatientes eliminados", syncedChars, deletedCombatants)

	c.JSON(http.StatusOK, gin.H{
		"message":           "Encuentro finalizado y eliminado completamente",
		"syncedCharacters":  syncedChars,
		"deletedCombatants": deletedCombatants,
	})
}

// ===========================
// COMBATIENTES
// ===========================

// REEMPLAZAR handleAddCombatant (línea ~228) con transacción
func (h *Handler) AddCombatant(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	encounterID := c.Param("encounterId")
	ctx := context.Background()

	var req models.AddCombatantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ✅ USAR TRANSACCIÓN
	combatantRef := h.db.Collection("combatants").NewDoc()

	err := h.db.RunTransaction(ctx, func(ctx context.Context, tx *firestore.Transaction) error {
		// 1. Verificar que el encuentro existe
		encounterDoc, err := tx.Get(h.db.Collection("encounters").Doc(encounterID))
		if err != nil {
			return fmt.Errorf("encuentro no encontrado")
		}

		var encounter models.Encounter
		if err := encounterDoc.DataTo(&encounter); err != nil {
			return err
		}

		// 2. Verificar permisos
		campaignDoc, err := h.db.Collection("events").Doc(encounter.CampaignID).Get(ctx)
		if err != nil {
			return err
		}

		var campaign models.Campaign
		if err := campaignDoc.DataTo(&campaign); err != nil {
			return err
		}

		if campaign.DmID != uid {
			return fmt.Errorf("solo el DM puede agregar combatientes")
		}

		// 3. Preparar datos del combatiente
		var name string
		var imageURL string
		var characterID string
		var conditions []string

		if (req.Type == "character" || req.Type == "player") && req.CharacterID != "" {
			characterID = req.CharacterID

			charDoc, err := h.db.Collection("characters").Doc(req.CharacterID).Get(ctx)
			if err == nil {
				var char models.Character
				if charDoc.DataTo(&char) == nil {
					name = char.Name
					imageURL = char.ImageURL
					conditions = char.Conditions

					if req.MaxHP == 0 {
						req.MaxHP = char.MaxHP
					}
					if req.CurrentHP == 0 {
						req.CurrentHP = char.CurrentHP
					}
					if req.ArmorClass == 0 {
						req.ArmorClass = char.ArmorClass
					}
				}
			}
		} else {
			name = req.Name
			imageURL = req.ImageURL
			conditions = []string{}
		}

		combatant := models.Combatant{
			ID:          combatantRef.ID,
			EncounterID: encounterID,
			Type:        req.Type,
			CharacterID: characterID,
			Name:        name,
			Initiative:  req.Initiative,
			MaxHP:       req.MaxHP,
			CurrentHP:   req.CurrentHP,
			ArmorClass:  req.ArmorClass,
			Conditions:  conditions,
			ImageURL:    imageURL,
			IsNPC:       req.IsNPC,
			CreatedAt:   time.Now(),
		}

		if combatant.CurrentHP == 0 {
			combatant.CurrentHP = combatant.MaxHP
		}

		// 4. Crear combatiente dentro de la transacción
		return tx.Set(combatantRef, combatant)
	})

	if err != nil {
		if err.Error() == "solo el DM puede agregar combatientes" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error agregando combatiente"})
		return
	}

	// Obtener combatiente creado
	combatantDoc, _ := combatantRef.Get(ctx)
	var combatant models.Combatant
	combatantDoc.DataTo(&combatant)

	c.JSON(http.StatusCreated, combatant)
}

func (h *Handler) GetCombatants(c *gin.Context) {
	encounterID := c.Param("encounterId")
	ctx := context.Background()

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
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo combatientes"})
			return
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

	sort.Slice(combatants, func(i, j int) bool {
		return combatants[i].Initiative > combatants[j].Initiative
	})

	c.JSON(http.StatusOK, combatants)
}

func (h *Handler) UpdateCombatant(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	combatantID := c.Param("combatantId")
	ctx := context.Background()

	var req models.UpdateCombatantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	combatantRef := h.db.Collection("combatants").Doc(combatantID)

	// ✅ USAR TRANSACCIÓN PARA SINCRONIZACIÓN ATÓMICA
	err := h.db.RunTransaction(ctx, func(ctx context.Context, tx *firestore.Transaction) error {
		// 1. Leer combatiente
		combatantDoc, err := tx.Get(combatantRef)
		if err != nil {
			return err
		}

		var combatant models.Combatant
		if err := combatantDoc.DataTo(&combatant); err != nil {
			return err
		}

		// 2. Verificar permisos
		encounterDoc, err := h.db.Collection("encounters").Doc(combatant.EncounterID).Get(ctx)
		if err != nil {
			return err
		}

		var encounter models.Encounter
		encounterDoc.DataTo(&encounter)

		campaignDoc, err := h.db.Collection("events").Doc(encounter.CampaignID).Get(ctx)
		if err != nil {
			return err
		}

		var campaign models.Campaign
		campaignDoc.DataTo(&campaign)

		if campaign.DmID != uid {
			return fmt.Errorf("solo el DM puede actualizar combatientes")
		}

		// 3. Preparar updates
		combatantUpdates := []firestore.Update{}

		if req.CurrentHP != nil {
			combatantUpdates = append(combatantUpdates, firestore.Update{Path: "currentHp", Value: *req.CurrentHP})
		}

		if req.Conditions != nil {
			combatantUpdates = append(combatantUpdates, firestore.Update{Path: "conditions", Value: req.Conditions})
		}

		if req.Initiative != nil {
			combatantUpdates = append(combatantUpdates, firestore.Update{Path: "initiative", Value: *req.Initiative})
		}

		if len(combatantUpdates) == 0 {
			return fmt.Errorf("no hay datos para actualizar")
		}

		// ✅ 4. ACTUALIZAR COMBATIENTE Y PERSONAJE EN LA MISMA TRANSACCIÓN
		if err := tx.Update(combatantRef, combatantUpdates); err != nil {
			return err
		}

		// 5. Sincronizar con personaje si aplica
		if combatant.CharacterID != "" && (combatant.Type == "character" || combatant.Type == "player") {
			characterRef := h.db.Collection("characters").Doc(combatant.CharacterID)
			characterUpdates := []firestore.Update{
				{Path: "updatedAt", Value: time.Now()},
			}

			if req.CurrentHP != nil {
				characterUpdates = append(characterUpdates, firestore.Update{Path: "currentHp", Value: *req.CurrentHP})
			}

			if req.Conditions != nil {
				characterUpdates = append(characterUpdates, firestore.Update{Path: "conditions", Value: req.Conditions})
			}

			if err := tx.Update(characterRef, characterUpdates); err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		if err.Error() == "solo el DM puede actualizar combatientes" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		if err.Error() == "no hay datos para actualizar" {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando combatiente"})
		return
	}

	// Obtener combatiente actualizado
	updatedDoc, _ := combatantRef.Get(ctx)
	var updated models.Combatant
	updatedDoc.DataTo(&updated)

	c.JSON(http.StatusOK, updated)
}

func (h *Handler) RemoveCombatant(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	combatantID := c.Param("combatantId")
	ctx := context.Background()

	combatantDoc, err := h.db.Collection("combatants").Doc(combatantID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Combatiente no encontrado"})
		return
	}

	var combatant models.Combatant
	combatantDoc.DataTo(&combatant)

	encounterDoc, _ := h.db.Collection("encounters").Doc(combatant.EncounterID).Get(ctx)
	var encounter models.Encounter
	encounterDoc.DataTo(&encounter)

	campaignDoc, _ := h.db.Collection("events").Doc(encounter.CampaignID).Get(ctx)
	var campaign models.Campaign
	campaignDoc.DataTo(&campaign)

	if campaign.DmID != uid {
		c.JSON(http.StatusForbidden, gin.H{"error": "Solo el DM puede eliminar combatientes"})
		return
	}

	if _, err := h.db.Collection("combatants").Doc(combatantID).Delete(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando combatiente"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Combatiente eliminado"})
}

// ===========================
// GESTIÓN DE TURNOS
// ===========================

func (h *Handler) NextTurn(c *gin.Context) {
	encounterID := c.Param("encounterId")
	ctx := context.Background()

	// Obtener encuentro del contexto (ya verificado por middleware)
	encounter, ok := c.Get("encounter")
	if !ok {
		encounterDoc, err := h.db.Collection("encounters").Doc(encounterID).Get(ctx)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Encuentro no encontrado"})
			return
		}

		var enc models.Encounter
		if err := encounterDoc.DataTo(&enc); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando encuentro"})
			return
		}
		encounter = &enc
	}

	enc := encounter.(*models.Encounter)

	iter := h.db.Collection("combatants").
		Where("encounterId", "==", encounterID).
		Documents(ctx)

	combatantCount := 0
	for {
		_, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err == nil {
			combatantCount++
		}
	}

	if combatantCount == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No hay combatientes en el encuentro"})
		return
	}

	newTurnIndex := enc.TurnIndex + 1
	newRound := enc.Round

	if newTurnIndex >= combatantCount {
		newTurnIndex = 0
		newRound++
	}

	updates := []firestore.Update{
		{Path: "turnIndex", Value: newTurnIndex},
		{Path: "round", Value: newRound},
		{Path: "updatedAt", Value: time.Now()},
	}

	if _, err := h.db.Collection("encounters").Doc(encounterID).Update(ctx, updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error avanzando turno"})
		return
	}

	updatedDoc, _ := h.db.Collection("encounters").Doc(encounterID).Get(ctx)
	var updated models.Encounter
	updatedDoc.DataTo(&updated)

	c.JSON(http.StatusOK, updated)
}

func (h *Handler) ResetEncounter(c *gin.Context) {
	// ✅ Ya no necesita verificar permisos
	encounterID := c.Param("encounterId")
	ctx := context.Background()

	updates := []firestore.Update{
		{Path: "round", Value: 1},
		{Path: "turnIndex", Value: 0},
		{Path: "updatedAt", Value: time.Now()},
	}

	if _, err := h.db.Collection("encounters").Doc(encounterID).Update(ctx, updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error reiniciando encuentro"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Encuentro reiniciado"})
}
