package controller

import (
	"TA-management/internal/modules/ta_duty/service"

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
	{
	}
}
