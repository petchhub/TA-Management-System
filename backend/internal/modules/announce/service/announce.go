package service

import "TA-management/internal/modules/announce/dto/request"

type AnnouncementService interface {
	SendMailToAllCourse(rq request.MailForCourse)
	SendMailToCourse(rq request.MailForCourse)
	SendMailToTA(rq request.MailForTA)
}
