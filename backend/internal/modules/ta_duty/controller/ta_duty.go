package controller

import (
	"TA-management/internal/modules/ta_duty/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type TaDutyController struct {
	service service.TaDutyService
}

func NewTaDutyController(taDutyService service.TaDutyService) TaDutyController {
	return TaDutyController{service: taDutyService}
}

func InitializeController(taDutyService service.TaDutyService, r *gin.RouterGroup) {
	// r.Use() // Middleware if needed
	c := NewTaDutyController(taDutyService)
	{
		r.GET("/duty-roadmap", c.getTADutyRoadmap)
		r.POST("/marked-duty", c.markDutyAsDone)
	}
}

func (controller TaDutyController) getTADutyRoadmap(ctx *gin.Context) {
	courseID, err := strconv.Atoi(ctx.Query("courseID"))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong"})
		return
	}

	studentID, err := strconv.Atoi(ctx.Query("studentID"))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong"})
		return
	}

	result, err := controller.service.GetTADutyRoadmap(courseID, studentID)

	ctx.JSON(http.StatusOK, result)
}

func (controller TaDutyController) markDutyAsDone(ctx *gin.Context) {
	courseID, err := strconv.Atoi(ctx.Query("courseID"))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong"})
		return
	}

	studentID, err := strconv.Atoi(ctx.Query("studentID"))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong"})
		return
	}

	dutyDate := ctx.Query("dutyDate")

	result, err := controller.service.MarkDutyAsDone(courseID, studentID, dutyDate)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong"})
		return
	}
	ctx.JSON(http.StatusCreated, result)
}
