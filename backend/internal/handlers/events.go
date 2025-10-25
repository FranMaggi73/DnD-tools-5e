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
// CAMPAÑAS CON BATCH READS
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

	// Invalidar caché
	h.cache.InvalidateCampaign(campaign.ID)

	c.JSON(http.StatusCreated, campaign)
}

// ✅ OPTIMIZADO: GetUserEvents con batch reads
func (h *Handler) GetUserEvents(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	ctx := context.Background()

	// Obtener IDs de campañas del usuario
	memberIter := h.db.Collection("event_members").
		Where("userId", "==", uid).
		Documents(ctx)

	eventIDs := make([]string, 0)
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
		eventIDs = append(eventIDs, member.CampaignID)
	}

	if len(eventIDs) == 0 {
		c.JSON(http.StatusOK, []models.Campaign{})
		return
	}

	// ✅ BATCH READ: Obtener todas las campañas en una sola operación
	campaigns := make([]models.Campaign, 0, len(eventIDs))

	// Firestore limita a 10 documentos por batch, dividimos si es necesario
	batchSize := 10
	for i := 0; i < len(eventIDs); i += batchSize {
		end := i + batchSize
		if end > len(eventIDs) {
			end = len(eventIDs)
		}

		batch := eventIDs[i:end]
		refs := make([]*firestore.DocumentRef, len(batch))
		for j, id := range batch {
			refs[j] = h.db.Collection("events").Doc(id)
		}

		docs, err := h.db.GetAll(ctx, refs)
		if err != nil {
			log.Printf("Error in batch read: %v", err)
			continue
		}

		for _, doc := range docs {
			if doc.Exists() {
				var campaign models.Campaign
				if err := doc.DataTo(&campaign); err == nil {
					campaigns = append(campaigns, campaign)
				}
			}
		}
	}

	c.JSON(http.StatusOK, campaigns)
}

func (h *Handler) GetEvent(c *gin.Context) {
	eventID := c.Param("id")
	ctx := context.Background()

	// Intentar obtener de caché
	if cached, found := h.cache.GetCampaign(eventID); found {
		c.JSON(http.StatusOK, cached)
		return
	}

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

	// Guardar en caché
	h.cache.SetCampaign(&campaign)

	c.JSON(http.StatusOK, campaign)
}

// ===========================
// ✅ ARREGLADO: DeleteEvent - ELIMINACIÓN COMPLETA
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

	log.Printf("🗑️ Iniciando eliminación COMPLETA de campaña: %s", eventID)

	// ===== ELIMINACIÓN EN CASCADA CON BATCHES OPTIMIZADOS =====
	var totalDeleted int

	// 1. Eliminar encuentros y sus combatientes
	encountersIter := h.db.Collection("encounters").
		Where("campaignId", "==", eventID).
		Documents(ctx)

	encounterBatch := h.db.Batch()
	encounterCount := 0

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

		// Eliminar combatientes del encuentro
		combatantsIter := h.db.Collection("combatants").
			Where("encounterId", "==", encounterId).
			Documents(ctx)

		for {
			combatantDoc, err := combatantsIter.Next()
			if err == iterator.Done {
				break
			}
			if err == nil {
				encounterBatch.Delete(combatantDoc.Ref)
				encounterCount++

				// Firestore batch limit es 500
				if encounterCount >= 400 {
					if _, err := encounterBatch.Commit(ctx); err != nil {
						log.Printf("Error en batch commit: %v", err)
					}
					totalDeleted += encounterCount
					encounterBatch = h.db.Batch()
					encounterCount = 0
				}
			}
		}

		// Eliminar el encuentro
		encounterBatch.Delete(encounterDoc.Ref)
		encounterCount++

		if encounterCount >= 400 {
			if _, err := encounterBatch.Commit(ctx); err != nil {
				log.Printf("Error en batch commit: %v", err)
			}
			totalDeleted += encounterCount
			encounterBatch = h.db.Batch()
			encounterCount = 0
		}
	}

	// Commit batch final de encuentros
	if encounterCount > 0 {
		if _, err := encounterBatch.Commit(ctx); err != nil {
			log.Printf("Error en batch commit final: %v", err)
		}
		totalDeleted += encounterCount
	}

	// 2. Eliminar personajes
	charactersBatch := h.db.Batch()
	charCount := 0

	charactersIter := h.db.Collection("characters").
		Where("campaignId", "==", eventID).
		Documents(ctx)

	for {
		charDoc, err := charactersIter.Next()
		if err == iterator.Done {
			break
		}
		if err == nil {
			charactersBatch.Delete(charDoc.Ref)
			charCount++

			if charCount >= 400 {
				if _, err := charactersBatch.Commit(ctx); err != nil {
					log.Printf("Error en batch commit: %v", err)
				}
				totalDeleted += charCount
				charactersBatch = h.db.Batch()
				charCount = 0
			}
		}
	}

	if charCount > 0 {
		if _, err := charactersBatch.Commit(ctx); err != nil {
			log.Printf("Error en batch commit: %v", err)
		}
		totalDeleted += charCount
	}

	// 3. Eliminar invitaciones
	invitationsBatch := h.db.Batch()
	invCount := 0

	invitationsIter := h.db.Collection("invitations").
		Where("campaignId", "==", eventID).
		Documents(ctx)

	for {
		invDoc, err := invitationsIter.Next()
		if err == iterator.Done {
			break
		}
		if err == nil {
			invitationsBatch.Delete(invDoc.Ref)
			invCount++

			if invCount >= 400 {
				if _, err := invitationsBatch.Commit(ctx); err != nil {
					log.Printf("Error en batch commit: %v", err)
				}
				totalDeleted += invCount
				invitationsBatch = h.db.Batch()
				invCount = 0
			}
		}
	}

	if invCount > 0 {
		if _, err := invitationsBatch.Commit(ctx); err != nil {
			log.Printf("Error en batch commit: %v", err)
		}
		totalDeleted += invCount
	}

	// 4. Eliminar miembros
	membersBatch := h.db.Batch()
	memberCount := 0

	membersIter := h.db.Collection("event_members").
		Where("campaignId", "==", eventID).
		Documents(ctx)

	for {
		memberDoc, err := membersIter.Next()
		if err == iterator.Done {
			break
		}
		if err == nil {
			membersBatch.Delete(memberDoc.Ref)
			memberCount++

			if memberCount >= 400 {
				if _, err := membersBatch.Commit(ctx); err != nil {
					log.Printf("Error en batch commit: %v", err)
				}
				totalDeleted += memberCount
				membersBatch = h.db.Batch()
				memberCount = 0
			}
		}
	}

	if memberCount > 0 {
		if _, err := membersBatch.Commit(ctx); err != nil {
			log.Printf("Error en batch commit: %v", err)
		}
		totalDeleted += memberCount
	}

	// 5. Eliminar la campaña y decrementar contador
	if _, err := h.db.Collection("events").Doc(eventID).Delete(ctx); err != nil {
		log.Printf("Error eliminando campaña: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando campaña"})
		return
	}
	totalDeleted++

	// 6. Actualizar contador del usuario
	userRef := h.db.Collection("users").Doc(uid)
	if _, err := userRef.Update(ctx, []firestore.Update{
		{Path: "campaignCount", Value: firestore.Increment(-1)},
	}); err != nil {
		log.Printf("Error decrementando campaignCount: %v", err)
	}

	// Invalidar caché
	h.cache.InvalidateCampaign(eventID)

	log.Printf("✅ Eliminación COMPLETA exitosa: %d documentos eliminados", totalDeleted)

	c.JSON(http.StatusOK, gin.H{
		"message":          "Campaña eliminada exitosamente",
		"deletedDocuments": totalDeleted,
	})
}

// ===========================
// PARTICIPANTES
// ===========================

func (h *Handler) GetEventMembers(c *gin.Context) {
	eventID := c.Param("id")
	ctx := context.Background()

	// Intentar obtener de caché
	if cached, found := h.cache.GetMembers(eventID); found {
		var dm *models.CampaignMember
		var players []models.CampaignMember
		for _, m := range cached {
			if m.Role == "dm" {
				dm = &m
			} else {
				players = append(players, m)
			}
		}
		c.JSON(http.StatusOK, gin.H{"dm": dm, "players": players})
		return
	}

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

	// Guardar en caché
	h.cache.SetMembers(eventID, members)

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

	log.Printf("🗑️ Removiendo jugador %s de campaña %s", playerID, eventID)

	// ✅ BATCH: Eliminar personajes del jugador
	batch := h.db.Batch()
	batchCount := 0

	charactersIter := h.db.Collection("characters").
		Where("campaignId", "==", eventID).
		Where("userId", "==", playerID).
		Documents(ctx)

	for {
		charDoc, err := charactersIter.Next()
		if err == iterator.Done {
			break
		}
		if err == nil {
			batch.Delete(charDoc.Ref)
			batchCount++
		}
	}

	// Eliminar miembro de event_members
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

	batch.Delete(doc.Ref)
	batchCount++

	// Commit batch
	if _, err := batch.Commit(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando jugador"})
		return
	}

	// Actualizar playerIds en campaña
	if _, err := h.db.Collection("events").Doc(eventID).Update(ctx, []firestore.Update{
		{Path: "playerIds", Value: firestore.ArrayRemove(playerID)},
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando playerIds"})
		return
	}

	// Invalidar caché
	h.cache.InvalidateCampaign(eventID)

	log.Printf("✅ Jugador removido. Documentos eliminados: %d", batchCount)

	c.JSON(http.StatusOK, gin.H{
		"message":          "Jugador eliminado",
		"deletedDocuments": batchCount,
	})
}
