package repository

import (
	"TA-management/internal/modules/announce/dto/request"
	"database/sql"
)

type AnnouncementRepoImplementation struct {
	db *sql.DB
}

func NewAnnouncementRepository(db *sql.DB) *AnnouncementRepoImplementation {
	return &AnnouncementRepoImplementation{db: db}
}

func (r AnnouncementRepoImplementation) GetStudentEmailByCourseID(courseID []int) (*request.EmailRequest, error) {

	query := `SELECT 
				st.email
				FROM ta_courses AS tc
				LEFT JOIN students AS st ON st.student_ID=tc.student_ID
				WHERE course_ID=$1`
	var EmailRequest request.EmailRequest

	for _, courseID := range courseID {
		studentEmails := []string{}
		rows, err := r.db.Query(query, courseID)
		if err != nil {
			return nil, err
		}

		for rows.Next() {
			var studentEmail string
			err := rows.Scan(&studentEmail)
			if err != nil {
				rows.Close()
				return nil, err
			}
			studentEmails = append(studentEmails, studentEmail)
		}
		EmailRequest.To = append(EmailRequest.To, studentEmails...)
		rows.Close()
	}

	return &EmailRequest, nil
}
