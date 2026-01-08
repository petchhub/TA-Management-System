package request

type EmailRequest struct {
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	Body    string   `json:"body"`
}

type MailForCourse struct {
	CourseID []int  `json:"courseID"`
	Subject  string `json:"subject"`
	Body     string `json:"body"`
}

type MailForTA struct {
	StudentID int    `json:"studentID"`
	Subject   string `json:"subject"`
	Body      string `json:"body"`
}
