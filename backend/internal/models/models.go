package models

import "time"

// ===========================
// USUARIO
// ===========================

type User struct {
	UID         string    `firestore:"uid" json:"uid"`
	Email       string    `firestore:"email" json:"email"`
	DisplayName string    `firestore:"displayName" json:"displayName"`
	PhotoURL    string    `firestore:"photoURL" json:"photoURL"`
	CreatedAt   time.Time `firestore:"createdAt" json:"createdAt"`
	EventCount  int       `firestore:"eventCount" json:"eventCount"` // max 3
}

// ===========================
// EVENTO
// ===========================

type Event struct {
	ID          string    `firestore:"id" json:"id"`
	Name        string    `firestore:"name" json:"name"`
	Description string    `firestore:"description" json:"description"`
	DmID        string    `firestore:"dmId" json:"dmId"`
	DmName      string    `firestore:"dmName" json:"dmName"`
	DmPhoto     string    `firestore:"dmPhoto" json:"dmPhoto"`
	CreatedAt   time.Time `firestore:"createdAt" json:"createdAt"`
	PlayerIDs   []string  `firestore:"playerIds" json:"playerIds"`
}

// Request para crear evento
type CreateEventRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

// ===========================
// EVENT MEMBERS
// ===========================

type EventMember struct {
	EventID   string    `firestore:"eventId" json:"eventId"`
	UserID    string    `firestore:"userId" json:"userId"`
	Role      string    `firestore:"role" json:"role"` // "dm" o "player"
	UserName  string    `firestore:"userName" json:"userName"`
	UserPhoto string    `firestore:"userPhoto" json:"userPhoto"`
	JoinedAt  time.Time `firestore:"joinedAt" json:"joinedAt"`
}
