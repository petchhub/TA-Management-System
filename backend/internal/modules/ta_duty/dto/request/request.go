package request

import "time"

type CreateHoliday struct {
	Date     time.Time `json:"date"`
	NameThai string    `json:"nameThai"`
	NameEng  string    `json:"nameEng"`
	Type     string    `json:"type"`
}

type CreatePaymentData struct {
	StudentName string
	WorkHour    int
	Duty        []DutyChecklistItem
}

type ExportPaymentReportRequest struct {
	CourseID   int `json:"courseID"`
	HourlyRate int `json:"hourlyRate"`
	Month      int `json:"month"`
	Year       int `json:"year"`
}

type CourseDutyData struct {
	CourseCode string
	CourseName string
	Semester   string
	Sec        string
	MonthName  string
	Year       string
}

type DutyChecklistItem struct {
	Date      string `json:"date"`
	TimeRange string `json:"timeRange"`
	Status    string `json:"status"`
	IsChecked bool   `json:"isChecked"`
}
