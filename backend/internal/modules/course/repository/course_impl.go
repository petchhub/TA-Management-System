package repository

import (
	"TA-management/internal/constants"
	"TA-management/internal/modules/course/dto/request"
	"TA-management/internal/modules/course/dto/response"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"
)

type CourseRepositoryImplementation struct {
	db *sql.DB
}

func NewCourseRepository(DB *sql.DB) CourseRepositoryImplementation {
	return CourseRepositoryImplementation{db: DB}
}

func (r CourseRepositoryImplementation) GetAllJobPost() ([]response.JobPost, error) {

	query := `SELECT 
				j.task,
				j.id,
				c.course_code, 
				c.course_name, 
				j.ta_allocation, 
				c.work_hour,
				c.class_start,
				c.class_end,
				j.location,
				cp.course_program_value_thai,
				cd.class_day_value_thai, 
				CONCAT(p.prefix, ' ', p.firstname_thai, ' ', p.lastname_thai) as fullname,
				s.semester_value,
				st.status_value,
				g.grade_value,
				j.course_ID,
				c.sec
			FROM ta_job_posting AS j
			LEFT JOIN courses AS c
				ON j.course_ID = c.course_ID
			LEFT JOIN class_days AS cd
				ON c.class_day_ID = cd.class_day_ID 
			LEFT JOIN course_programs AS cp
				ON c.course_program_ID = cp.course_program_ID
			LEFT JOIN professors AS p
				ON c.professor_ID = p.professor_ID
			LEFT JOIN semester AS s
				ON c.semester_ID = s.semester_ID
			LEFT JOIN status AS st
				ON j.status_ID = st.status_ID
			LEFT JOIN grades AS g
				ON j.grade_ID = g.grade_ID
			LEFT JOIN semester AS s
				ON c.semester_ID = s.semester_ID
			WHERE j.status_ID = $1
			AND s.is_active = TRUE`

	rows, err := r.db.Query(query, constants.OpenStatusID)
	if err != nil {
		return nil, err
	}
	//garantees that connection is released back to the pool ,prevent leak
	defer rows.Close()

	var courses []response.JobPost
	for rows.Next() {
		var course response.JobPost
		var fullname string
		err := rows.Scan(
			&course.Task,
			&course.JobPostID,
			&course.CourseCode,
			&course.CourseName,
			&course.TaAllocation,
			&course.WorkHour,
			&course.ClassStart,
			&course.ClassEnd,
			&course.Location,
			&course.CourseProgram,
			&course.Classday,
			&fullname,
			&course.Semester,
			&course.Status,
			&course.Grade,
			&course.CourseID,
			&course.Section,
		)
		if err != nil {
			return nil, err
		}
		course.ProfessorName = fullname
		courses = append(courses, course)
	}

	return courses, nil
}

func (r CourseRepositoryImplementation) GetAllJobPostAllStatus() ([]response.JobPost, error) {

	query := `SELECT 
				j.task,
				j.id,
				c.course_code, 
				c.course_name, 
				j.ta_allocation, 
				c.work_hour,
				c.class_start,
				c.class_end,
				j.location,
				cp.course_program_value_thai,
				cd.class_day_value_thai, 
				CONCAT(p.prefix, ' ', p.firstname_thai, ' ', p.lastname_thai) as fullname,
				s.semester_value,
				st.status_value,
				g.grade_value,
				j.course_ID,
				j.status_ID,
				c.sec
			FROM ta_job_posting AS j
			LEFT JOIN courses AS c
				ON j.course_ID = c.course_ID
			LEFT JOIN class_days AS cd
				ON c.class_day_ID = cd.class_day_ID 
			LEFT JOIN course_programs AS cp
				ON c.course_program_ID = cp.course_program_ID
			LEFT JOIN professors AS p
				ON c.professor_ID = p.professor_ID
			LEFT JOIN semester AS s
				ON c.semester_ID = s.semester_ID
			LEFT JOIN status AS st
				ON j.status_ID = st.status_ID
			LEFT JOIN grades AS g
				ON j.grade_ID = g.grade_ID
			WHERE j.deleted_date IS NULL
			AND s.is_active = TRUE`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	//garantees that connection is released back to the pool ,prevent leak
	defer rows.Close()

	var courses []response.JobPost
	for rows.Next() {
		var course response.JobPost
		var fullname string
		err := rows.Scan(
			&course.Task,
			&course.JobPostID,
			&course.CourseCode,
			&course.CourseName,
			&course.TaAllocation,
			&course.WorkHour,
			&course.ClassStart,
			&course.ClassEnd,
			&course.Location,
			&course.CourseProgram,
			&course.Classday,
			&fullname,
			&course.Semester,
			&course.Status,
			&course.Grade,
			&course.CourseID,
			&course.StatusID,
			&course.Section,
		)
		if err != nil {
			return nil, err
		}
		course.ProfessorName = fullname
		courses = append(courses, course)
	}

	return courses, nil
}

func (r CourseRepositoryImplementation) GetAllJobPostByStudentId(studentId int) ([]response.JobPost, error) {

	query := `SELECT 
				j.task,
				j.id,
				c.course_code, 
				c.course_name, 
				j.ta_allocation, 
				c.work_hour,
				c.class_start,
				c.class_end,
				j.location,
				cp.course_program_value_thai,
				cd.class_day_value_thai,
				CONCAT(p.prefix, ' ', p.firstname_thai, ' ', p.lastname_thai) as fullname,
				s.semester_value,
				st.status_value,
				g.grade_value,
				j.course_ID,
				c.sec
			FROM ta_job_posting AS j
			LEFT JOIN courses AS c
				ON j.course_ID = c.course_ID
			LEFT JOIN class_days AS cd
				ON c.class_day_ID = cd.class_day_ID 
			LEFT JOIN course_programs AS cp
				ON c.course_program_ID = cp.course_program_ID
			LEFT JOIN professors AS p
				ON c.professor_ID = p.professor_ID
			LEFT JOIN semester AS s
				ON c.semester_ID = s.semester_ID
			LEFT JOIN status AS st
				ON j.status_ID = st.status_ID
			LEFT JOIN grades AS g
				ON j.grade_ID = g.grade_ID
			WHERE NOT EXISTS(
				SELECT 1 
				FROM ta_application as ta
				WHERE ta.job_post_ID = j.id
				AND ta.student_ID = $1)
			AND j.status_id = $2
			AND s.is_active = TRUE
			`

	rows, err := r.db.Query(query, studentId, constants.OpenStatusID)
	if err != nil {
		return nil, err
	}
	//garantees that connection is released back to the pool ,prevent leak
	defer rows.Close()

	var courses []response.JobPost
	for rows.Next() {
		var course response.JobPost
		var fullname string
		err := rows.Scan(
			&course.Task,
			&course.JobPostID,
			&course.CourseCode,
			&course.CourseName,
			&course.TaAllocation,
			&course.WorkHour,
			&course.ClassStart,
			&course.ClassEnd,
			&course.Location,
			&course.CourseProgram,
			&course.Classday,
			&fullname,
			&course.Semester,
			&course.Status,
			&course.Grade,
			&course.CourseID,
			&course.Section,
		)
		if err != nil {
			return nil, err
		}
		course.ProfessorName = fullname
		courses = append(courses, course)
	}

	return courses, nil
}

func (r CourseRepositoryImplementation) GetAllCourse() ([]response.Course, error) {

	query := `SELECT 
				c.course_ID, 
				c.course_code, 
				c.course_name, 
				cp.course_program_value_thai,
				cd.class_day_value_thai,
				c.class_start,
				c.class_end,
				c.semester,
				c.sec,
				CONCAT(p.prefix, ' ', p.firstname_thai, ' ', p.lastname_thai) as fullname,
				c.work_hour,
				s.start_date,
				s.end_date,
				dc.role_id
			FROM courses AS c
			LEFT JOIN discord_channels AS dc
				ON c.course_ID = dc.course_ID
			LEFT JOIN professors AS p
				ON c.professor_ID = p.professor_ID
			LEFT JOIN class_days AS cd
				ON c.class_day_ID = cd.class_day_ID
			LEFT JOIN course_programs AS cp
				ON c.course_program_ID = cp.course_program_ID
			LEFT JOIN semester AS s
				ON c.semester_ID = s.semester_ID
			WHERE c.deleted_date IS NULL
			AND s.is_active = TRUE`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var courses []response.Course
	for rows.Next() {
		var course response.Course
		var fullname string
		var roleID sql.NullString
		err := rows.Scan(
			&course.CourseID,
			&course.CourseCode,
			&course.CourseName,
			&course.CourseProgram,
			&course.Classday,
			&course.ClassStart,
			&course.ClassEnd,
			&course.Semester,
			&course.Section,
			&fullname,
			&course.WorkHour,
			&course.SemesterStart,
			&course.SemesterEnd,
			&roleID,
		)
		if err != nil {
			return nil, err
		}
		if roleID.Valid {
			course.DiscordRoleID = roleID.String
		}
		course.ProfessorName = fullname
		courses = append(courses, course)
	}

	return courses, nil
}

func (r CourseRepositoryImplementation) GetProfessorCourse(professorId int) ([]response.Course, error) {

	query := `SELECT 
				c.course_ID,
				c.course_code, 
				c.course_name,
				cp.course_program_value_thai,
				cd.class_day_value_thai,
				c.class_start,
				c.class_end,
				c.semester,
				c.sec,
				CONCAT(p.prefix, ' ', p.firstname_thai, ' ', p.lastname_thai) as fullname,
				c.work_hour,
				s.start_date,
				s.end_date,
				dc.role_id
			FROM courses AS c
			LEFT JOIN discord_channels AS dc
				ON c.course_ID = dc.course_ID
			join professors AS p 
				on c.professor_ID = p.professor_ID
			LEFT JOIN class_days AS cd
				ON c.class_day_ID = cd.class_day_ID
			LEFT JOIN course_programs AS cp
				ON c.course_program_ID = cp.course_program_ID
			LEFT JOIN semester AS s
				ON c.semester_ID = s.semester_ID
			WHERE c.professor_ID=$1
			AND c.deleted_date IS NULL
			AND s.is_active = TRUE`

	rows, err := r.db.Query(query, professorId)
	if err != nil {
		return nil, err
	}
	//garantees that connection is released back to the pool ,prevent leak
	defer rows.Close()

	var courses []response.Course
	for rows.Next() {
		var course response.Course
		var fullname string
		var roleID sql.NullString
		err := rows.Scan(
			&course.CourseID,
			&course.CourseCode,
			&course.CourseName,
			&course.CourseProgram,
			&course.Classday,
			&course.ClassStart,
			&course.ClassEnd,
			&course.Semester,
			&course.Section,
			&fullname,
			&course.WorkHour,
			&course.SemesterStart,
			&course.SemesterEnd,
			&roleID)
		if err != nil {
			return nil, err
		}
		if roleID.Valid {
			course.DiscordRoleID = roleID.String
		}
		course.ProfessorName = fullname
		courses = append(courses, course)
	}

	return courses, nil
}

func (r CourseRepositoryImplementation) CreateCourse(body request.CreateCourse) (int, error) {

	queryCheck := `SELECT COUNT(*) FROM courses 
					WHERE course_code=$1 
					AND course_program_ID=$2 
					AND sec=$3 
					AND semester_ID=$4 
					AND deleted_date IS NULL`

	var count int

	row := r.db.QueryRow(queryCheck,
		body.CourseCode,
		body.CourseProgramID,
		body.Sec,
		body.SemesterID,
	)

	err := row.Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to scan duplicate check result:%w", err)
	}

	if count > 0 {
		return 0, errors.New("course already exists")
	}

	tx, err := r.db.Begin()
	if err != nil {
		return 0, err
	}

	query := `INSERT INTO courses(
	course_code, 
	course_name,
	professor_ID, 
	course_program_ID, 
	course_program, 
	sec, 
	semester_ID, 
	semester, 
	class_day_ID, 
	class_day, 
	class_start, 
	class_end,
	work_hour,
	created_date) 
	values ($1,$2,$3, $4, $5 ,$6 ,$7 ,$8 ,$9 ,$10 ,$11 ,$12, $13, $14)
	RETURNING course_ID`

	var lastInsertId int

	err = tx.QueryRow(query,
		body.CourseCode,
		body.CourseName,
		body.ProfessorID,
		body.CourseProgramID,
		body.CourseProgram,
		body.Sec,
		body.SemesterID,
		body.Semester,
		body.ClassdayID,
		body.Classday,
		body.ClassStart,
		body.ClassEnd,
		body.WorkHour,
		time.Now(),
	).Scan(&lastInsertId)

	if err != nil {
		tx.Rollback()
		return 0, err
	}

	if err := tx.Commit(); err != nil {
		tx.Rollback()
		return 0, err
	}

	return lastInsertId, nil

}

func (r CourseRepositoryImplementation) UpdateCourse(body request.UpdateCourse) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}

	query := "UPDATE courses SET "
	params := []interface{}{}
	placeholderID := 1 // PostgreSQL needs $1, $2...

	// Helper to add fields and increment the counter
	addField := func(columnName string, value interface{}) {
		query += fmt.Sprintf("%s = $%d, ", columnName, placeholderID)
		params = append(params, value)
		placeholderID++
	}

	// 1. Check each field
	if body.CourseName != nil {
		addField("course_name", body.CourseName)
	}
	if body.CourseCode != nil {
		addField("course_code", body.CourseCode)
	}
	if body.CourseProgramID != nil {
		addField("course_program_id", body.CourseProgramID)
	}
	if body.CourseProgram != nil {
		addField("course_program", body.CourseProgram)
	}
	if body.Sec != nil {
		addField("sec", body.Sec)
	}
	if body.SemesterID != nil {
		addField("semester_id", body.SemesterID)
	}
	if body.Semester != nil {
		addField("semester", body.Semester)
	}
	if body.ClassdayID != nil {
		addField("class_day_id", body.ClassdayID)
	}
	if body.Classday != nil {
		addField("class_day", body.Classday)
	}
	if body.ClassStart != nil {
		addField("class_start", body.ClassStart)
	}
	if body.ClassEnd != nil {
		addField("class_end", body.ClassEnd)
	}

	// 2. Safety Check: Did the user send ANY data?
	if len(params) == 0 {
		tx.Rollback()
		return nil // Or return an error "nothing to update"
	}

	// 3. Finalize the query string
	query = strings.TrimSuffix(query, ", ")
	query += fmt.Sprintf(" WHERE course_id = $%d;", placeholderID)
	params = append(params, body.Id)

	// 4. Execute
	_, err = tx.Exec(query, params...)
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit()
}

func (r CourseRepositoryImplementation) GetDiscordRoleByCourseId(courseId int) (string, error) {
	query := `SELECT role_id FROM discord_channels WHERE course_ID = $1`
	var roleId string
	err := r.db.QueryRow(query, courseId).Scan(&roleId)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", nil
		}
		return "", err
	}
	return roleId, nil
}

func (r CourseRepositoryImplementation) UpdateCourseDiscord(courseId int, roleId string, channelId string, channelName string) error {
	queryDelete := `DELETE FROM discord_channels WHERE course_ID = $1`
	_, err := r.db.Exec(queryDelete, courseId)
	if err != nil {
		return err
	}

	queryInsert := `INSERT INTO discord_channels(course_ID, role_id, channel_id, channel_name)
				VALUES($1, $2, $3, $4)`
	_, err = r.db.Exec(queryInsert, courseId, roleId, channelId, channelName)
	return err
}

func (r CourseRepositoryImplementation) DeleteCourse(id int) error {
	query := "UPDATE courses SET deleted_date = $1 WHERE course_ID = $2"
	_, err := r.db.Exec(query, time.Now(), id)
	if err != nil {
		return err
	}

	// query = "UPDATE ta_job_posting SET deleted_date = $1 WHERE course_id = $2"
	// _, err = r.db.Exec(query, time.Now(), id)
	// if err != nil {
	// 	return err
	// }

	return nil
}

func (r CourseRepositoryImplementation) CreateJobPost(body request.CreateJobPost) (int, error) {
	query := `INSERT INTO ta_job_posting(
				course_ID,
				professor_ID,
				location,
				ta_allocation,
				grade_ID,
				task,
				status_ID,
				created_date)
			VALUES($1, $2, $3, $4, $5, $6, $7, $8)
			RETURNING id`
	var lastInsertId int
	statusID := 1
	err := r.db.QueryRow(query,
		body.CourseID,
		body.ProfessorID,
		body.Location,
		body.TaAllocation,
		body.GradeID,
		body.Task,
		statusID,
		time.Now(),
	).Scan(&lastInsertId)
	if err != nil {
		return 0, err
	}
	return lastInsertId, nil
}

func (r CourseRepositoryImplementation) UpdateJobPost(body request.UpdateJobPost) error {
	query := "UPDATE ta_job_posting SET "
	params := []interface{}{}
	placeholderID := 1 // PostgreSQL needs $1, $2...
	// Helper to add fields and increment the counter
	addField := func(columnName string, value interface{}) {
		query += fmt.Sprintf("%s = $%d, ", columnName, placeholderID)
		params = append(params, value)
		placeholderID++
	}
	// 1. Check each field
	if body.ProfessorID != nil {
		addField("professor_ID", body.ProfessorID)
	}
	if body.Location != nil {
		addField("location", body.Location)
	}
	if body.TaAllocation != nil {
		addField("ta_allocation", body.TaAllocation)
	}
	if body.GradeID != nil {
		addField("grade_ID", body.GradeID)
	}
	if body.Task != nil {
		addField("task", body.Task)
	}
	// 2. Safety Check: Did the user send ANY data?
	if len(params) == 0 {
		return nil // Or return an error "nothing to update"
	}
	// 3. Finalize the query string
	query = strings.TrimSuffix(query, ", ")
	query += fmt.Sprintf(" WHERE id = $%d;", placeholderID)
	params = append(params, body.Id)
	// 4. Execute
	_, err := r.db.Exec(query, params...)
	if err != nil {
		return err
	}
	return nil
}

func (r CourseRepositoryImplementation) DeleteJobPost(jobPostId int) error {
	query := "UPDATE ta_job_posting SET deleted_date = $1 WHERE id = $2"
	_, err := r.db.Exec(query, time.Now(), jobPostId)
	if err != nil {
		return err
	}
	return nil
}

func (r CourseRepositoryImplementation) GetJobPostByID(jobPostId int) (*response.JobPost, error) {
	query := `SELECT 
				j.task,
				j.id,
				c.course_code, 
				c.course_name, 
				j.ta_allocation, 
				c.work_hour,
				c.class_start,
				c.class_end,
				j.location,
				cp.course_program_value_thai,
				cd.class_day_value_thai, 
				CONCAT(p.prefix, ' ', p.firstname_thai, ' ', p.lastname_thai) as fullname,
				s.semester_value,
				st.status_value,
				g.grade_value,
				j.course_ID,
				j.status_ID,
				c.sec
			FROM ta_job_posting AS j
			LEFT JOIN courses AS c
				ON j.course_ID = c.course_ID
			LEFT JOIN class_days AS cd
				ON c.class_day_ID = cd.class_day_ID 
			LEFT JOIN course_programs AS cp
				ON c.course_program_ID = cp.course_program_ID
			LEFT JOIN professors AS p
				ON c.professor_ID = p.professor_ID
			LEFT JOIN semester AS s
				ON c.semester_ID = s.semester_ID
			LEFT JOIN status AS st
				ON j.status_ID = st.status_ID
			LEFT JOIN grades AS g
				ON j.grade_ID = g.grade_ID
			WHERE j.id = $1`

	var course response.JobPost
	var fullname string

	err := r.db.QueryRow(query, jobPostId).Scan(
		&course.Task,
		&course.JobPostID,
		&course.CourseCode,
		&course.CourseName,
		&course.TaAllocation,
		&course.WorkHour,
		&course.ClassStart,
		&course.ClassEnd,
		&course.Location,
		&course.CourseProgram,
		&course.Classday,
		&fullname,
		&course.Semester,
		&course.Status,
		&course.Grade,
		&course.CourseID,
		&course.StatusID,
		&course.Section,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("job post not found")
		}
		return nil, err
	}

	course.ProfessorName = fullname
	return &course, nil
}

func (r CourseRepositoryImplementation) ApplyJobPost(body request.ApplyJobPost) (int, error) {

	//check student cannot make duplicate apply on same job_post
	var count int
	queryCheck := `SELECT COUNT(*) FROM ta_application 
					WHERE job_post_id = $1
					AND student_id = $2`

	err := r.db.QueryRow(queryCheck, body.JobPostID, body.StudentID).Scan(&count)
	if err != nil {
		return 0, err
	}

	if count > 0 {
		return 0, fmt.Errorf("student:%d already apply to this job", body.StudentID)
	}

	//check ta allocation
	var taAllocation int
	query := `SELECT ta_allocation FROM ta_job_posting WHERE id = $1`
	err = r.db.QueryRow(query, body.JobPostID).Scan(&taAllocation)
	if err != nil {
		return 0, err
	}

	allocationQuery := `SELECT COUNT(*) FROM ta_application WHERE job_post_id = $1 AND status_id = $2`
	allocationCount := 0
	err = r.db.QueryRow(allocationQuery, body.JobPostID, constants.ApprovedStatusID).Scan(&allocationCount)
	if err != nil {
		return 0, err
	}

	if allocationCount >= taAllocation {
		return 0, fmt.Errorf("ta allocation is full")
	}

	tx, err := r.db.Begin()
	if err != nil {
		return 0, err
	}

	if body.TranscriptBytes != nil {
		query := `INSERT INTO transcript_storage(file_bytes,file_name,student_ID) 
					VALUES($1, $2, $3) 
					ON CONFLICT (student_ID)
					DO UPDATE SET
						file_bytes = EXCLUDED.file_bytes,
						file_name = EXCLUDED.file_name;`
		_, err = tx.Exec(query, body.TranscriptBytes, body.TranscriptName, body.StudentID)
		if err != nil {
			tx.Rollback()
			return 0, fmt.Errorf("failed on upsert to transcript file : %v", err)
		}

	}

	if body.BankAccountBytes != nil {
		query := `INSERT INTO bank_account_storage(file_bytes,file_name, student_ID) 
					VALUES($1, $2, $3)
					ON CONFLICT(student_ID)
					DO UPDATE SET
						file_bytes = EXCLUDED.file_bytes,
						file_name = EXCLUDED.file_name; `
		_, err = tx.Exec(query, body.BankAccountBytes, body.BankAccountName, body.StudentID)
		if err != nil {
			tx.Rollback()
			return 0, fmt.Errorf("failed on upsert to bank account file : %v", err)
		}

	}

	if body.StudentCardBytes != nil {
		query := `INSERT INTO student_card_storage(file_bytes,file_name, student_ID) 
					VALUES($1, $2, $3) 
					ON CONFLICT(student_ID)
					DO UPDATE SET
						file_bytes = EXCLUDED.file_bytes,
						file_name = EXCLUDED.file_name;`
		_, err = tx.Exec(query, body.StudentCardBytes, body.StudentCardName, body.StudentID)
		if err != nil {
			tx.Rollback()
			return 0, fmt.Errorf("failed on upsert to student card file : %v", err)
		}
	}

	updateStudentQuery := `UPDATE students SET 
							firstname_thai = $1, 
							lastname_thai = $2 
							WHERE student_ID=$3`
	_, err = r.db.Exec(updateStudentQuery, body.FirstnameThai, body.LastnameThai, body.StudentID)
	if err != nil {
		return 0, fmt.Errorf("failed on update student data : %v", err)
	}

	statusId := constants.PendingStatusID
	var applicationId int
	query = `INSERT INTO ta_application(
				student_ID, 
				status_ID, 
				job_post_ID,
				grade,
				purpose,
				created_date)
			VALUES($1, $2, $3, $4, $5, $6 )
			RETURNING id`

	err = tx.QueryRow(query,
		body.StudentID,
		statusId,
		body.JobPostID,
		body.Grade,
		body.Purpose,
		time.Now(),
	).Scan(&applicationId)

	if err != nil {
		tx.Rollback()
		return 0, fmt.Errorf("failed on insert to ta_application: %v", err)
	}

	query = "UPDATE students SET phone_number = $1, firstname_thai = $2, lastname_thai = $3 WHERE student_ID = $4"
	_, err = tx.Exec(query, body.PhoneNumber, body.FirstnameThai, body.LastnameThai, body.StudentID)
	if err != nil {
		tx.Rollback()
		return 0, fmt.Errorf("failed on update to students: %v", err)
	}

	err = tx.Commit()
	if err != nil {
		tx.Rollback()
		return 0, fmt.Errorf("failed on commit transaction")
	}

	return applicationId, nil

}

func (r CourseRepositoryImplementation) GetApplicationByStudentId(studentId int) ([]response.Application, error) {
	query := `SELECT 
					ta.id,
					ta.student_ID, 
					ta.status_ID, 
					tp.id,
					tp.course_ID, 
					ta.created_date,
					st.status_value,
					c.course_name,
					c.class_day,
					c.class_start,
					c.class_end,
					p.firstname,
					p.lastname,
					tp.location,
					ta.reject_reason
				FROM ta_application AS ta 
				LEFT JOIN ta_job_posting AS tp
					ON ta.job_post_ID = tp.id
				LEFT JOIN courses AS c
					ON tp.course_ID = c.course_ID
				LEFT JOIN professors AS p
					ON c.professor_ID = p.professor_ID
				LEFT JOIN status AS st
					ON ta.status_ID = st.status_ID
				WHERE student_ID = $1`

	rows, err := r.db.Query(query, studentId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var applications []response.Application
	for rows.Next() {
		var application response.Application
		var firstname, lastname string

		var jobPostID *int
		var rejectReason *string
		err := rows.Scan(
			&application.ApplicationId,
			&application.StudentID,
			&application.StatusID,
			&jobPostID,
			&application.CourseID,
			&application.CreatedDate,
			&application.StatusCode,
			&application.CourseName,
			&application.Classday,
			&application.ClassStart,
			&application.ClassEnd,
			&firstname,
			&lastname,
			&application.Location,
			&rejectReason,
		)
		if err != nil {
			return nil, err
		}
		application.ProfessorName = firstname + " " + lastname
		if jobPostID != nil {
			application.JobPostID = *jobPostID
		}
		if rejectReason != nil {
			application.RejectReason = *rejectReason
		}
		applications = append(applications, application)
	}

	return applications, nil
}

func (r CourseRepositoryImplementation) GetApplicationByCourseId(courseId int) ([]response.Application, error) {
	query := `SELECT 
					ta.id,
					ta.student_ID, 
					ta.status_ID, 
					tp.course_ID, 
					ta.created_date,
					st.status_value,
					s.firstname_thai,
					s.lastname_thai,
					CASE WHEN ts.transcript_ID IS NOT NULL THEN true ELSE false END as has_transcript,
					CASE WHEN ba.bank_account_ID IS NOT NULL THEN true ELSE false END as has_bank_account,
					CASE WHEN sc.student_card_ID IS NOT NULL THEN true ELSE false END as has_student_card
				FROM ta_application AS ta 
				LEFT JOIN ta_job_posting AS tp
					ON ta.job_post_ID = tp.id
				LEFT JOIN status AS st
					ON ta.status_ID = st.status_ID
				LEFT JOIN students AS s
					ON ta.student_ID = s.student_ID
				LEFT JOIN transcript_storage ts
					ON ta.student_ID = ts.student_ID
				LEFT JOIN student_card_storage sc
					ON ta.student_ID = sc.student_ID
				LEFT JOIN bank_account_storage ba
					ON ta.student_ID = ba.student_ID
				WHERE course_ID = $1`

	rows, err := r.db.Query(query, courseId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var applications []response.Application
	for rows.Next() {
		var application response.Application
		var firstname string
		var lastname string

		err := rows.Scan(
			&application.ApplicationId,
			&application.StudentID,
			&application.StatusID,
			&application.CourseID,
			&application.CreatedDate,
			&application.StatusCode,
			&firstname,
			&lastname,
			&application.HasTranscript,
			&application.HasBankAccount,
			&application.HasStudentCard,
		)
		if err != nil {
			return nil, err
		}
		application.StudentName = firstname + " " + lastname
		applications = append(applications, application)
	}

	return applications, nil
}

func (r CourseRepositoryImplementation) GetApplicationDetail(ApplicationId int) (*response.Application, error) {
	query := `SELECT 
					ta.student_ID, 
					ta.status_ID, 
					ta.course_ID, 
					ta.created_date,
					st.status_value,
					s.phone_number
				FROM ta_application AS ta 
				LEFT JOIN status AS st
					ON ta.status_ID = st.status_ID
				LEFT JOIN students AS s
					ON ta.student_ID = s.student_ID
				WHERE ta.id = $1`

	var application response.Application
	err := r.db.QueryRow(query, ApplicationId).Scan(
		&application.StudentID,
		&application.StatusID,
		&application.CourseID,
		&application.CreatedDate,
		&application.StatusCode,
		&application.PhoneNumber,
	)
	if err != nil {
		return nil, err
	}

	return &application, nil
}

func (r CourseRepositoryImplementation) GetApplicationTranscriptPdf(ApplicationId int) (*response.PdfFile, error) {
	query := `SELECT
				fs.file_name,
				fs.file_bytes
			FROM ta_application as ta
			LEFT JOIN transcript_storage as fs
			ON ta.transcript_ID = fs.transcript_ID
			WHERE ta.id = $1`

	var application response.PdfFile
	err := r.db.QueryRow(query, ApplicationId).Scan(
		&application.FileName,
		&application.FileBytes,
	)
	if err != nil {
		return nil, err
	}
	return &application, nil
}

func (r CourseRepositoryImplementation) GetApplicationBankAccountPdf(ApplicationId int) (*response.PdfFile, error) {
	query := `SELECT
				fs.file_name,
				fs.file_bytes
			FROM ta_application as ta
			LEFT JOIN bank_account_storage as fs
			ON ta.bank_account_ID = fs.bank_account_ID
			WHERE ta.id = $1`
	var applicationPdf response.PdfFile
	err := r.db.QueryRow(query, ApplicationId).Scan(
		&applicationPdf.FileName,
		&applicationPdf.FileBytes,
	)
	if err != nil {
		return nil, err
	}
	return &applicationPdf, nil
}

func (r CourseRepositoryImplementation) GetApplicationStudentCardPdf(ApplicationId int) (*response.PdfFile, error) {
	query := `SELECT
				fs.file_name,
				fs.file_bytes
			FROM ta_application as ta
			LEFT JOIN student_card_storage as fs
			ON ta.student_card_ID = fs.student_card_ID
			WHERE ta.id = $1`
	var applicationPdf response.PdfFile
	err := r.db.QueryRow(query, ApplicationId).Scan(
		&applicationPdf.FileName,
		&applicationPdf.FileBytes,
	)
	if err != nil {
		return nil, err
	}
	return &applicationPdf, nil
}

func (r CourseRepositoryImplementation) ApproveApplication(ApplicationId int) error {

	tx, err := r.db.Begin()
	if err != nil {
		return err
	}

	//get courseId,studentId
	pendingStatus := 3
	var courseId int
	var studentId int
	var jobPostId int
	query := `SELECT 
					jp.course_ID, 
					jp.id,
					ta.student_ID 
				FROM ta_application as ta
				LEFT JOIN ta_job_posting as jp
					ON ta.job_post_ID = jp.id
				WHERE ta.id =$1 AND ta.status_id =$2`

	err = tx.QueryRow(query,
		ApplicationId,
		pendingStatus).Scan(&courseId, &jobPostId, &studentId)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed get courseId : %v", err)
	}

	//check ta allocation
	var taAllocation int
	query = `SELECT ta_allocation FROM ta_job_posting WHERE id = $1`
	err = r.db.QueryRow(query, jobPostId).Scan(&taAllocation)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed get ta allocation : %v", err)
	}

	allocationQuery := `SELECT COUNT(*) FROM ta_application WHERE job_post_id = $1 AND status_id = $2`
	allocationCount := 0
	err = r.db.QueryRow(allocationQuery, jobPostId, constants.ApprovedStatusID).Scan(&allocationCount)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed get allocation count : %v", err)
	}

	if allocationCount >= taAllocation {
		tx.Rollback()
		return fmt.Errorf("ta allocation is full")
	}

	//update status on ta_application
	approveStatus := constants.ApprovedStatusID
	query = `UPDATE ta_application SET status_ID = $1 WHERE id = $2`

	_, err = tx.Exec(query, approveStatus, ApplicationId)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed update ta_application: %v", err)
	}

	//Insert new ta_course
	query = `INSERT INTO ta_courses(
				student_ID,
				course_ID,
				created_date)
				VALUES($1, $2, $3)`
	_, err = tx.Exec(query, studentId, courseId, time.Now())
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to Insert new ta_course : %v", err)
	}

	if err := tx.Commit(); err != nil {
		tx.Rollback()
		return fmt.Errorf("failed on commit transaction")
	}
	//check ta allocation
	allocationQuery = `SELECT COUNT(*) FROM ta_application WHERE job_post_id = $1 AND status_id = $2`
	allocationCount = 0
	err = r.db.QueryRow(allocationQuery, jobPostId, constants.ApprovedStatusID).Scan(&allocationCount)
	if err != nil {
		return fmt.Errorf("failed get allocation count : %v", err)
	}

	if allocationCount == taAllocation {
		query = `UPDATE ta_job_posting SET status_id = $1 WHERE id = $2`
		_, err = r.db.Exec(query, constants.SuccessFulStatusID, jobPostId)
		if err != nil {
			return fmt.Errorf("failed update ta_job_posting: %v", err)
		}
	}

	return nil
}

func (r CourseRepositoryImplementation) RejectApplication(rq request.RejectApplication) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}

	// update status on ta_application
	rejectStatus := constants.RejectedStatusID
	query := `UPDATE ta_application SET status_ID = $1, reject_reason = $2 WHERE id = $3`

	_, err = tx.Exec(query, rejectStatus, rq.RejectReason, rq.ApplicationId)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed update ta_application: %v", err)
	}

	if err := tx.Commit(); err != nil {
		tx.Rollback()
		return fmt.Errorf("failed on commit transaction")
	}
	return nil
}

func (r CourseRepositoryImplementation) GetApplicationByProfessorId(professorId int) ([]response.Application, error) {
	query := `SELECT 
					ta.id,
					ta.student_ID, 
					ta.status_ID, 
					jp.course_ID, 
					ta.created_date,
					st.status_value,
					c.course_name,
					ta.grade,
					stu.firstname,
					stu.lastname,
					stu.firstname_thai,
					stu.lastname_thai,
					stu.phone_number,
					CASE WHEN ts.transcript_ID IS NOT NULL THEN true ELSE false END as has_transcript,
					CASE WHEN ba.bank_account_ID IS NOT NULL THEN true ELSE false END as has_bank_account,
					CASE WHEN sc.student_card_ID IS NOT NULL THEN true ELSE false END as has_student_card
				FROM ta_application AS ta 
				LEFT JOIN status AS st
					ON ta.status_ID = st.status_ID
				LEFT JOIN ta_job_posting AS jp
					ON ta.job_post_ID = jp.id
				LEFT JOIN courses AS c
					ON jp.course_ID = c.course_ID
				LEFT JOIN students AS stu
					ON ta.student_id = stu.student_id
				LEFT JOIN transcript_storage ts
					ON ta.student_ID = ts.student_ID
				LEFT JOIN student_card_storage sc
					ON ta.student_ID = sc.student_ID
				LEFT JOIN bank_account_storage ba
					ON ta.student_ID = ba.student_ID
				WHERE c.professor_ID = $1`

	rows, err := r.db.Query(query, professorId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var applications []response.Application
	for rows.Next() {
		var application response.Application
		var firstname string
		var lastname string
		var firstnameTH sql.NullString
		var lastnameTH sql.NullString

		err := rows.Scan(
			&application.ApplicationId,
			&application.StudentID,
			&application.StatusID,
			&application.CourseID,
			&application.CreatedDate,
			&application.StatusCode,
			&application.CourseName,
			&application.Grade,
			&firstname,
			&lastname,
			&firstnameTH,
			&lastnameTH,
			&application.PhoneNumber,
			&application.HasTranscript,
			&application.HasBankAccount,
			&application.HasStudentCard,
		)
		if err != nil {
			return nil, err
		}

		application.StudentName = firstname + " " + lastname
		application.StudentNameTH = firstnameTH.String + " " + lastnameTH.String
		applications = append(applications, application)
	}

	return applications, nil
}
