package controller

import (
	"TA-management/internal/modules/lookup/service"
	"TA-management/internal/modules/ta_duty/dto/request"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type LookupController struct {
	service service.LookupService
}

func NewLookupController(lookupService service.LookupService) *LookupController {
	return &LookupController{
		service: lookupService,
	}
}

func InitializeController(lookupService service.LookupService, r *gin.RouterGroup) {
	c := NewLookupController(lookupService)
	// r.Use()
	{
		r.GET("/course-program", c.getCourseProgram)
		r.GET("/classday", c.getClassday)
		r.GET("/semester", c.getSemester)
		r.GET("/grade", c.getGrade)
		r.GET("/professors", c.getProfessors)
		r.GET("/holiday", c.GetHolidays)
		r.POST("/holiday", c.AddSpecialHoliday)
		r.DELETE("/holiday/:id", c.DeleteHoliday)
	}
}

func (controller LookupController) getCourseProgram(ctx *gin.Context) {

	result, err := controller.service.GetCourseProgram()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"err": "something went wrong"})
		return
	}
	ctx.JSON(http.StatusOK, result)
}

func (controller LookupController) getClassday(ctx *gin.Context) {
	result, err := controller.service.GetClassday()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"err": "something went wrong"})
		return
	}
	ctx.JSON(http.StatusOK, result)
}

func (controller LookupController) getSemester(ctx *gin.Context) {
	result, err := controller.service.GetSemester()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong"})
		return
	}
	ctx.JSON(http.StatusOK, result)
}

func (controller LookupController) getGrade(ctx *gin.Context) {
	result, err := controller.service.GetGrade()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong"})
		return
	}
	ctx.JSON(http.StatusOK, result)
}

func (controller LookupController) getProfessors(ctx *gin.Context) {
	result, err := controller.service.GetProfessors()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong"})
		return
	}
	ctx.JSON(http.StatusOK, result)
}

func (controller LookupController) GetHolidays(ctx *gin.Context) {
	monthStr := ctx.Query("month")
	yearStr := ctx.Query("year")

	month, err := strconv.Atoi(monthStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid month"})
		return
	}

	year, err := strconv.Atoi(yearStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid year"})
		return
	}

	holidays, err := controller.service.GetHolidays(month, year)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch holidays: %v", err)})
		return
	}

	ctx.JSON(http.StatusOK, holidays)
}

func (controller LookupController) AddSpecialHoliday(ctx *gin.Context) {
	var req request.CreateHoliday
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	req.Type = "special" // Force type to be special

	if err := controller.service.AddSpecialHoliday(req); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to add holiday: %v", err)})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Holiday added successfully"})
}

func (controller LookupController) DeleteHoliday(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if err := controller.service.DeleteHoliday(id); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to delete holiday: %v", err)})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Holiday deleted successfully"})
}
