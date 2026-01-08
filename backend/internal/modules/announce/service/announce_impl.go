package service

import (
	"TA-management/internal/modules/announce/dto/request"
	"TA-management/internal/modules/announce/repository"
	"fmt"
	"os"

	"gopkg.in/gomail.v2"
)

type AnnouncementServiceImplementation struct {
	repo repository.AnnouncementRepository
}

func NewAnnouncementService(repo repository.AnnouncementRepository) AnnouncementServiceImplementation {
	return AnnouncementServiceImplementation{repo: repo}
}

func (s AnnouncementServiceImplementation) SendMailToAllCourse(rq request.MailForCourse) {
	emailRequest, err := s.repo.GetStudentEmailByCourseID(rq.CourseID)
	if err != nil {
		return
	}
	emailRequest.Body = rq.Body
	emailRequest.Subject = rq.Subject

	s.SendBatchEmail(*emailRequest)
}

func (s AnnouncementServiceImplementation) SendMailToCourse(rq request.MailForCourse) {

}

func (s AnnouncementServiceImplementation) SendMailToTA(rq request.MailForTA) {

}

func (s AnnouncementServiceImplementation) SendBatchEmail(rq request.EmailRequest) error {
	go func() {
		m := gomail.NewMessage()
		fmt.Println("body", rq.Body)
		d := gomail.NewDialer(
			os.Getenv("SMTP_HOST"),
			465,
			os.Getenv("SMTP_USER"),
			os.Getenv("SMTP_PASS"),
		)
		d.SSL = true

		for _, recipient := range rq.To {
			m.SetHeader("From", os.Getenv("SMTP_USER"))
			m.SetHeader("To", recipient)
			m.SetHeader("Subject", rq.Subject)
			m.SetBody("text/html", rq.Body)

			if err := d.DialAndSend(m); err != nil {
				fmt.Printf("Could not send email to %s: %v\n", recipient, err)
			} else {
				fmt.Printf("Email sent successfully to %s\n", recipient)
			}
		}
	}()

	return nil
}
