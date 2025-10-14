// backend/internal/handlers/encounters.go
package handlers

import (
	"context"
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

// CreateEncounter - Crear un nuevo encuentro de combate
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

	// Verificar que el usuario es el DM
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

	// Desactivar encuentros activos anteriores
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
			doc.Ref.Update(ctx, []firestore.Update{
				{Path: "isActive", Value: false},
			})
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

	if _, err := encounterRef.Set(ctx, encounter); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando encuentro"})
		return
	}

	c.JSON(http.StatusCreated, encounter)
}

// GetActiveEncounter - Obtener el encuentro activo de una campaña
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

// EndEncounter - Finalizar un encuentro
func (h *Handler) EndEncounter(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	encounterID := c.Param("encounterId")
	ctx := context.Background()

	// Verificar que el usuario es el DM
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

	// Marcar como inactivo
	if _, err := h.db.Collection("encounters").Doc(encounterID).Update(ctx, []firestore.Update{
		{Path: "isActive", Value: false},
		{Path: "updatedAt", Value: time.Now()},
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error finalizando encuentro"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Encuentro finalizado"})
}

// ===========================
// COMBATIENTES
// ===========================

// AddCombatant - Agregar combatiente al encuentro
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

	// Verificar que el encuentro existe
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

	// Verificar que el usuario es el DM
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

	// Si es un personaje, obtener datos del personaje
	var name string
	var imageURL string
	if req.Type == "character" && req.CharacterID != "" {
		charDoc, err := h.db.Collection("characters").Doc(req.CharacterID).Get(ctx)
		if err == nil {
			var char models.Character
			if charDoc.DataTo(&char) == nil {
				name = char.Name
				imageURL = char.ImageURL
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
	}

	// Crear combatiente
	combatantRef := h.db.Collection("combatants").NewDoc()
	combatant := models.Combatant{
		ID:          combatantRef.ID,
		EncounterID: encounterID,
		Type:        req.Type,
		CharacterID: req.CharacterID,
		Name:        name,
		Initiative:  req.Initiative,
		MaxHP:       req.MaxHP,
		CurrentHP:   req.CurrentHP,
		ArmorClass:  req.ArmorClass,
		Conditions:  []string{},
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

// GetCombatants - Obtener todos los combatientes de un encuentro
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

	// Ordenar por iniciativa (descendente)
	sort.Slice(combatants, func(i, j int) bool {
		return combatants[i].Initiative > combatants[j].Initiative
	})

	c.JSON(http.StatusOK, combatants)
}

// UpdateCombatant - Actualizar HP, condiciones, iniciativa de un combatiente
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

	// Obtener combatiente
	combatantDoc, err := h.db.Collection("combatants").Doc(combatantID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Combatiente no encontrado"})
		return
	}

	var combatant models.Combatant
	if err := combatantDoc.DataTo(&combatant); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando combatiente"})
		return
	}

	// Verificar permisos
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

	// Solo el DM puede actualizar combatientes
	if campaign.DmID != uid {
		c.JSON(http.StatusForbidden, gin.H{"error": "Solo el DM puede actualizar combatientes"})
		return
	}

	// Preparar actualizaciones
	updates := []firestore.Update{}

	if req.CurrentHP != nil {
		updates = append(updates, firestore.Update{Path: "currentHp", Value: *req.CurrentHP})
	}

	if req.Conditions != nil {
		updates = append(updates, firestore.Update{Path: "conditions", Value: req.Conditions})
	}

	if req.Initiative != nil {
		updates = append(updates, firestore.Update{Path: "initiative", Value: *req.Initiative})
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No hay datos para actualizar"})
		return
	}

	// Actualizar
	if _, err := h.db.Collection("combatants").Doc(combatantID).Update(ctx, updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando combatiente"})
		return
	}

	// Obtener combatiente actualizado
	updatedDoc, _ := h.db.Collection("combatants").Doc(combatantID).Get(ctx)
	var updated models.Combatant
	updatedDoc.DataTo(&updated)

	c.JSON(http.StatusOK, updated)
}

// RemoveCombatant - Eliminar combatiente del encuentro
func (h *Handler) RemoveCombatant(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	combatantID := c.Param("combatantId")
	ctx := context.Background()

	// Verificar que el combatiente existe
	combatantDoc, err := h.db.Collection("combatants").Doc(combatantID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Combatiente no encontrado"})
		return
	}

	var combatant models.Combatant
	combatantDoc.DataTo(&combatant)

	// Verificar permisos (solo DM)
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

	// Eliminar
	if _, err := h.db.Collection("combatants").Doc(combatantID).Delete(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando combatiente"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Combatiente eliminado"})
}

// ===========================
// GESTIÓN DE TURNOS
// ===========================

// NextTurn - Avanzar al siguiente turno
func (h *Handler) NextTurn(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	encounterID := c.Param("encounterId")
	ctx := context.Background()

	// Obtener encuentro
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

	// Verificar que el usuario es el DM
	campaignDoc, _ := h.db.Collection("events").Doc(encounter.CampaignID).Get(ctx)
	var campaign models.Campaign
	campaignDoc.DataTo(&campaign)

	if campaign.DmID != uid {
		c.JSON(http.StatusForbidden, gin.H{"error": "Solo el DM puede avanzar turnos"})
		return
	}

	// Obtener número de combatientes
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

	// Avanzar turno
	newTurnIndex := encounter.TurnIndex + 1
	newRound := encounter.Round

	// Si terminó la ronda, resetear índice y avanzar ronda
	if newTurnIndex >= combatantCount {
		newTurnIndex = 0
		newRound++
	}

	// Actualizar encuentro
	updates := []firestore.Update{
		{Path: "turnIndex", Value: newTurnIndex},
		{Path: "round", Value: newRound},
		{Path: "updatedAt", Value: time.Now()},
	}

	if _, err := h.db.Collection("encounters").Doc(encounterID).Update(ctx, updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error avanzando turno"})
		return
	}

	// Obtener encuentro actualizado
	updatedDoc, _ := h.db.Collection("encounters").Doc(encounterID).Get(ctx)
	var updated models.Encounter
	updatedDoc.DataTo(&updated)

	c.JSON(http.StatusOK, updated)
}

// ResetEncounter - Reiniciar encuentro (volver a ronda 1, turno 0)
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
