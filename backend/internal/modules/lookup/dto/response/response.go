package response

type LookupResponse struct {
	Id    int    `json:"id"`
	Value string `json:"value"`
}

type TaDetail struct {
	Id   int    `json:"id"`
	Name string `json:"name"`
}

type AvailableMonth struct {
	MonthID   int    `json:"monthID"`
	MonthName string `json:"monthName"`
	Year      int    `json:"year"`
}
