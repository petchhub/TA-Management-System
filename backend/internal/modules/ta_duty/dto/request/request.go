package request

import "time"

type CreateHoliday struct {
	Date     time.Time `json:"date"`
	NameThai string    `json:"nameThai"`
	NameEng  string    `json:"nameEng"`
	Type     string    `json:"type"`
}

type CreatePaymentData struct {
	StudentName string              `json:"studentName"`
	WorkHour    int                 `json:"workHour"`
	Duty        []DutyChecklistItem `json:"duty"`
}

type DutyChecklistItem struct {
	Date      string `json:"date"`
	TimeRange string `json:"timeRange"`
	Status    string `json:"status"`
	IsChecked bool   `json:"isChecked"`
}
