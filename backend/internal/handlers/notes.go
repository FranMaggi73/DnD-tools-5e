package handlers

import (
	"context"
	"net/http"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/iterator"

	"github.com/FranMaggi73/dm-events-backend/internal/models"
)

// ===========================
// NOTAS
// ===========================

// CreateNote - Crear una nueva nota
func (h *Handler) CreateNote(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	campaignId := c.Param("id")
	ctx := context.Background()

	var req models.CreateNoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verificar que el usuario es miembro de la campaña
	memberIter := h.db.Collection("event_members").
		Where("campaignId", "==", campaignId).
		Where("userId", "==", uid).
		Limit(1).
		Documents(ctx)

	memberDoc, err := memberIter.Next()
	if err == iterator.Done {
		c.JSON(http.StatusForbidden, gin.H{"error": "No eres miembro de esta campaña"})
		return
	}

	var member models.CampaignMember
	memberDoc.DataTo(&member)

	// Si isShared=true, verificar que es DM
	if req.IsShared {
		campaignDoc, err := h.db.Collection("events").Doc(campaignId).Get(ctx)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Campaña no encontrada"})
			return
		}

		var campaign models.Campaign
		campaignDoc.DataTo(&campaign)

		if campaign.DmID != uid {
			c.JSON(http.StatusForbidden, gin.H{"error": "Solo el DM puede crear notas compartidas"})
			return
		}
	}

	// Obtener nombre del usuario
	userDoc, err := h.db.Collection("users").Doc(uid).Get(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo usuario"})
		return
	}

	var user models.User
	userDoc.DataTo(&user)

	// Crear nota
	noteRef := h.db.Collection("notes").NewDoc()
	note := models.Note{
		ID:         noteRef.ID,
		CampaignID: campaignId,
		AuthorID:   uid,
		AuthorName: user.DisplayName,
		Title:      req.Title,
		Content:    req.Content,
		IsShared:   req.IsShared,
		Category:   req.Category,
		Tags:       req.Tags,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	if note.Tags == nil {
		note.Tags = []string{}
	}

	if _, err := noteRef.Set(ctx, note); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando nota"})
		return
	}

	c.JSON(http.StatusCreated, note)
}

// GetCampaignNotes - Obtener todas las notas de una campaña
// Devuelve: notas personales del usuario + notas compartidas del DM
func (h *Handler) GetCampaignNotes(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	campaignId := c.Param("id")
	ctx := context.Background()

	// Verificar que es miembro
	memberIter := h.db.Collection("event_members").
		Where("campaignId", "==", campaignId).
		Where("userId", "==", uid).
		Limit(1).
		Documents(ctx)

	_, err := memberIter.Next()
	if err == iterator.Done {
		c.JSON(http.StatusForbidden, gin.H{"error": "No eres miembro de esta campaña"})
		return
	}

	var notes []models.Note

	// 1. Obtener notas personales del usuario
	personalIter := h.db.Collection("notes").
		Where("campaignId", "==", campaignId).
		Where("authorId", "==", uid).
		Where("isShared", "==", false).
		Documents(ctx)

	for {
		doc, err := personalIter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			continue
		}

		var note models.Note
		if err := doc.DataTo(&note); err != nil {
			continue
		}
		notes = append(notes, note)
	}

	// 2. Obtener notas compartidas (del DM)
	sharedIter := h.db.Collection("notes").
		Where("campaignId", "==", campaignId).
		Where("isShared", "==", true).
		Documents(ctx)

	for {
		doc, err := sharedIter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			continue
		}

		var note models.Note
		if err := doc.DataTo(&note); err != nil {
			continue
		}
		notes = append(notes, note)
	}

	if notes == nil {
		notes = []models.Note{}
	}

	c.JSON(http.StatusOK, notes)
}

// GetNote - Obtener una nota específica
func (h *Handler) GetNote(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	noteId := c.Param("noteId")
	ctx := context.Background()

	noteDoc, err := h.db.Collection("notes").Doc(noteId).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Nota no encontrada"})
		return
	}

	var note models.Note
	if err := noteDoc.DataTo(&note); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando nota"})
		return
	}

	// Verificar permisos: autor o nota compartida
	if note.AuthorID != uid && !note.IsShared {
		c.JSON(http.StatusForbidden, gin.H{"error": "No tienes permisos para ver esta nota"})
		return
	}

	c.JSON(http.StatusOK, note)
}

// UpdateNote - Actualizar una nota
func (h *Handler) UpdateNote(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	noteId := c.Param("noteId")
	ctx := context.Background()

	var req models.UpdateNoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	noteDoc, err := h.db.Collection("notes").Doc(noteId).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Nota no encontrada"})
		return
	}

	var note models.Note
	if err := noteDoc.DataTo(&note); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando nota"})
		return
	}

	// Solo el autor puede editar
	if note.AuthorID != uid {
		c.JSON(http.StatusForbidden, gin.H{"error": "No tienes permisos para editar esta nota"})
		return
	}

	// Si intenta cambiar isShared, verificar que es DM
	if req.IsShared != note.IsShared {
		campaignDoc, err := h.db.Collection("events").Doc(note.CampaignID).Get(ctx)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Campaña no encontrada"})
			return
		}

		var campaign models.Campaign
		campaignDoc.DataTo(&campaign)

		if campaign.DmID != uid {
			c.JSON(http.StatusForbidden, gin.H{"error": "Solo el DM puede cambiar el estado compartido"})
			return
		}
	}

	updates := []firestore.Update{
		{Path: "updatedAt", Value: time.Now()},
	}

	if req.Title != "" {
		updates = append(updates, firestore.Update{Path: "title", Value: req.Title})
	}
	if req.Content != "" {
		updates = append(updates, firestore.Update{Path: "content", Value: req.Content})
	}
	updates = append(updates, firestore.Update{Path: "isShared", Value: req.IsShared})
	if req.Category != "" {
		updates = append(updates, firestore.Update{Path: "category", Value: req.Category})
	}
	if req.Tags != nil {
		updates = append(updates, firestore.Update{Path: "tags", Value: req.Tags})
	}

	if _, err := h.db.Collection("notes").Doc(noteId).Update(ctx, updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando nota"})
		return
	}

	// Obtener nota actualizada
	updatedDoc, _ := h.db.Collection("notes").Doc(noteId).Get(ctx)
	var updated models.Note
	updatedDoc.DataTo(&updated)

	c.JSON(http.StatusOK, updated)
}

// DeleteNote - Eliminar una nota
func (h *Handler) DeleteNote(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	noteId := c.Param("noteId")
	ctx := context.Background()

	noteDoc, err := h.db.Collection("notes").Doc(noteId).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Nota no encontrada"})
		return
	}

	var note models.Note
	if err := noteDoc.DataTo(&note); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando nota"})
		return
	}

	// Solo el autor puede eliminar
	if note.AuthorID != uid {
		c.JSON(http.StatusForbidden, gin.H{"error": "No tienes permisos para eliminar esta nota"})
		return
	}

	if _, err := h.db.Collection("notes").Doc(noteId).Delete(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando nota"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Nota eliminada"})
}
