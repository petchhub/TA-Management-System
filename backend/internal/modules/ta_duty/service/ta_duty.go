package service

import (
	generalresponse "TA-management/internal/modules/shared/dto/response"
	"TA-management/internal/modules/ta_duty/dto/response"
)

type TaDutyService interface {
	GetTADutyRoadmap(courseID int, studentID int) (*[]response.DutyChecklistItem, error)
	MarkDutyAsDone(courseID int, studentID int, dutyDate string) (*generalresponse.GeneralResponse, error)
}
