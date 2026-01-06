package service

import (
	"TA-management/internal/modules/ta_duty/dto/request"
	"TA-management/internal/modules/ta_duty/dto/response"
	"TA-management/internal/modules/ta_duty/repository"
	"bytes"
	"errors"
	"fmt"
	"time"

	generalresponse "TA-management/internal/modules/shared/dto/response"

	"github.com/xuri/excelize/v2"
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

func (s TaDutyServiceImplementation) ExportPaymentReport(courseID int, hourlyRate int) (*bytes.Buffer, error) {
	TAdutyData, err := s.repo.GetTADutyDataExportPayment(courseID)
	if err != nil {
		s.logger.Errorf("Failed to Get Ta Duty Data :%v", err)
		return nil, err
	}

	fileBytes, err := s.GeneratePaymentExcel(*TAdutyData, hourlyRate)
	if err != nil {
		s.logger.Errorf("Failed on GenearatePaymentExcel")
		return nil, err
	}

	return fileBytes, nil
}

func (s TaDutyServiceImplementation) GeneratePaymentExcel(students []request.CreatePaymentData, hourlyRate int) (*bytes.Buffer, error) {
	f, err := excelize.OpenFile("./prototype/payment-template.xlsx")
	if err != nil {
		s.logger.Errorf("cannot open file : %v", err)
		return nil, err
	}
	defer f.Close()

	sheetName := "Sheet1"

	//Fill duty date and Timerange
	if len(students) > 0 {
		for i, duty := range students[0].Duty {

			col, _ := excelize.ColumnNumberToName(4 + i)
			if i >= 32 {
				break
			}

			f.SetCellValue(sheetName, fmt.Sprintf("%s5", col), duty.TimeRange)
			f.SetCellValue(sheetName, fmt.Sprintf("%s6", col), duty.Date)
		}
	}

	//Fill student data
	for i, student := range students {
		rowIdx := 7 + i
		if rowIdx > 20 {
			break
		}

		//Fill student name
		f.SetCellValue(sheetName, fmt.Sprintf("B%d", rowIdx), student.StudentName)

		//Fill workHour Rate
		f.SetCellValue(sheetName, fmt.Sprintf("C%d", rowIdx), hourlyRate)

		totalHours := 0

		// work hour check
		for dutyIdx, duty := range student.Duty {
			colName, _ := excelize.ColumnNumberToName(4 + dutyIdx)
			if dutyIdx >= 32 {
				break
			}

			if duty.IsChecked {
				f.SetCellValue(sheetName, fmt.Sprintf("%s%d", colName, rowIdx), student.WorkHour)
				totalHours += student.WorkHour
			} else {
				f.SetCellValue(sheetName, fmt.Sprintf("%s%d", colName, rowIdx), "-")
			}

		}

		// Fill total hour and total payment on that student
		f.SetCellValue(sheetName, fmt.Sprintf("AL%d", rowIdx), totalHours)
		f.SetCellValue(sheetName, fmt.Sprintf("AM%d", rowIdx), totalHours*hourlyRate)
	}

	var buf bytes.Buffer
	if _, err := f.WriteTo(&buf); err != nil {
		return nil, err
	}
	return &buf, nil

}
