package controller

import (
	"TA-management/internal/modules/ta_duty/service"
	"fmt"
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
		r.GET("/export-payment-report", c.exportPaymentReport)
	}
}

func (controller TaDutyController) getTADutyRoadmap(ctx *gin.Context) {
	courseID, err := strconv.Atoi(ctx.Query("courseID"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get query params : courseID "})
		return
	}

	studentID, err := strconv.Atoi(ctx.Query("studentID"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get query params : studentID "})
		return
	}

	result, err := controller.service.GetTADutyRoadmap(courseID, studentID)

	ctx.JSON(http.StatusOK, result)
}

func (controller TaDutyController) markDutyAsDone(ctx *gin.Context) {
	courseID, err := strconv.Atoi(ctx.Query("courseID"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get query params : courseID "})
		return
	}

	studentID, err := strconv.Atoi(ctx.Query("studentID"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get query params : studentID "})
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

func (controller TaDutyController) exportPaymentReport(ctx *gin.Context) {

	courseID, err := strconv.Atoi(ctx.Query("courseID"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get query params : courseID "})
		return
	}

	hourlyRate, err := strconv.Atoi(ctx.Query("hourlyRate"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get query params : hourlyRate "})
		return
	}

	buffer, err := controller.service.ExportPaymentReport(courseID, hourlyRate)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong"})
		return
	}

	fileName := fmt.Sprintf("Payment_Report_%d.xlsx", courseID)
	ctx.Header("Content-Description", "File Transfer")
	ctx.Header("Content-Transfer-Encoding", "binary")
	ctx.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", fileName))
	ctx.Header("Content-Type", "application/vnd.openxmlfomats-officedocument.sheet")
	ctx.Data(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer.Bytes())
}
