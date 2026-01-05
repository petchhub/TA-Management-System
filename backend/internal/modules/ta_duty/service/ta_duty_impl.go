package service

import (
	"TA-management/internal/modules/ta_duty/repository"

	"go.uber.org/zap"
)

type TaDutyServiceImplementation struct {
	repo   repository.TaDutyRepository
	logger *zap.SugaredLogger
}

func NewTaDutyServiceImplementation(repo repository.TaDutyRepository, logger *zap.SugaredLogger) TaDutyServiceImplementation {
	return TaDutyServiceImplementation{
		repo:   repo,
		logger: logger}
}
