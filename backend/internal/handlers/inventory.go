// backend/internal/handlers/inventory.go
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
// INVENTORY ITEMS
// ===========================

// CreateItem - Agregar item al inventario
func (h *Handler) CreateItem(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	characterID := c.Param("charId")
	ctx := context.Background()

	var req models.CreateItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verificar que el personaje existe y pertenece al usuario
	charDoc, err := h.db.Collection("characters").Doc(characterID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Personaje no encontrado"})
		return
	}

	var character models.Character
	if err := charDoc.DataTo(&character); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando personaje"})
		return
	}

	// Verificar permisos (dueño o DM)
	if character.UserID != uid {
		campaignDoc, err := h.db.Collection("events").Doc(character.CampaignID).Get(ctx)
		if err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "Sin permisos"})
			return
		}

		var campaign models.Campaign
		if err := campaignDoc.DataTo(&campaign); err != nil || campaign.DmID != uid {
			c.JSON(http.StatusForbidden, gin.H{"error": "Solo el dueño o el DM pueden agregar items"})
			return
		}
	}

	// Crear item
	itemRef := h.db.Collection("inventory_items").NewDoc()
	item := models.InventoryItem{
		ID:          itemRef.ID,
		CharacterID: characterID,
		CampaignID:  character.CampaignID,
		Name:        req.Name,
		Type:        models.ItemType(req.Type),
		Description: req.Description,
		Quantity:    req.Quantity,
		Weight:      req.Weight,
		Value:       req.Value,
		Equipped:    false,
		Attuned:     false,
		WeaponData:  req.WeaponData,
		ArmorData:   req.ArmorData,
		Open5eSlug:  req.Open5eSlug,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if _, err := itemRef.Set(ctx, item); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando item"})
		return
	}

	c.JSON(http.StatusCreated, item)
}

// GetCharacterInventory - Obtener inventario completo de un personaje
func (h *Handler) GetCharacterInventory(c *gin.Context) {
	characterID := c.Param("charId")
	ctx := context.Background()

	// Obtener personaje para calcular carrying capacity
	charDoc, err := h.db.Collection("characters").Doc(characterID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Personaje no encontrado"})
		return
	}

	var character models.Character
	if err := charDoc.DataTo(&character); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando personaje"})
		return
	}

	// Obtener items
	itemsIter := h.db.Collection("inventory_items").
		Where("characterId", "==", characterID).
		Documents(ctx)

	var items []models.InventoryItem
	totalWeight := 0.0
	totalValue := 0.0

	for {
		doc, err := itemsIter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo items"})
			return
		}

		var item models.InventoryItem
		if err := doc.DataTo(&item); err != nil {
			continue
		}

		items = append(items, item)
		totalWeight += item.Weight * float64(item.Quantity)
		totalValue += item.Value * float64(item.Quantity)
	}

	if items == nil {
		items = []models.InventoryItem{}
	}

	// Obtener currency
	currency := models.Currency{} // Default 0s
	currencyDoc, err := h.db.Collection("currencies").Doc(characterID).Get(ctx)
	if err == nil {
		currencyDoc.DataTo(&currency)
		// Agregar valor de la moneda al total
		totalValue += float64(currency.Copper)/100.0 +
			float64(currency.Silver)/10.0 +
			float64(currency.Gold) +
			float64(currency.Platinum)*10.0
	}

	// Calcular capacidad (STR * 15)
	capacity := character.AbilityScores.Strength * 15
	encumbered := totalWeight > float64(capacity)/2.0
	heavilyEncumbered := totalWeight > float64(capacity)

	response := models.InventoryResponse{
		Items:             items,
		Currency:          currency,
		CarryingCapacity:  capacity,
		TotalWeight:       totalWeight,
		TotalValue:        totalValue,
		Encumbered:        encumbered,
		HeavilyEncumbered: heavilyEncumbered,
	}

	c.JSON(http.StatusOK, response)
}

// UpdateItem - Actualizar item (cantidad, equipped, attuned)
func (h *Handler) UpdateItem(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	itemID := c.Param("itemId")
	ctx := context.Background()

	var req models.UpdateItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Obtener item
	itemDoc, err := h.db.Collection("inventory_items").Doc(itemID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Item no encontrado"})
		return
	}

	var item models.InventoryItem
	if err := itemDoc.DataTo(&item); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parseando item"})
		return
	}

	// Verificar permisos
	charDoc, _ := h.db.Collection("characters").Doc(item.CharacterID).Get(ctx)
	var character models.Character
	charDoc.DataTo(&character)

	if character.UserID != uid {
		campaignDoc, _ := h.db.Collection("events").Doc(character.CampaignID).Get(ctx)
		var campaign models.Campaign
		if campaignDoc.DataTo(&campaign) != nil || campaign.DmID != uid {
			c.JSON(http.StatusForbidden, gin.H{"error": "Sin permisos"})
			return
		}
	}

	// Actualizar campos
	updates := []firestore.Update{
		{Path: "updatedAt", Value: time.Now()},
	}

	if req.Quantity != nil {
		if *req.Quantity <= 0 {
			// Si la cantidad es 0 o negativa, eliminar el item
			if _, err := h.db.Collection("inventory_items").Doc(itemID).Delete(ctx); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando item"})
				return
			}
			c.JSON(http.StatusOK, gin.H{"message": "Item eliminado"})
			return
		}
		updates = append(updates, firestore.Update{Path: "quantity", Value: *req.Quantity})
	}

	if req.Equipped != nil {
		updates = append(updates, firestore.Update{Path: "equipped", Value: *req.Equipped})
	}

	if req.Attuned != nil {
		updates = append(updates, firestore.Update{Path: "attuned", Value: *req.Attuned})
	}

	if _, err := h.db.Collection("inventory_items").Doc(itemID).Update(ctx, updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando item"})
		return
	}

	// Obtener item actualizado
	updatedDoc, _ := h.db.Collection("inventory_items").Doc(itemID).Get(ctx)
	var updated models.InventoryItem
	updatedDoc.DataTo(&updated)

	c.JSON(http.StatusOK, updated)
}

// DeleteItem - Eliminar item del inventario
func (h *Handler) DeleteItem(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	itemID := c.Param("itemId")
	ctx := context.Background()

	// Obtener item
	itemDoc, err := h.db.Collection("inventory_items").Doc(itemID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Item no encontrado"})
		return
	}

	var item models.InventoryItem
	itemDoc.DataTo(&item)

	// Verificar permisos
	charDoc, _ := h.db.Collection("characters").Doc(item.CharacterID).Get(ctx)
	var character models.Character
	charDoc.DataTo(&character)

	if character.UserID != uid {
		campaignDoc, _ := h.db.Collection("events").Doc(character.CampaignID).Get(ctx)
		var campaign models.Campaign
		if campaignDoc.DataTo(&campaign) != nil || campaign.DmID != uid {
			c.JSON(http.StatusForbidden, gin.H{"error": "Sin permisos"})
			return
		}
	}

	if _, err := h.db.Collection("inventory_items").Doc(itemID).Delete(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando item"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item eliminado"})
}

// ===========================
// CURRENCY
// ===========================

// UpdateCurrency - Actualizar moneda del personaje
func (h *Handler) UpdateCurrency(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	characterID := c.Param("charId")
	ctx := context.Background()

	var req models.UpdateCurrencyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verificar permisos
	charDoc, err := h.db.Collection("characters").Doc(characterID).Get(ctx)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Personaje no encontrado"})
		return
	}

	var character models.Character
	charDoc.DataTo(&character)

	if character.UserID != uid {
		campaignDoc, _ := h.db.Collection("events").Doc(character.CampaignID).Get(ctx)
		var campaign models.Campaign
		if campaignDoc.DataTo(&campaign) != nil || campaign.DmID != uid {
			c.JSON(http.StatusForbidden, gin.H{"error": "Sin permisos"})
			return
		}
	}

	// Obtener currency actual o crear nueva
	currencyRef := h.db.Collection("currencies").Doc(characterID)
	currencyDoc, err := currencyRef.Get(ctx)

	if err != nil {
		// No existe, crear nueva
		currency := models.Currency{
			Copper:   0,
			Silver:   0,
			Gold:     0,
			Platinum: 0,
		}

		if req.Copper != nil {
			currency.Copper = *req.Copper
		}
		if req.Silver != nil {
			currency.Silver = *req.Silver
		}
		if req.Gold != nil {
			currency.Gold = *req.Gold
		}
		if req.Platinum != nil {
			currency.Platinum = *req.Platinum
		}

		if _, err := currencyRef.Set(ctx, currency); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando currency"})
			return
		}

		c.JSON(http.StatusOK, currency)
		return
	}

	// Ya existe, actualizar
	var currency models.Currency
	currencyDoc.DataTo(&currency)

	if req.Copper != nil {
		currency.Copper = *req.Copper
	}
	if req.Silver != nil {
		currency.Silver = *req.Silver
	}
	if req.Gold != nil {
		currency.Gold = *req.Gold
	}
	if req.Platinum != nil {
		currency.Platinum = *req.Platinum
	}

	// Validar que no sean negativos
	if currency.Copper < 0 || currency.Silver < 0 ||
		currency.Gold < 0 || currency.Platinum < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "La moneda no puede ser negativa"})
		return
	}

	if _, err := currencyRef.Set(ctx, currency); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando currency"})
		return
	}

	c.JSON(http.StatusOK, currency)
}
