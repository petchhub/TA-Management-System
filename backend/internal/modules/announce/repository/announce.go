package repository

import "TA-management/internal/modules/announce/dto/request"

type AnnouncementRepository interface {
	GetStudentEmailByCourseID(courseID []int) (*request.EmailRequest, error)
}
