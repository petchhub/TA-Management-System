package repository

import (
	"TA-management/internal/modules/ta_duty/dto/response"
	"database/sql"
	"time"
)

type TaDutyRepositoryImplentation struct {
	db *sql.DB
}

func NewTaDutyRepository(db *sql.DB) *TaDutyRepositoryImplentation {
	return &TaDutyRepositoryImplentation{db: db}
}

func (r TaDutyRepositoryImplentation) GetTADutyRoadmap(courseID int, studentID int) (*[]response.DutyChecklistItem, error) {
	query := `
		WITH RECURSIVE semester_dates AS (
			SELECT s.start_date, s.end_date
			FROM semester s
			JOIN courses c ON c.semester_ID = s.semester_ID
			WHERE c.course_ID = $1
		),
		all_dates AS (
			SELECT start_date AS d_date FROM semester_dates
			UNION ALL
			SELECT (d_date + INTERVAL '1 day')::date FROM all_dates
			WHERE d_date < (SELECT end_date FROM semester_dates)
		)
		SELECT 
			ad.d_date,
			CASE 
				WHEN h.id IS NOT NULL THEN 'COMPLETED'
				WHEN ad.d_date < CURRENT_DATE THEN 'MISSED'
				WHEN ad.d_date = CURRENT_DATE THEN 'TODAY'
				ELSE 'UPCOMING'
			END as status,
			CASE WHEN h.id IS NOT NULL THEN true ELSE false END as is_checked
		FROM all_dates ad
		JOIN courses c ON c.course_ID = $1
		JOIN class_days cd ON c.class_day_ID = cd.class_day_ID
		LEFT JOIN holidays hol ON ad.d_date = hol.holiday_date
		LEFT JOIN ta_duty_historys h ON h.course_ID = c.course_ID 
			AND h.student_ID = $2 
			AND h.date::date = ad.d_date
		WHERE trim(to_char(ad.d_date, 'Day')) = cd.class_day_value
		AND hol.id IS NULL
		ORDER BY ad.d_date ASC;
    `
	rows, err := r.db.Query(query, courseID, studentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var roadmap []response.DutyChecklistItem
	for rows.Next() {
		var item response.DutyChecklistItem
		var dutyTime time.Time
		if err := rows.Scan(&dutyTime, &item.Status, &item.IsChecked); err != nil {
			return nil, err
		}
		item.Date = dutyTime.Format("2006-01-02")
		roadmap = append(roadmap, item)
	}
	return &roadmap, nil
}

func (r TaDutyRepositoryImplentation) MarkDutyAsDone(courseID int, studentID int, date string) error {
	query := `
		INSERT INTO ta_duty_historys (date, course_ID, student_ID)
		VALUES ($1, $2, $3)

	`
	_, err := r.db.Exec(query, date, courseID, studentID)
	if err != nil {
		return err
	}
	return nil
}
