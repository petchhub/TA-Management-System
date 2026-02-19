package service

import (
	"TA-management/internal/modules/course/dto/request"
	courseResponse "TA-management/internal/modules/course/dto/response"
	"TA-management/internal/modules/course/repository"
	"TA-management/internal/modules/shared/dto/response"
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type CourseServiceImplementation struct {
	repo        repository.CourseRepository
	redisClient *redis.Client
}

func NewCourseService(repo repository.CourseRepository, redisClient *redis.Client) CourseServiceImplementation {
	return CourseServiceImplementation{repo: repo, redisClient: redisClient}
}

func (s CourseServiceImplementation) GetAllJobPost() (*response.RequestDataResponse, error) {

	courses, err := s.repo.GetAllJobPost()
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	response := response.RequestDataResponse{
		Data:    courses,
		Message: "Success",
	}

	return &response, nil
}

func (s CourseServiceImplementation) GetAllJobPostAllStatus() (*response.RequestDataResponse, error) {

	courses, err := s.repo.GetAllJobPostAllStatus()
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	response := response.RequestDataResponse{
		Data:    courses,
		Message: "Success",
	}

	return &response, nil
}

func (s CourseServiceImplementation) GetAllJobPostByStudentId(studentId int) (*response.RequestDataResponse, error) {
	courses, err := s.repo.GetAllJobPostByStudentId(studentId)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	response := response.RequestDataResponse{
		Data:    courses,
		Message: "Success",
	}

	return &response, nil
}

func (s CourseServiceImplementation) GetAllCourse() (*response.RequestDataResponse, error) {
	ctx := context.Background()
	cacheKey := "course:all"

	// Check cache
	val, err := s.redisClient.Get(ctx, cacheKey).Result()
	if err == nil {
		fmt.Println("from redis")
		var courses []courseResponse.Course
		if err := json.Unmarshal([]byte(val), &courses); err == nil {
			return &response.RequestDataResponse{
				Data:    courses,
				Message: "Success",
			}, nil
		}
	}

	courses, err := s.repo.GetAllCourse()
	fmt.Println("from DB")
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	// Set cache
	if data, err := json.Marshal(courses); err == nil {
		s.redisClient.Set(ctx, cacheKey, data, 10*time.Minute)
	}

	response := response.RequestDataResponse{
		Data:    courses,
		Message: "Success",
	}

	return &response, nil
}

func (s CourseServiceImplementation) CreateCourse(body request.CreateCourse) (response.CreateResponse, error) {
	id, err := s.repo.CreateCourse(body)
	if err != nil {
		fmt.Println(err)
		return response.CreateResponse{
			Message: "Create Failed!",
		}, err
	}

	// Invalidate cache
	s.redisClient.Del(context.Background(), "course:all")

	return response.CreateResponse{
		Message: "Created successfully!",
		Id:      id,
	}, nil
}

func (s CourseServiceImplementation) UpdateCourse(body request.UpdateCourse) (response.GeneralResponse, error) {
	err := s.repo.UpdateCourse(body)
	if err != nil {
		fmt.Println(err)
		return response.GeneralResponse{Message: "Update Failed!"}, err
	}
	// Invalidate cache
	s.redisClient.Del(context.Background(), "course:all")
	return response.GeneralResponse{Message: "Update Successful"}, err
}

func (s CourseServiceImplementation) DeleteCourse(id int) (response.GeneralResponse, error) {
	err := s.repo.DeleteCourse(id)
	if err != nil {
		fmt.Println(err)
		return response.GeneralResponse{Message: "Delete Failed!"}, err
	}
	// Invalidate cache
	s.redisClient.Del(context.Background(), "course:all")
	return response.GeneralResponse{Message: "Delete Successful"}, err
}

func (s CourseServiceImplementation) CreateJobPost(body request.CreateJobPost) (response.CreateResponse, error) {
	id, err := s.repo.CreateJobPost(body)
	if err != nil {
		fmt.Println(err)
		return response.CreateResponse{
			Message: "Create Job Post Failed!",
		}, err
	}
	return response.CreateResponse{
		Message: "Create Job Post Successfully",
		Id:      id,
	}, nil
}

func (s CourseServiceImplementation) UpdateJobPost(body request.UpdateJobPost) (*response.RequestDataResponse, error) {
	err := s.repo.UpdateJobPost(body)
	if err != nil {
		return nil, err
	}

	jobPost, err := s.repo.GetJobPostByID(body.Id)
	if err != nil {
		return nil, err
	}

	return &response.RequestDataResponse{
		Data:    jobPost,
		Message: "Update Job Post Successful",
	}, nil
}

func (s CourseServiceImplementation) DeleteJobPost(jobPostId int) (response.GeneralResponse, error) {
	err := s.repo.DeleteJobPost(jobPostId)
	if err != nil {
		fmt.Println(err)
		return response.GeneralResponse{Message: "Delete Job Post Failed!"}, err
	}
	return response.GeneralResponse{Message: "Delete Job Post Successful"}, err
}

func (s CourseServiceImplementation) ApplyJobPost(body request.ApplyJobPost) (*response.CreateResponse, error) {
	id, err := s.repo.ApplyJobPost(body)
	if err != nil {
		return nil, err
	}
	return &response.CreateResponse{
		Message: "Apply course successfully",
		Id:      id,
	}, nil
}

func (s CourseServiceImplementation) GetApplicationByStudentId(studentId int) (*response.RequestDataResponse, error) {
	applications, err := s.repo.GetApplicationByStudentId(studentId)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return &response.RequestDataResponse{
		Data:    applications,
		Message: "GET success",
	}, nil

}

func (s CourseServiceImplementation) GetAllTimeApprovedCoursesByStudentId(studentId int) (*response.RequestDataResponse, error) {
	applications, err := s.repo.GetAllTimeApprovedCoursesByStudentId(studentId)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return &response.RequestDataResponse{
		Data:    applications,
		Message: "GET success",
	}, nil
}

func (s CourseServiceImplementation) GetApplicationByCourseId(courseId int) (*response.RequestDataResponse, error) {
	applications, err := s.repo.GetApplicationByCourseId(courseId)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return &response.RequestDataResponse{
		Data:    applications,
		Message: "GET success",
	}, nil
}

func (s CourseServiceImplementation) GetApplicationDetail(applicationId int) (*response.RequestDataResponse, error) {
	application, err := s.repo.GetApplicationDetail(applicationId)
	if err != nil {
		return nil, nil
	}
	return &response.RequestDataResponse{
		Data:    application,
		Message: "GET SUCCESS",
	}, nil

}

func (s CourseServiceImplementation) GetApplicationTranscriptPdf(applicationId int) (*courseResponse.PdfFile, error) {
	applicationPdf, err := s.repo.GetApplicationTranscriptPdf(applicationId)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return applicationPdf, nil
}

func (s CourseServiceImplementation) GetApplicationBankAccountPdf(applicationId int) (*courseResponse.PdfFile, error) {
	applicationPdf, err := s.repo.GetApplicationBankAccountPdf(applicationId)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return applicationPdf, nil
}

func (s CourseServiceImplementation) GetApplicationStudentCardPdf(applicationId int) (*courseResponse.PdfFile, error) {
	applicationPdf, err := s.repo.GetApplicationStudentCardPdf(applicationId)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return applicationPdf, nil
}

func (s CourseServiceImplementation) ApproveApplication(applicationId int) (*response.GeneralResponse, error) {
	err := s.repo.ApproveApplication(applicationId)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return &response.GeneralResponse{
		Message: "Approved application Successful",
	}, nil
}

func (s CourseServiceImplementation) GetProfessorCourse(professorId int) (*response.RequestDataResponse, error) {
	courses, err := s.repo.GetProfessorCourse(professorId)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	response := response.RequestDataResponse{
		Data:    courses,
		Message: "Success",
	}

	return &response, nil
}

func (s CourseServiceImplementation) GetApplicationByProfessorId(professorId int) (*response.RequestDataResponse, error) {
	applications, err := s.repo.GetApplicationByProfessorId(professorId)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return &response.RequestDataResponse{
		Data:    applications,
		Message: "GET success",
	}, nil
}

func (s CourseServiceImplementation) RejectApplication(rq request.RejectApplication) (*response.GeneralResponse, error) {
	err := s.repo.RejectApplication(rq)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return &response.GeneralResponse{
		Message: "Rejected application Successful",
	}, nil
}

func (s CourseServiceImplementation) UpdateCourseDiscord(courseId int, roleId string, channelId string, channelName string) (*response.GeneralResponse, error) {
	err := s.repo.UpdateCourseDiscord(courseId, roleId, channelId, channelName)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return &response.GeneralResponse{
		Message: "Update Discord Successful",
	}, nil
}

func (s CourseServiceImplementation) SoftDeleteExpiredData() error {
	return s.repo.SoftDeleteExpiredData()
}

func (s CourseServiceImplementation) GetTermHistory() (*response.RequestDataResponse, error) {
	result, err := s.repo.GetExpiredSemesters()
	if err != nil {
		return nil, err
	}
	return result, nil
}

func (s CourseServiceImplementation) GetHistoryCourses(semesterID int) (*response.RequestDataResponse, error) {
	result, err := s.repo.GetCoursesBySemesterID(semesterID)
	if err != nil {
		return nil, err
	}
	return result, nil
}
