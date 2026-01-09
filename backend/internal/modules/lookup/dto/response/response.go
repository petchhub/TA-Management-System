package response

type LookupResponse struct {
	Id    int    `json:"id"`
	Value string `json:"value"`
}

type TaDetail struct {
	Id   int    `json:"id"`
	Name string `json:"name"`
}
