package service

import (
	"TA-management/internal/constants"
	"TA-management/internal/modules/announce/dto/request"
	"TA-management/internal/modules/announce/dto/response"
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

func (s AnnouncementServiceImplementation) SendMailToAllCourse(rq request.MailForAllCourse) {
	emailRequest, err := s.repo.GetStudentEmailByCourseIDs(rq.CourseID)
	if err != nil {
		return
	}
	emailRequest.Body = rq.Body
	emailRequest.Subject = rq.Subject

	s.SendBatchEmail(*emailRequest, constants.SentToAllTA)
}

func (s AnnouncementServiceImplementation) SendMailToCourse(rq request.MailForCourse) {
	emailRequest, courseDetail, err := s.repo.GetStudentEmailByCourseID(rq.CourseID)
	if err != nil {
		fmt.Println(err)
		return
	}

	emailRequest.Body = rq.Body
	emailRequest.Subject = rq.Subject
	TO := courseDetail.CourseCode + " - " + courseDetail.CourseName

	s.SendBatchEmail(*emailRequest, TO)
}

func (s AnnouncementServiceImplementation) SendMailToTA(rq request.MailForTA) {
	emailRequest, err := s.repo.GetStudentEmailByStudentID(rq.StudentID)
	if err != nil {
		fmt.Println(err)
		return
	}
	emailRequest.Body = rq.Body
	emailRequest.Subject = rq.Subject

	s.SendBatchEmail(*emailRequest, emailRequest.To[0])
}

func (s AnnouncementServiceImplementation) SendBatchEmail(rq request.EmailRequest, sendTo string) error {

	var createMailHistory request.CreateEmailHistory
	createMailHistory.Subject = rq.Subject
	createMailHistory.Body = rq.Body
	createMailHistory.NReceived = len(rq.To)
	createMailHistory.ReceivedName = sendTo

	someFailed := false
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

		fmt.Println("to", rq.To)
		if len(rq.To) == 0 {
			someFailed = true
			return
		}
		for _, recipient := range rq.To {
			m.SetHeader("From", os.Getenv("SMTP_USER"))
			m.SetHeader("To", recipient)
			m.SetHeader("Subject", rq.Subject)
			m.SetBody("text/html", rq.Body)

			if err := d.DialAndSend(m); err != nil {
				fmt.Printf("Could not send email to %s: %v\n", recipient, err)
				someFailed = true
				break
			} else {
				fmt.Printf("Email sent successfully to %s\n", recipient)
			}
		}
		if someFailed {
			createMailHistory.StatusID = constants.FailedStatusID
		} else {
			createMailHistory.StatusID = constants.SuccessFulStatusID
		}

		err := s.repo.SaveEmailHistory(createMailHistory)
		if err != nil {
			fmt.Println(err)
		}
	}()

	return nil
}

func (s AnnouncementServiceImplementation) GetEmailHistory() (*[]response.EmailHistory, error) {
	result, err := s.repo.GetEmailHistory()
	if err != nil {
		return nil, err
	}

	return result, nil
}
