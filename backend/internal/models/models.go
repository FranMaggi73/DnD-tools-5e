package models

import "time"

// ===========================
// USUARIO
// ===========================

type User struct {
	UID           string    `firestore:"uid" json:"uid"`
	Email         string    `firestore:"email" json:"email"`
	DisplayName   string    `firestore:"displayName" json:"displayName"`
	PhotoURL      string    `firestore:"photoURL" json:"photoURL"`
	CreatedAt     time.Time `firestore:"createdAt" json:"createdAt"`
	CampaignCount int       `firestore:"campaignCount" json:"campaignCount"` // max 3
}

// ===========================
// CAMPAÑA
// ===========================

type Campaign struct {
	ID        string    `firestore:"id" json:"id"`
	Name      string    `firestore:"name" json:"name"`
	DmID      string    `firestore:"dmId" json:"dmId"`
	DmName    string    `firestore:"dmName" json:"dmName"`
	DmPhoto   string    `firestore:"dmPhoto" json:"dmPhoto"`
	CreatedAt time.Time `firestore:"createdAt" json:"createdAt"`
	PlayerIDs []string  `firestore:"playerIds" json:"playerIds"`
}

// Request para crear campaña
type CreateCampaignRequest struct {
	Name string `json:"name" binding:"required,min=3,max=100"`
}

// ===========================
// CAMPAIGN MEMBERS
// ===========================

type CampaignMember struct {
	CampaignID string    `firestore:"campaignId" json:"campaignId"`
	UserID     string    `firestore:"userId" json:"userId"`
	Role       string    `firestore:"role" json:"role"` // "dm" o "player"
	UserName   string    `firestore:"userName" json:"userName"`
	UserPhoto  string    `firestore:"userPhoto" json:"userPhoto"`
	JoinedAt   time.Time `firestore:"joinedAt" json:"joinedAt"`
}

// ===========================
// INVITACIONES
// ===========================

type Invitation struct {
	ID           string    `firestore:"id" json:"id"`
	CampaignID   string    `firestore:"campaignId" json:"campaignId"`
	CampaignName string    `firestore:"campaignName" json:"campaignName"`
	FromUserID   string    `firestore:"fromUserId" json:"fromUserId"`
	FromName     string    `firestore:"fromName" json:"fromName"`
	FromPhoto    string    `firestore:"fromPhoto" json:"fromPhoto"`
	ToUserID     string    `firestore:"toUserId" json:"toUserId"`
	ToEmail      string    `firestore:"toEmail" json:"toEmail"`
	Status       string    `firestore:"status" json:"status"`
	CreatedAt    time.Time `firestore:"createdAt" json:"createdAt"`
	RespondedAt  time.Time `firestore:"respondedAt,omitempty" json:"respondedAt,omitempty"`
}

// ===========================
// PERSONAJES
// ===========================

type Character struct {
	ID         string    `firestore:"id" json:"id"`
	CampaignID string    `firestore:"campaignId" json:"campaignId"`
	UserID     string    `firestore:"userId" json:"userId"` // UID del jugador
	Name       string    `firestore:"name" json:"name"`
	Class      string    `firestore:"class" json:"class"` // Clase(s)
	Level      int       `firestore:"level" json:"level"`
	MaxHP      int       `firestore:"maxHp" json:"maxHp"`
	CurrentHP  int       `firestore:"currentHp" json:"currentHp"`
	ArmorClass int       `firestore:"armorClass" json:"armorClass"`
	Initiative int       `firestore:"initiative" json:"initiative"` // Bonus de iniciativa
	Conditions []string  `firestore:"conditions" json:"conditions"` // 👈 NUEVO: Condiciones persistentes
	ImageURL   string    `firestore:"imageUrl" json:"imageUrl"`
	CreatedAt  time.Time `firestore:"createdAt" json:"createdAt"`
	UpdatedAt  time.Time `firestore:"updatedAt" json:"updatedAt"`
}

// ✅ MODIFICAR CreateCharacterRequest
type CreateCharacterRequest struct {
	Name       string `json:"name" binding:"required,min=2,max=50"`
	Class      string `json:"class" binding:"required,min=2,max=50"`
	Level      int    `json:"level" binding:"required,min=1,max=20"`
	MaxHP      int    `json:"maxHp" binding:"required,min=1,max=999"`
	ArmorClass int    `json:"armorClass" binding:"required,min=1,max=30"`
	Initiative int    `json:"initiative" binding:"min=-5,max=15"`
	ImageURL   string `json:"imageUrl" binding:"max=500"`
}

// ===========================
// ENCUENTROS DE COMBATE
// ===========================

type Encounter struct {
	ID         string    `firestore:"id" json:"id"`
	CampaignID string    `firestore:"campaignId" json:"campaignId"`
	Name       string    `firestore:"name" json:"name"`
	IsActive   bool      `firestore:"isActive" json:"isActive"`
	Round      int       `firestore:"round" json:"round"`
	TurnIndex  int       `firestore:"turnIndex" json:"turnIndex"`
	CreatedAt  time.Time `firestore:"createdAt" json:"createdAt"`
	UpdatedAt  time.Time `firestore:"updatedAt" json:"updatedAt"`
}

type CreateEncounterRequest struct {
	Name string `json:"name" binding:"required,min=3,max=100"`
}

// ===========================
// COMBATIENTES (Criaturas y PJs en combate)
// ===========================

type Combatant struct {
	ID             string    `firestore:"id" json:"id"`
	EncounterID    string    `firestore:"encounterId" json:"encounterId"`
	Type           string    `firestore:"type" json:"type"` // "character" o "creature"
	CharacterID    string    `firestore:"characterId,omitempty" json:"characterId,omitempty"`
	Name           string    `firestore:"name" json:"name"`
	Initiative     int       `firestore:"initiative" json:"initiative"` // Valor de iniciativa tirado
	MaxHP          int       `firestore:"maxHp" json:"maxHp"`
	CurrentHP      int       `firestore:"currentHp" json:"currentHp"`
	ArmorClass     int       `firestore:"armorClass" json:"armorClass"`
	Conditions     []string  `firestore:"conditions" json:"conditions"` // ["Poisoned", "Stunned"]
	ImageURL       string    `firestore:"imageUrl" json:"imageUrl"`
	IsNPC          bool      `firestore:"isNpc" json:"isNpc"`                                       // true para criaturas
	CreatureSource string    `firestore:"creatureSource,omitempty" json:"creatureSource,omitempty"` // "manual", "dndbeyond"
	CreatedAt      time.Time `firestore:"createdAt" json:"createdAt"`
}

type AddCombatantRequest struct {
	Type        string `json:"type" binding:"required,oneof=character creature player"`
	CharacterID string `json:"characterId,omitempty"`
	Name        string `json:"name" binding:"max=50"`
	Initiative  int    `json:"initiative" binding:"required,min=1,max=100"`
	MaxHP       int    `json:"maxHp" binding:"required,min=1,max=9999"`
	CurrentHP   int    `json:"currentHp" binding:"min=0"`
	ArmorClass  int    `json:"armorClass" binding:"required,min=1,max=99"`
	ImageURL    string `json:"imageUrl" binding:"max=500"`
	IsNPC       bool   `json:"isNpc"`
}
type UpdateCombatantRequest struct {
	CurrentHP  *int     `json:"currentHp,omitempty"`
	Conditions []string `json:"conditions,omitempty"`
	Initiative *int     `json:"initiative,omitempty"`
}

// ===========================
// NOTAS
// ===========================

type Note struct {
	ID         string    `firestore:"id" json:"id"`
	CampaignID string    `firestore:"campaignId" json:"campaignId"`
	AuthorID   string    `firestore:"authorId" json:"authorId"`
	AuthorName string    `firestore:"authorName" json:"authorName"`
	Title      string    `firestore:"title" json:"title"`
	Content    string    `firestore:"content" json:"content"`
	IsShared   bool      `firestore:"isShared" json:"isShared"`
	Category   string    `firestore:"category" json:"category"`
	Tags       []string  `firestore:"tags" json:"tags"`
	CreatedAt  time.Time `firestore:"createdAt" json:"createdAt"`
	UpdatedAt  time.Time `firestore:"updatedAt" json:"updatedAt"`
}

type CreateNoteRequest struct {
	Title    string   `json:"title" binding:"required,min=1,max=200"`
	Content  string   `json:"content" binding:"max=10000"`
	IsShared bool     `json:"isShared"`
	Category string   `json:"category" binding:"required,oneof=session npc location plot other"`
	Tags     []string `json:"tags" binding:"max=10,dive,max=30"`
}

type UpdateNoteRequest struct {
	Title    string   `json:"title" binding:"required,min=1,max=200"`
	Content  string   `json:"content" binding:"max=10000"`
	IsShared bool     `json:"isShared"`
	Category string   `json:"category" binding:"required,oneof=session npc location plot other"`
	Tags     []string `json:"tags" binding:"max=10,dive,max=30"`
}
