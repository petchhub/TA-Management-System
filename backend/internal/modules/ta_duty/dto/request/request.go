package request

import "time"

type CreateHoliday struct {
	Date     time.Time `json:"date"`
	NameThai string    `json:"nameThai"`
	NameEng  string    `json:"nameEng"`
	Type     string    `json:"type"`
}
