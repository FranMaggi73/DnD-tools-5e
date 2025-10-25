package handlers

import (
	"context"
	"log"
	"net/http"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/iterator"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/FranMaggi73/dm-events-backend/internal/models"
)

// ===========================
// USUARIOS
// ===========================

func (h *Handler) GetCurrentUser(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing uid (not authenticated)"})
		return
	}
	ctx := context.Background()

	doc, err := h.db.Collection("users").Doc(uid).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
		return
	}

	var user models.User
	if err := doc.DataTo(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando usuario"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// ===========================
// CAMPAÑAS
// ===========================

func (h *Handler) CreateEvent(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing uid (not authenticated)"})
		return
	}
	ctx := context.Background()

	var req models.CreateCampaignRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userRef := h.db.Collection("users").Doc(uid)
	userDoc, err := userRef.Get(ctx)
	var user models.User

	if err != nil {
		if status.Code(err) == codes.NotFound {
			log.Printf("CreateEvent: users doc not found for uid=%s, creating from Auth", uid)

			fbUser, authErr := h.auth.GetUser(ctx, uid)
			if authErr != nil {
				log.Printf("CreateEvent: failed to GetUser from Auth for uid=%s: %v", uid, authErr)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo usuario desde Auth"})
				return
			}

			newUser := models.User{
				UID:           uid,
				Email:         fbUser.Email,
				DisplayName:   fbUser.DisplayName,
				PhotoURL:      fbUser.PhotoURL,
				CreatedAt:     time.Now(),
				CampaignCount: 0,
			}

			if _, err := userRef.Set(ctx, newUser); err != nil {
				log.Printf("CreateEvent: failed to create users doc for uid=%s: %v", uid, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando usuario"})
				return
			}

			user = newUser
		} else {
			log.Printf("CreateEvent: error getting users doc uid=%s: %v", uid, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo usuario"})
			return
		}
	} else {
		if err := userDoc.DataTo(&user); err != nil {
			log.Printf("CreateEvent: DataTo user failed uid=%s: %v", uid, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando usuario"})
			return
		}
	}

	if user.CampaignCount >= 3 {
		c.JSON(http.StatusForbidden, gin.H{"error": "Has alcanzado el límite de 3 campañas"})
		return
	}

	campaignRef := h.db.Collection("events").NewDoc()
	campaign := models.Campaign{
		ID:        campaignRef.ID,
		Name:      req.Name,
		DmID:      uid,
		DmName:    user.DisplayName,
		DmPhoto:   user.PhotoURL,
		CreatedAt: time.Now(),
		PlayerIDs: []string{},
	}

	err = h.db.RunTransaction(ctx, func(ctx context.Context, tx *firestore.Transaction) error {
		if err := tx.Set(campaignRef, campaign); err != nil {
			return err
		}

		memberRef := h.db.Collection("event_members").NewDoc()
		member := models.CampaignMember{
			CampaignID: campaign.ID,
			UserID:     uid,
			Role:       "dm",
			UserName:   user.DisplayName,
			UserPhoto:  user.PhotoURL,
			JoinedAt:   time.Now(),
		}
		if err := tx.Set(memberRef, member); err != nil {
			return err
		}

		userRef := h.db.Collection("users").Doc(uid)
		return tx.Update(userRef, []firestore.Update{
			{Path: "campaignCount", Value: firestore.Increment(1)},
		})
	})

	if err != nil {
		log.Printf("CreateEvent: transaction failed uid=%s err=%v", uid, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando campaña"})
		return
	}

	c.JSON(http.StatusCreated, campaign)
}

func (h *Handler) GetUserEvents(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	ctx := context.Background()

	memberIter := h.db.Collection("event_members").
		Where("userId", "==", uid).
		Documents(ctx)

	eventIDs := make(map[string]bool)
	for {
		doc, err := memberIter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error buscando campañas"})
			return
		}

		var member models.CampaignMember
		if err := doc.DataTo(&member); err != nil {
			continue
		}
		eventIDs[member.CampaignID] = true
	}

	var campaigns []models.Campaign
	for eventID := range eventIDs {
		eventDoc, err := h.db.Collection("events").Doc(eventID).Get(ctx)
		if err != nil {
			continue
		}

		var campaign models.Campaign
		if err := eventDoc.DataTo(&campaign); err != nil {
			continue
		}
		campaigns = append(campaigns, campaign)
	}

	if campaigns == nil {
		campaigns = []models.Campaign{}
	}

	c.JSON(http.StatusOK, campaigns)
}

func (h *Handler) GetEvent(c *gin.Context) {
	eventID := c.Param("id")
	ctx := context.Background()

	doc, err := h.db.Collection("events").Doc(eventID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Campaña no encontrada"})
		return
	}

	var campaign models.Campaign
	if err := doc.DataTo(&campaign); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando campaña"})
		return
	}
	c.JSON(http.StatusOK, campaign)
}

// ===========================
// ELIMINACIÓN EN CASCADA OPTIMIZADA
// ===========================

func (h *Handler) DeleteEvent(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing uid (not authenticated)"})
		return
	}
	eventID := c.Param("id")
	ctx := context.Background()

	eventDoc, err := h.db.Collection("events").Doc(eventID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Campaña no encontrada"})
		return
	}

	var campaign models.Campaign
	if err := eventDoc.DataTo(&campaign); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando campaña"})
		return
	}

	if campaign.DmID != uid {
		c.JSON(http.StatusForbidden, gin.H{"error": "Solo el DM puede eliminar la campaña"})
		return
	}

	log.Printf("🗑️ Iniciando eliminación en cascada de campaña: %s", eventID)

	// ===== ELIMINACIÓN EN CASCADA =====
	var deletedCount int

	// 1. Eliminar encuentros activos e inactivos
	encountersIter := h.db.Collection("encounters").
		Where("campaignId", "==", eventID).
		Documents(ctx)

	for {
		encounterDoc, err := encountersIter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Printf("Error iterando encuentros: %v", err)
			continue
		}

		encounterId := encounterDoc.Ref.ID

		// 1a. Eliminar combatientes del encuentro
		combatantsIter := h.db.Collection("combatants").
			Where("encounterId", "==", encounterId).
			Documents(ctx)

		for {
			combatantDoc, err := combatantsIter.Next()
			if err == iterator.Done {
				break
			}
			if err == nil {
				combatantDoc.Ref.Delete(ctx)
				deletedCount++
			}
		}

		// 1b. Eliminar el encuentro
		encounterDoc.Ref.Delete(ctx)
		deletedCount++
	}

	// 2. Eliminar personajes de la campaña
	charactersIter := h.db.Collection("characters").
		Where("campaignId", "==", eventID).
		Documents(ctx)

	for {
		charDoc, err := charactersIter.Next()
		if err == iterator.Done {
			break
		}
		if err == nil {
			charDoc.Ref.Delete(ctx)
			deletedCount++
		}
	}

	// 3. Eliminar invitaciones pendientes
	invitationsIter := h.db.Collection("invitations").
		Where("campaignId", "==", eventID).
		Documents(ctx)

	for {
		invDoc, err := invitationsIter.Next()
		if err == iterator.Done {
			break
		}
		if err == nil {
			invDoc.Ref.Delete(ctx)
			deletedCount++
		}
	}

	// 4. Eliminar miembros de la campaña
	membersIter := h.db.Collection("event_members").
		Where("campaignId", "==", eventID).
		Documents(ctx)

	for {
		memberDoc, err := membersIter.Next()
		if err == iterator.Done {
			break
		}
		if err == nil {
			memberDoc.Ref.Delete(ctx)
			deletedCount++
		}
	}

	// 5. Eliminar la campaña y decrementar contador
	if _, err := h.db.Collection("events").Doc(eventID).Delete(ctx); err != nil {
		log.Printf("Error eliminando campaña: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando campaña"})
		return
	}
	deletedCount++

	// 6. Actualizar contador del usuario
	userRef := h.db.Collection("users").Doc(uid)
	if _, err := userRef.Update(ctx, []firestore.Update{
		{Path: "campaignCount", Value: firestore.Increment(-1)},
	}); err != nil {
		log.Printf("Error decrementando campaignCount: %v", err)
	}

	log.Printf("✅ Eliminación en cascada completada: %d documentos eliminados", deletedCount)

	c.JSON(http.StatusOK, gin.H{
		"message":          "Campaña eliminada exitosamente",
		"deletedDocuments": deletedCount,
	})
}

// ===========================
// PARTICIPANTES
// ===========================

func (h *Handler) GetEventMembers(c *gin.Context) {
	eventID := c.Param("id")
	ctx := context.Background()

	iter := h.db.Collection("event_members").
		Where("campaignId", "==", eventID).
		Documents(ctx)

	var members []models.CampaignMember
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo miembros"})
			return
		}
		var member models.CampaignMember
		if err := doc.DataTo(&member); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando miembro"})
			return
		}
		members = append(members, member)
	}

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
		"dm":      dm,
		"players": players,
	})
}

func (h *Handler) InvitePlayer(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	eventID := c.Param("id")
	ctx := context.Background()

	var req struct {
		UserEmail string `json:"userEmail" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	eventDoc, err := h.db.Collection("events").Doc(eventID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Campaña no encontrada"})
		return
	}

	var campaign models.Campaign
	if err := eventDoc.DataTo(&campaign); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando campaña"})
		return
	}

	if campaign.DmID != uid {
		c.JSON(http.StatusForbidden, gin.H{"error": "Solo el DM puede invitar jugadores"})
		return
	}

	userRecord, err := h.auth.GetUserByEmail(ctx, req.UserEmail)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado con ese email"})
		return
	}

	playerUID := userRecord.UID

	if playerUID == uid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No puedes invitarte a ti mismo"})
		return
	}

	existingMember := h.db.Collection("event_members").
		Where("campaignId", "==", eventID).
		Where("userId", "==", playerUID).
		Limit(1).
		Documents(ctx)

	_, err = existingMember.Next()
	if err != iterator.Done {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El usuario ya es miembro de la campaña"})
		return
	}

	existingInv := h.db.Collection("invitations").
		Where("campaignId", "==", eventID).
		Where("toUserId", "==", playerUID).
		Where("status", "==", "pending").
		Limit(1).
		Documents(ctx)

	_, err = existingInv.Next()
	if err != iterator.Done {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El usuario ya tiene una invitación pendiente"})
		return
	}

	dmDoc, err := h.db.Collection("users").Doc(uid).Get(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo datos del DM"})
		return
	}

	var dm models.User
	if err := dmDoc.DataTo(&dm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando DM"})
		return
	}

	invRef := h.db.Collection("invitations").NewDoc()
	invitation := models.Invitation{
		ID:           invRef.ID,
		CampaignID:   eventID,
		CampaignName: campaign.Name,
		FromUserID:   uid,
		FromName:     dm.DisplayName,
		FromPhoto:    dm.PhotoURL,
		ToUserID:     playerUID,
		ToEmail:      req.UserEmail,
		Status:       "pending",
		CreatedAt:    time.Now(),
	}

	if _, err := invRef.Set(ctx, invitation); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando invitación"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":    "Invitación enviada exitosamente",
		"invitation": invitation,
	})
}

func (h *Handler) RemovePlayer(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing uid (not authenticated)"})
		return
	}
	eventID := c.Param("id")
	playerID := c.Param("userId")
	ctx := context.Background()

	eventDoc, err := h.db.Collection("events").Doc(eventID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Campaña no encontrada"})
		return
	}

	var campaign models.Campaign
	if err := eventDoc.DataTo(&campaign); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando campaña"})
		return
	}

	if campaign.DmID != uid {
		c.JSON(http.StatusForbidden, gin.H{"error": "Solo el DM puede eliminar jugadores"})
		return
	}

	if playerID == uid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No puedes eliminarte como DM"})
		return
	}

	// ===== ELIMINACIÓN EN CASCADA AL REMOVER JUGADOR =====
	log.Printf("🗑️ Removiendo jugador %s de campaña %s", playerID, eventID)

	// 1. Eliminar personajes del jugador en esta campaña
	charactersIter := h.db.Collection("characters").
		Where("campaignId", "==", eventID).
		Where("userId", "==", playerID).
		Documents(ctx)

	deletedChars := 0
	for {
		charDoc, err := charactersIter.Next()
		if err == iterator.Done {
			break
		}
		if err == nil {
			charDoc.Ref.Delete(ctx)
			deletedChars++
		}
	}

	// 2. Eliminar miembro de event_members
	iter := h.db.Collection("event_members").
		Where("campaignId", "==", eventID).
		Where("userId", "==", playerID).
		Documents(ctx)

	doc, err := iter.Next()
	if err == iterator.Done {
		c.JSON(http.StatusNotFound, gin.H{"error": "Jugador no encontrado"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error buscando jugador"})
		return
	}

	if _, err := doc.Ref.Delete(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando jugador"})
		return
	}

	// 3. Actualizar playerIds en campaña
	if _, err := h.db.Collection("events").Doc(eventID).Update(ctx, []firestore.Update{
		{Path: "playerIds", Value: firestore.ArrayRemove(playerID)},
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando playerIds"})
		return
	}

	log.Printf("✅ Jugador removido. Personajes eliminados: %d", deletedChars)

	c.JSON(http.StatusOK, gin.H{
		"message":           "Jugador eliminado",
		"deletedCharacters": deletedChars,
	})
}
