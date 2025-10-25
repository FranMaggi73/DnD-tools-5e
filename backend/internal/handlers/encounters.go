// backend/internal/handlers/encounters.go
package handlers

import (
	"context"
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

	// ===== OPTIMIZACIÓN: Usar batch para desactivar encuentros anteriores =====
	batch := h.db.Batch()
	activeEncounters := h.db.Collection("encounters").
		Where("campaignId", "==", campaignID).
		Where("isActive", "==", true).
		Documents(ctx)

	deactivatedCount := 0
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
// ELIMINACIÓN OPTIMIZADA CON CASCADA
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

	log.Printf("🏁 Finalizando encuentro: %s", encounterID)

	// ===== SINCRONIZACIÓN Y LIMPIEZA OPTIMIZADA CON BATCH =====
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

		// Sincronizar personajes
		if combatant.CharacterID != "" && (combatant.Type == "character" || combatant.Type == "player") {
			characterRef := h.db.Collection("characters").Doc(combatant.CharacterID)
			batch.Update(characterRef, []firestore.Update{
				{Path: "currentHp", Value: combatant.CurrentHP},
				{Path: "conditions", Value: combatant.Conditions},
				{Path: "updatedAt", Value: time.Now()},
			})
			syncedChars++
		}

		// Eliminar combatiente
		batch.Delete(doc.Ref)
		deletedCombatants++
	}

	// Marcar encuentro como inactivo (en lugar de eliminarlo)
	batch.Update(h.db.Collection("encounters").Doc(encounterID), []firestore.Update{
		{Path: "isActive", Value: false},
		{Path: "updatedAt", Value: time.Now()},
	})

	// Commit todas las operaciones
	if _, err := batch.Commit(ctx); err != nil {
		log.Printf("❌ Error en batch commit: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error finalizando encuentro"})
		return
	}

	log.Printf("✅ Encuentro finalizado: %d personajes sincronizados, %d combatientes eliminados", syncedChars, deletedCombatants)

	c.JSON(http.StatusOK, gin.H{
		"message":           "Encuentro finalizado y personajes sincronizados",
		"syncedCharacters":  syncedChars,
		"deletedCombatants": deletedCombatants,
	})
}

// ===========================
// COMBATIENTES
// ===========================

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
		c.JSON(http.StatusForbidden, gin.H{"error": "Solo el DM puede agregar combatientes"})
		return
	}

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

	combatantRef := h.db.Collection("combatants").NewDoc()
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

	if _, err := combatantRef.Set(ctx, combatant); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error agregando combatiente"})
		return
	}

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

	combatantDoc, err := h.db.Collection("combatants").Doc(combatantID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Combatiente no encontrado"})
		return
	}

	var combatant models.Combatant
	if err := combatantDoc.DataTo(&combatant); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando combatante"})
		return
	}

	encounterDoc, err := h.db.Collection("encounters").Doc(combatant.EncounterID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Encuentro no encontrado"})
		return
	}

	var encounter models.Encounter
	encounterDoc.DataTo(&encounter)

	campaignDoc, err := h.db.Collection("events").Doc(encounter.CampaignID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Campaña no encontrada"})
		return
	}

	var campaign models.Campaign
	campaignDoc.DataTo(&campaign)

	if campaign.DmID != uid {
		c.JSON(http.StatusForbidden, gin.H{"error": "Solo el DM puede actualizar combatientes"})
		return
	}

	// ===== SINCRONIZACIÓN BIDIRECCIONAL OPTIMIZADA =====
	batch := h.db.Batch()
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
		c.JSON(http.StatusBadRequest, gin.H{"error": "No hay datos para actualizar"})
		return
	}

	// Actualizar combatiente
	batch.Update(h.db.Collection("combatants").Doc(combatantID), combatantUpdates)

	// Sincronizar con personaje si aplica
	if combatant.CharacterID != "" && (combatant.Type == "character" || combatant.Type == "player") {
		characterUpdates := []firestore.Update{
			{Path: "updatedAt", Value: time.Now()},
		}

		if req.CurrentHP != nil {
			characterUpdates = append(characterUpdates, firestore.Update{Path: "currentHp", Value: *req.CurrentHP})
		}

		if req.Conditions != nil {
			characterUpdates = append(characterUpdates, firestore.Update{Path: "conditions", Value: req.Conditions})
		}

		batch.Update(h.db.Collection("characters").Doc(combatant.CharacterID), characterUpdates)
	}

	// Commit batch
	if _, err := batch.Commit(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando combatiente"})
		return
	}

	// Obtener combatiente actualizado
	updatedDoc, _ := h.db.Collection("combatants").Doc(combatantID).Get(ctx)
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

	campaignDoc, _ := h.db.Collection("events").Doc(encounter.CampaignID).Get(ctx)
	var campaign models.Campaign
	campaignDoc.DataTo(&campaign)

	if campaign.DmID != uid {
		c.JSON(http.StatusForbidden, gin.H{"error": "Solo el DM puede avanzar turnos"})
		return
	}

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

	newTurnIndex := encounter.TurnIndex + 1
	newRound := encounter.Round

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
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	encounterID := c.Param("encounterId")
	ctx := context.Background()

	encounterDoc, _ := h.db.Collection("encounters").Doc(encounterID).Get(ctx)
	var encounter models.Encounter
	encounterDoc.DataTo(&encounter)

	campaignDoc, _ := h.db.Collection("events").Doc(encounter.CampaignID).Get(ctx)
	var campaign models.Campaign
	campaignDoc.DataTo(&campaign)

	if campaign.DmID != uid {
		c.JSON(http.StatusForbidden, gin.H{"error": "Solo el DM puede reiniciar encuentros"})
		return
	}

	updates := []firestore.Update{
		{Path: "round", Value: 1},
		{Path: "turnIndex", Value: 0},
		{Path: "updatedAt", Value: time.Now()},
	}

	h.db.Collection("encounters").Doc(encounterID).Update(ctx, updates)

	c.JSON(http.StatusOK, gin.H{"message": "Encuentro reiniciado"})
}
