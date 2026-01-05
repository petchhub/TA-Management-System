package repository

import (
	"TA-management/internal/modules/lookup/dto/response"
	"TA-management/internal/modules/ta_duty/dto/request"
	"TA-management/internal/modules/ta_duty/entity"
)

type LookupRepository interface {
	GetCourseProgram() (*[]response.LookupResponse, error)
	GetClassday() (*[]response.LookupResponse, error)
	GetSemester() (*[]response.LookupResponse, error)
	GetGrade() (*[]response.LookupResponse, error)
	GetProfessors() (*[]response.LookupResponse, error)
	SyncOfficialHoliday(holidays []request.CreateHoliday) error
	GetHolidaysByMonth(month int, year int) ([]entity.Holiday, error)
	DeleteHoliday(id int) error
	AddSpecialHoliday(holiday request.CreateHoliday) error
}
