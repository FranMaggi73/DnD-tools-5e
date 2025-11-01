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
// PERSONAJES - ✅ NIVEL 1 COMPLETO
// ===========================

// AbilityScores representa las 6 habilidades principales
type AbilityScores struct {
	Strength     int `firestore:"strength" json:"strength"`         // STR
	Dexterity    int `firestore:"dexterity" json:"dexterity"`       // DEX
	Constitution int `firestore:"constitution" json:"constitution"` // CON
	Intelligence int `firestore:"intelligence" json:"intelligence"` // INT
	Wisdom       int `firestore:"wisdom" json:"wisdom"`             // WIS
	Charisma     int `firestore:"charisma" json:"charisma"`         // CHA
}

// SavingThrows representa los saving throws con proficiencia
type SavingThrows struct {
	Strength     bool `firestore:"strength" json:"strength"`
	Dexterity    bool `firestore:"dexterity" json:"dexterity"`
	Constitution bool `firestore:"constitution" json:"constitution"`
	Intelligence bool `firestore:"intelligence" json:"intelligence"`
	Wisdom       bool `firestore:"wisdom" json:"wisdom"`
	Charisma     bool `firestore:"charisma" json:"charisma"`
}

// Skill representa una skill individual
type Skill struct {
	Name       string `firestore:"name" json:"name"`             // Ej: "Acrobatics"
	Ability    string `firestore:"ability" json:"ability"`       // "dex", "str", etc.
	Proficient bool   `firestore:"proficient" json:"proficient"` // ¿Tiene proficiency?
	Expertise  bool   `firestore:"expertise" json:"expertise"`   // ¿Tiene expertise? (x2)
}

// Character - Modelo completo Nivel 1
type Character struct {
	ID         string `firestore:"id" json:"id"`
	CampaignID string `firestore:"campaignId" json:"campaignId"`
	UserID     string `firestore:"userId" json:"userId"`
	Name       string `firestore:"name" json:"name"`
	Class      string `firestore:"class" json:"class"`
	Level      int    `firestore:"level" json:"level"`

	// ===== COMBAT STATS =====
	MaxHP      int      `firestore:"maxHp" json:"maxHp"`
	CurrentHP  int      `firestore:"currentHp" json:"currentHp"`
	ArmorClass int      `firestore:"armorClass" json:"armorClass"`
	Initiative int      `firestore:"initiative" json:"initiative"` // Bonus de iniciativa
	Speed      int      `firestore:"speed" json:"speed"`           // ✅ NUEVO: Walking speed (en pies)
	Conditions []string `firestore:"conditions" json:"conditions"`

	// ===== NIVEL 1: ABILITY SCORES =====
	AbilityScores AbilityScores `firestore:"abilityScores" json:"abilityScores"` // ✅ NUEVO

	// ===== NIVEL 1: PROFICIENCIES =====
	ProficiencyBonus int          `firestore:"proficiencyBonus" json:"proficiencyBonus"` // ✅ NUEVO: Basado en nivel
	SavingThrows     SavingThrows `firestore:"savingThrows" json:"savingThrows"`         // ✅ NUEVO
	Skills           []Skill      `firestore:"skills" json:"skills"`                     // ✅ NUEVO

	// ===== METADATA =====
	CreatedAt time.Time `firestore:"createdAt" json:"createdAt"`
	UpdatedAt time.Time `firestore:"updatedAt" json:"updatedAt"`
}

// ===== REQUESTS ACTUALIZADOS =====

type CreateCharacterRequest struct {
	// Básico
	Name  string `json:"name" binding:"required,min=2,max=50"`
	Class string `json:"class" binding:"required,min=2,max=50"`
	Level int    `json:"level" binding:"required,min=1,max=20"`

	// Combat
	MaxHP      int `json:"maxHp" binding:"required,min=1,max=999"`
	ArmorClass int `json:"armorClass" binding:"required,min=1,max=30"`
	Initiative int `json:"initiative" binding:"min=-5,max=15"`
	Speed      int `json:"speed" binding:"required,min=0,max=120"` // ✅ NUEVO

	// ✅ NUEVO: Ability Scores
	AbilityScores AbilityScores `json:"abilityScores" binding:"required"`

	// ✅ NUEVO: Proficiencies
	SavingThrows SavingThrows `json:"savingThrows"`
	Skills       []Skill      `json:"skills"`
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
// COMBATIENTES
// ===========================

type Combatant struct {
	ID             string    `firestore:"id" json:"id"`
	EncounterID    string    `firestore:"encounterId" json:"encounterId"`
	Type           string    `firestore:"type" json:"type"` // "character" o "creature"
	CharacterID    string    `firestore:"characterId,omitempty" json:"characterId,omitempty"`
	Name           string    `firestore:"name" json:"name"`
	Initiative     int       `firestore:"initiative" json:"initiative"`
	MaxHP          int       `firestore:"maxHp" json:"maxHp"`
	CurrentHP      int       `firestore:"currentHp" json:"currentHp"`
	ArmorClass     int       `firestore:"armorClass" json:"armorClass"`
	Conditions     []string  `firestore:"conditions" json:"conditions"`
	ImageURL       string    `firestore:"imageUrl" json:"imageUrl"`
	IsNPC          bool      `firestore:"isNpc" json:"isNpc"`
	CreatureSource string    `firestore:"creatureSource,omitempty" json:"creatureSource,omitempty"`
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

// ===========================
// INVENTORY MODELS
// ===========================

// ItemType representa el tipo de item
type ItemType string

const (
	ItemTypeWeapon     ItemType = "weapon"
	ItemTypeArmor      ItemType = "armor"
	ItemTypeShield     ItemType = "shield"
	ItemTypeTool       ItemType = "tool"
	ItemTypeConsumable ItemType = "consumable"
	ItemTypeTreasure   ItemType = "treasure"
	ItemTypeOther      ItemType = "other"
)

// WeaponProperties representa las propiedades de un arma
type WeaponProperties struct {
	Light      bool         `firestore:"light,omitempty" json:"light,omitempty"`
	Finesse    bool         `firestore:"finesse,omitempty" json:"finesse,omitempty"`
	Thrown     bool         `firestore:"thrown,omitempty" json:"thrown,omitempty"`
	TwoHanded  bool         `firestore:"twoHanded,omitempty" json:"twoHanded,omitempty"`
	Versatile  string       `firestore:"versatile,omitempty" json:"versatile,omitempty"`
	Reach      bool         `firestore:"reach,omitempty" json:"reach,omitempty"`
	Loading    bool         `firestore:"loading,omitempty" json:"loading,omitempty"`
	Heavy      bool         `firestore:"heavy,omitempty" json:"heavy,omitempty"`
	Ammunition bool         `firestore:"ammunition,omitempty" json:"ammunition,omitempty"`
	Range      *WeaponRange `firestore:"range,omitempty" json:"range,omitempty"`
}

type WeaponRange struct {
	Normal int `firestore:"normal" json:"normal"`
	Max    int `firestore:"max" json:"max"`
}

// InventoryItem representa un item en el inventario
type InventoryItem struct {
	ID          string `firestore:"id" json:"id"`
	CharacterID string `firestore:"characterId" json:"characterId"`
	CampaignID  string `firestore:"campaignId" json:"campaignId"`

	// Información básica
	Name        string   `firestore:"name" json:"name"`
	Type        ItemType `firestore:"type" json:"type"`
	Description string   `firestore:"description,omitempty" json:"description,omitempty"`

	// Económico
	Quantity int     `firestore:"quantity" json:"quantity"`
	Value    float64 `firestore:"value" json:"value"`

	// Estado
	Equipped bool `firestore:"equipped" json:"equipped"`
	Attuned  bool `firestore:"attuned,omitempty" json:"attuned,omitempty"`

	// Datos específicos por tipo (almacenados como JSON)
	WeaponData *WeaponData `firestore:"weaponData,omitempty" json:"weaponData,omitempty"`
	ArmorData  *ArmorData  `firestore:"armorData,omitempty" json:"armorData,omitempty"`

	// Open5e reference
	Open5eSlug string `firestore:"open5eSlug,omitempty" json:"open5eSlug,omitempty"`

	// Metadata
	CreatedAt time.Time `firestore:"createdAt" json:"createdAt"`
	UpdatedAt time.Time `firestore:"updatedAt" json:"updatedAt"`
}

type WeaponData struct {
	WeaponType string           `firestore:"weaponType" json:"weaponType"`
	DamageDice string           `firestore:"damageDice" json:"damageDice"`
	DamageType string           `firestore:"damageType" json:"damageType"`
	Properties WeaponProperties `firestore:"properties" json:"properties"`
	MagicBonus int              `firestore:"magicBonus,omitempty" json:"magicBonus,omitempty"`
}

type ArmorData struct {
	ArmorType           string `firestore:"armorType" json:"armorType"`
	BaseAC              int    `firestore:"baseAC" json:"baseAC"`
	DexModifier         string `firestore:"dexModifier,omitempty" json:"dexModifier,omitempty"`
	StrengthRequirement int    `firestore:"strengthRequirement,omitempty" json:"strengthRequirement,omitempty"`
	StealthDisadvantage bool   `firestore:"stealthDisadvantage,omitempty" json:"stealthDisadvantage,omitempty"`
	MagicBonus          int    `firestore:"magicBonus,omitempty" json:"magicBonus,omitempty"`
}

// Currency representa la moneda del personaje
type Currency struct {
	Copper   int `firestore:"copper" json:"copper"`
	Silver   int `firestore:"silver" json:"silver"`
	Gold     int `firestore:"gold" json:"gold"`
	Platinum int `firestore:"platinum" json:"platinum"`
}

// ===========================
// REQUESTS
// ===========================

type CreateItemRequest struct {
	Name        string  `json:"name" binding:"required,min=1,max=100"`
	Type        string  `json:"type" binding:"required"`
	Description string  `json:"description" binding:"max=1000"`
	Quantity    int     `json:"quantity" binding:"required,min=1,max=999"`
	Value       float64 `json:"value" binding:"min=0,max=999999"`

	// Datos opcionales
	WeaponData *WeaponData `json:"weaponData,omitempty"`
	ArmorData  *ArmorData  `json:"armorData,omitempty"`

	// Open5e reference
	Open5eSlug string `json:"open5eSlug,omitempty"`
}

type UpdateItemRequest struct {
	Quantity *int  `json:"quantity,omitempty"`
	Equipped *bool `json:"equipped,omitempty"`
	Attuned  *bool `json:"attuned,omitempty"`
}

type UpdateCurrencyRequest struct {
	Copper   *int `json:"copper,omitempty"`
	Silver   *int `json:"silver,omitempty"`
	Gold     *int `json:"gold,omitempty"`
	Platinum *int `json:"platinum,omitempty"`
}

// ===========================
// RESPONSE
// ===========================

type InventoryResponse struct {
	Items      []InventoryItem `json:"items"`
	Currency   Currency        `json:"currency"`
	TotalValue float64         `json:"totalValue"`
}
