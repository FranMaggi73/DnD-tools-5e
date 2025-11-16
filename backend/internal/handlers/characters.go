// backend/internal/handlers/characters.go
package handlers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/iterator"

	"github.com/FranMaggi73/dm-events-backend/internal/models"
)

// ===========================
// PERSONAJES - NIVEL 1 COMPLETO
// ===========================

func (h *Handler) CreateCharacter(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	campaignID := c.Param("id")
	ctx := context.Background()

	var req models.CreateCharacterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ✅ OPTIMIZACIÓN: Verificaciones EN PARALELO antes de la transacción
	type verificationResult struct {
		isMember     bool
		hasDuplicate bool
		err          error
	}

	resultCh := make(chan verificationResult, 1)

	go func() {
		result := verificationResult{}

		// Verificar si es miembro
		memberIter := h.db.Collection("event_members").
			Where("campaignId", "==", campaignID).
			Where("userId", "==", uid).
			Limit(1).
			Documents(ctx)

		_, err := memberIter.Next()
		if err == iterator.Done {
			result.err = fmt.Errorf("no eres miembro de esta campaña")
			resultCh <- result
			return
		}
		result.isMember = true

		// Verificar duplicado
		existingIter := h.db.Collection("characters").
			Where("campaignId", "==", campaignID).
			Where("userId", "==", uid).
			Limit(1).
			Documents(ctx)

		_, err = existingIter.Next()
		if err != iterator.Done {
			result.hasDuplicate = true
		}

		resultCh <- result
	}()

	// Esperar resultado
	result := <-resultCh

	if result.err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": result.err.Error()})
		return
	}

	if result.hasDuplicate {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ya tienes un personaje en esta campaña"})
		return
	}

	// ✅ Ahora SÍ hacer la transacción (más rápida)
	charRef := h.db.Collection("characters").NewDoc()

	err := h.db.RunTransaction(ctx, func(ctx context.Context, tx *firestore.Transaction) error {
		proficiencyBonus := (req.Level-1)/4 + 2

		skills := req.Skills
		if skills == nil {
			skills = []models.Skill{}
		}

		character := models.Character{
			ID:               charRef.ID,
			CampaignID:       campaignID,
			UserID:           uid,
			Name:             req.Name,
			Class:            req.Class,
			Level:            req.Level,
			MaxHP:            req.MaxHP,
			CurrentHP:        req.MaxHP,
			ArmorClass:       req.ArmorClass,
			Initiative:       req.Initiative,
			Speed:            req.Speed,
			Conditions:       []string{},
			AbilityScores:    req.AbilityScores,
			ProficiencyBonus: proficiencyBonus,
			SavingThrows:     req.SavingThrows,
			Skills:           skills,
			CreatedAt:        time.Now(),
			UpdatedAt:        time.Now(),
		}

		return tx.Set(charRef, character)
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando personaje"})
		return
	}

	charDoc, _ := charRef.Get(ctx)
	var character models.Character
	charDoc.DataTo(&character)

	c.JSON(http.StatusCreated, character)
}

// GetCampaignCharacters - Obtener todos los personajes de una campaña
func (h *Handler) GetCampaignCharacters(c *gin.Context) {
	campaignID := c.Param("id")
	ctx := context.Background()

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
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo personajes"})
			return
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

	c.JSON(http.StatusOK, characters)
}

// UpdateCharacter - Actualizar un personaje (COMPLETO con Nivel 1)
func (h *Handler) UpdateCharacter(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	charID := c.Param("charId")
	ctx := context.Background()

	// Verificar que el personaje existe
	charDoc, err := h.db.Collection("characters").Doc(charID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Personaje no encontrado"})
		return
	}

	var char models.Character
	if err := charDoc.DataTo(&char); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando personaje"})
		return
	}

	// Verificar permisos: solo el dueño o el DM pueden editar
	campaignDoc, err := h.db.Collection("events").Doc(char.CampaignID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Campaña no encontrada"})
		return
	}

	var campaign models.Campaign
	campaignDoc.DataTo(&campaign)

	if char.UserID != uid && campaign.DmID != uid {
		c.JSON(http.StatusForbidden, gin.H{"error": "No tienes permisos para editar este personaje"})
		return
	}

	var req models.CreateCharacterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Calcular proficiency bonus basado en el nivel
	proficiencyBonus := (req.Level-1)/4 + 2

	// Validar skills
	skills := req.Skills
	if skills == nil {
		skills = []models.Skill{}
	}

	// ✅ Actualizar TODOS los campos incluyendo Nivel 1
	// ⚠️ NO tocamos currentHp ni conditions (se manejan en combate)
	updates := []firestore.Update{
		// Basic Info
		{Path: "name", Value: req.Name},
		{Path: "class", Value: req.Class},
		{Path: "level", Value: req.Level},

		// Combat Stats (solo maxHp, AC, initiative, speed)
		{Path: "maxHp", Value: req.MaxHP},
		{Path: "armorClass", Value: req.ArmorClass},
		{Path: "initiative", Value: req.Initiative},
		{Path: "speed", Value: req.Speed},

		// ===== NIVEL 1: Ability Scores =====
		{Path: "abilityScores", Value: req.AbilityScores},

		// ===== NIVEL 1: Proficiencies =====
		{Path: "proficiencyBonus", Value: proficiencyBonus},
		{Path: "savingThrows", Value: req.SavingThrows},
		{Path: "skills", Value: skills},

		// Metadata
		{Path: "updatedAt", Value: time.Now()},
	}

	if _, err := h.db.Collection("characters").Doc(charID).Update(ctx, updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando personaje"})
		return
	}

	// Obtener personaje actualizado
	updatedDoc, _ := h.db.Collection("characters").Doc(charID).Get(ctx)
	var updated models.Character
	updatedDoc.DataTo(&updated)

	c.JSON(http.StatusOK, updated)
}

// DeleteCharacter - Eliminar un personaje
func (h *Handler) DeleteCharacter(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	charID := c.Param("charId")
	ctx := context.Background()

	charDoc, err := h.db.Collection("characters").Doc(charID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Personaje no encontrado"})
		return
	}

	var char models.Character
	if err := charDoc.DataTo(&char); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando personaje"})
		return
	}

	// Verificar permisos
	campaignDoc, _ := h.db.Collection("events").Doc(char.CampaignID).Get(ctx)
	var campaign models.Campaign
	campaignDoc.DataTo(&campaign)

	if char.UserID != uid && campaign.DmID != uid {
		c.JSON(http.StatusForbidden, gin.H{"error": "No tienes permisos para eliminar este personaje"})
		return
	}

	if _, err := h.db.Collection("characters").Doc(charID).Delete(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando personaje"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Personaje eliminado"})
}
