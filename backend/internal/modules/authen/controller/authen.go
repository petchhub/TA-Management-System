package controller

import (
	"TA-management/internal/modules/authen/service"
	"TA-management/internal/utils"

	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
)

type AuthController struct {
	service           service.AuthenService
	googleOAuthConfig *oauth2.Config
}

func NewAuthenController(authenService service.AuthenService, config *oauth2.Config) *AuthController {
	return &AuthController{
		service:           authenService,
		googleOAuthConfig: config,
	}
}

func InitializeController(authenService service.AuthenService, googleOAuthConfig *oauth2.Config, r *gin.RouterGroup) {
	c := NewAuthenController(authenService, googleOAuthConfig)
	r.Use()
	{
		r.GET("/google", c.handleLogin)
		r.GET("google/callback", c.handleCallback)
		r.GET("/me", c.getMe)
	}
}

func (controller AuthController) handleCallback(ctx *gin.Context) {
	queryState := ctx.Query("state")
	code := ctx.Query("code")

	if queryState == "" || code == "" {
		// Redirect to frontend with error
		ctx.Redirect(http.StatusTemporaryRedirect, "http://localhost:3000/login?error=invalid_request")
		return
	}

	cookieState, err := ctx.Cookie("oauth_state")
	if err != nil || cookieState == "" || cookieState != queryState {
		// Log the failure reason internally (optional but recommended)
		fmt.Printf("State check failed. Cookie Error: %v, Cookie State: %s, Query State: %s\n", err, cookieState, queryState)

		// Redirect to frontend with error
		ctx.Redirect(http.StatusTemporaryRedirect, "http://localhost:3000/login?error=state_mismatch")
		return
	}

	signedJWT, _, err := controller.service.HandleGoogleCallback(ctx, code)

	if err != nil {
		// Redirect to frontend with error
		errorMsg := "authentication_failed"
		if err.Error() == "email not verified" {
			errorMsg = "email_not_verified"
		} else if err.Error() == "code exchange failed" {
			errorMsg = "code_exchange_failed"
		}
		ctx.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("http://localhost:3000/login?error=%s", errorMsg))
		return
	}

	// Set auth cookie
	ctx.SetCookie("auth_token", signedJWT, 3600*24*7, "/", "localhost", false, true) // Cookie lasts 7 days

	// Redirect to frontend callback page
	ctx.Redirect(http.StatusTemporaryRedirect, "http://localhost:3000/login?success=true")
}

func (controller AuthController) handleLogin(ctx *gin.Context) {
	state, err := utils.RandState(24)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create state"})
	}
	utils.SetStateCookie(ctx.Writer, state)

	url := controller.googleOAuthConfig.AuthCodeURL(
		state,
		oauth2.AccessTypeOffline,
		oauth2.SetAuthURLParam("prompt", "consent"),
	)
	ctx.String(http.StatusOK, url)
}

func (controller AuthController) getMe(ctx *gin.Context) {
	// Get JWT token from cookie
	tokenString, err := ctx.Cookie("auth_token")
	if err != nil || tokenString == "" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: No auth token found"})
		return
	}

	// Decode JWT token
	claims, err := utils.DecodeToken(tokenString, []byte(utils.GetenvDefault("JWT_SECRET", "change-me-please")))
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
		return
	}

	// Return user data from claims
	ctx.JSON(http.StatusOK, gin.H{
		"id":    claims.Sub,
		"email": claims.Email,
		"name":  claims.Name,
		"role":  claims.Role,
	})
}
