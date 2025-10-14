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
	Name string `json:"name" binding:"required"`
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
