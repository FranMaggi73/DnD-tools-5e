// backend/internal/handlers/inventory.go
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
// INVENTORY ITEMS
// ===========================

const (
	MAX_ITEMS_PER_CHARACTER = 500 // ✅ NUEVO
)

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

	itemsIter := h.db.Collection("inventory_items").
		Where("characterId", "==", characterID).
		Documents(ctx)

	itemCount := 0
	for {
		_, err := itemsIter.Next()
		if err == iterator.Done {
			break
		}
		if err == nil {
			itemCount++
		}
	}

	if itemCount >= MAX_ITEMS_PER_CHARACTER {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("Límite de items alcanzado (%d/%d). Elimina items antes de agregar más.",
				itemCount, MAX_ITEMS_PER_CHARACTER),
		})
		return
	}

	if req.Open5eSlug != "" {
		// Buscar por slug de Open5e
		existingIter := h.db.Collection("inventory_items").
			Where("characterId", "==", characterID).
			Where("open5eSlug", "==", req.Open5eSlug).
			Limit(1).
			Documents(ctx)

		if existingDoc, err := existingIter.Next(); err != iterator.Done {
			// Item idéntico encontrado, incrementar quantity
			var existing models.InventoryItem
			if err := existingDoc.DataTo(&existing); err == nil {
				newQuantity := existing.Quantity + req.Quantity

				_, updateErr := h.db.Collection("inventory_items").Doc(existing.ID).Update(ctx, []firestore.Update{
					{Path: "quantity", Value: newQuantity},
					{Path: "updatedAt", Value: time.Now()},
				})

				if updateErr == nil {
					// Invalidar cache
					h.invalidateCharacterCache(ctx, characterID)

					// Devolver item actualizado
					existing.Quantity = newQuantity
					existing.UpdatedAt = time.Now()
					c.JSON(http.StatusCreated, existing)
					return
				}
			}
		}
	} else {
		// Buscar por nombre exacto (para items manuales)
		existingIter := h.db.Collection("inventory_items").
			Where("characterId", "==", characterID).
			Where("name", "==", req.Name).
			Where("type", "==", req.Type).
			Limit(1).
			Documents(ctx)

		if existingDoc, err := existingIter.Next(); err != iterator.Done {
			var existing models.InventoryItem
			if err := existingDoc.DataTo(&existing); err == nil {
				// Solo stackear si NO tiene datos de arma/armadura
				if existing.WeaponData == nil && existing.ArmorData == nil {
					newQuantity := existing.Quantity + req.Quantity

					_, updateErr := h.db.Collection("inventory_items").Doc(existing.ID).Update(ctx, []firestore.Update{
						{Path: "quantity", Value: newQuantity},
						{Path: "updatedAt", Value: time.Now()},
					})

					if updateErr == nil {
						h.invalidateCharacterCache(ctx, characterID)

						existing.Quantity = newQuantity
						existing.UpdatedAt = time.Now()
						c.JSON(http.StatusCreated, existing)
						return
					}
				}
			}
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
		Value:       req.Value,
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
	h.invalidateCharacterCache(ctx, characterID)

	c.JSON(http.StatusCreated, item)
}

// GetCharacterInventory - Obtener inventario completo de un personaje
func (h *Handler) GetCharacterInventory(c *gin.Context) {
	characterID := c.Param("charId")
	ctx := context.Background()

	if cached, cachedAt, found := h.cache.GetInventory(characterID); found {
		// Validar que tenga menos de 15 segundos
		if time.Since(cachedAt) < 15*time.Second {
			c.JSON(http.StatusOK, cached)
			return
		}
	}

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

	response := models.InventoryResponse{
		Items:      items,
		Currency:   currency,
		TotalValue: totalValue,
	}

	h.cache.SetInventory(characterID, response)

	c.JSON(http.StatusOK, response)
}

// UpdateItem - Actualizar item (cantidad)
func (h *Handler) UpdateItem(c *gin.Context) {
	uid := c.GetString("uid")
	if uid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	itemID := c.Param("itemId")
	ctx := context.Background()

	var req struct {
		Name        *string  `json:"name"`
		Description *string  `json:"description"`
		Quantity    *int     `json:"quantity"`
		Value       *float64 `json:"value"`
	}

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

	// Construir updates
	updates := []firestore.Update{
		{Path: "updatedAt", Value: time.Now()},
	}

	if req.Name != nil && *req.Name != "" {
		updates = append(updates, firestore.Update{Path: "name", Value: *req.Name})
	}

	if req.Description != nil {
		updates = append(updates, firestore.Update{Path: "description", Value: *req.Description})
	}

	if req.Quantity != nil {
		if *req.Quantity <= 0 {
			// Si la cantidad es 0 o negativa, eliminar el item
			if _, err := h.db.Collection("inventory_items").Doc(itemID).Delete(ctx); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando item"})
				return
			}
			h.invalidateCharacterCache(ctx, item.CharacterID)

			c.JSON(http.StatusOK, gin.H{"message": "Item eliminado", "deleted": true})
			return
		}
		updates = append(updates, firestore.Update{Path: "quantity", Value: *req.Quantity})
	}

	if req.Value != nil && *req.Value >= 0 {
		updates = append(updates, firestore.Update{Path: "value", Value: *req.Value})
	}

	if _, err := h.db.Collection("inventory_items").Doc(itemID).Update(ctx, updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando item"})
		return
	}

	h.invalidateCharacterCache(ctx, item.CharacterID)

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

	const MAX_CURRENCY = 999999999
	if currency.Copper > MAX_CURRENCY || currency.Silver > MAX_CURRENCY ||
		currency.Gold > MAX_CURRENCY || currency.Platinum > MAX_CURRENCY {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("El máximo de monedas por tipo es %d", MAX_CURRENCY),
		})
		return
	}

	if _, err := currencyRef.Set(ctx, currency); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando currency"})
		return
	}
	h.invalidateCharacterCache(ctx, characterID) // 👈 AGREGAR

	c.JSON(http.StatusOK, currency)
}
