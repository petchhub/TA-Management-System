package repository

import (
	"database/sql"
)

type TaDutyRepositoryImplentation struct {
	db *sql.DB
}

func NewTaDutyRepository(db *sql.DB) *TaDutyRepositoryImplentation {
	return &TaDutyRepositoryImplentation{db: db}
}
