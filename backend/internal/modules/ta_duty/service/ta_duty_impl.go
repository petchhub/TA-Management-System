package service

import (
	"TA-management/internal/modules/ta_duty/dto/response"
	"TA-management/internal/modules/ta_duty/repository"
	"errors"
	"time"

	generalresponse "TA-management/internal/modules/shared/dto/response"

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

func (s TaDutyServiceImplementation) GetTADutyRoadmap(courseID int, studentID int) (*[]response.DutyChecklistItem, error) {
	result, err := s.repo.GetTADutyRoadmap(courseID, studentID)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func (s TaDutyServiceImplementation) MarkDutyAsDone(courseID int, studentID int, dutyDate string) (*generalresponse.GeneralResponse, error) {
	// 1. Validate Date Format and "Future Date" rule
	parsedDate, err := time.Parse("2006-01-02", dutyDate)
	if err != nil {
		return nil, errors.New("invalid date format")
	}

	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())

	if parsedDate.After(today) {
		return nil, errors.New("cannot check off future duties")
	}

	err = s.repo.MarkDutyAsDone(courseID, studentID, dutyDate)
	if err != nil {
		s.logger.Errorf("Failed to save duty to DB: %v", err)
		return nil, err
	}

	return &generalresponse.GeneralResponse{
		Message: "MarkDuty as Done successfully",
	}, nil
}
