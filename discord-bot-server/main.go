package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"

	"github.com/bwmarrin/discordgo"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"pithawat-discord-bot-server.github.com/bot"
)

var dg *discordgo.Session

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file")
	}

	fmt.Printf("token: %s", os.Getenv("BOT_TOKEN"))
	dg, err = discordgo.New("Bot " + os.Getenv("BOT_TOKEN"))
	if err != nil {
		log.Fatalf("error to start discord  session: %v\n", err)
	}
	err = dg.Open()
	if err != nil {
		log.Fatalf("error opening connection: %v\n", err)
	}
	defer dg.Close()

	r := gin.Default()

	r.POST("/create-channel", func(ctx *gin.Context) {

		var json struct {
			Name    string `json:"name"`
			GuildID string `json:"guildID"`
		}
		if err := ctx.BindJSON(&json); err != nil {
			ctx.JSON(400, gin.H{"error": err.Error()})
			return
		}
		fmt.Print("guildID", json.GuildID)

		role, channel, err := bot.SetUpCourse(dg, json.GuildID, json.Name)
		if err != nil {
			ctx.JSON(500, gin.H{"error": err.Error()})
			return
		}

		ctx.JSON(201, gin.H{"roleID": role, "channelID": channel})
	})

	r.GET("/join-course/:role_id", func(c *gin.Context) {
		roleID := c.Param("role_id")

		// Construct the Discord Auth URL
		// We pass the role_id in the 'state' parameter
		authURL := fmt.Sprintf("https://discord.com/api/oauth2/authorize?client_id=%s&redirect_uri=%s&response_type=code&scope=identify+guilds.join&state=%s",
			os.Getenv("CLIENT_ID"), os.Getenv("REDIRECT_URL"), roleID)

		c.JSON(200, gin.H{"authUrl": authURL})
	})

	r.GET("/auth/callback", func(c *gin.Context) {
		code := c.Query("code")
		roleID := c.Query("state") // Retrieve the Role ID we sent from the Main App

		// 1. Exchange code for Access Token
		accessToken, err := getAccessToken(code)
		if err != nil {
			c.String(500, "Failed to get access token")
			return
		}

		// 2. Get User ID using that Token
		userID, err := getUserID(accessToken)
		if err != nil {
			c.String(500, "Failed to get User ID")
			return
		}
		fmt.Println("userID", userID)

		// 3. Assign the Role and Add User to Discord
		params := &discordgo.GuildMemberAddParams{
			AccessToken: accessToken,
			Roles:       []string{roleID}, // This adds the role automatically on join
		}
		// 3. Assign the Role in Discord
		_ = dg.GuildMemberAdd(os.Getenv("GUILD_ID"), userID, params)

		// STEP 2: Explicitly add the role.
		// This works if they were already in the server OR if they just joined.
		// Discord handles this gracefully even if they already have the role.
		err = dg.GuildMemberRoleAdd(os.Getenv("GUILD_ID"), userID, roleID)

		if err != nil {
			// If this fails, it's usually a permission/hierarchy issue
			c.String(500, "Access Error: Could not assign course role. "+err.Error())
			return
		}

		c.String(200, "Success! You now have access to the course in Discord.")
	})
	// r.POST("/internal/assign-role", func(ctx *gin.Context) {

	// 	var req struct {
	// 		GuildID string `json:"guildID"`
	// 		UserID  string `json:"userID"`
	// 		RoleID  string `json:"roleID"`
	// 	}

	// 	if err := ctx.BindJSON(&req); err != nil {
	// 		ctx.JSON(400, gin.H{"error": "Invalid request"})
	// 		return
	// 	}

	// 	// Perform the action
	// 	err = dg.GuildMemberRoleAdd(req.GuildID, req.UserID, req.RoleID)
	// 	if err != nil {
	// 		ctx.JSON(500, gin.H{"error": "Discord error: " + err.Error()})
	// 		return
	// 	}

	// 	ctx.JSON(200, gin.H{"status": "success"})
	// })

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("error to start server: %v\n", err)
	}
	fmt.Println("server is listening on port: ", port)
}

func getAccessToken(code string) (string, error) {
	data := url.Values{}
	data.Set("client_id", os.Getenv("CLIENT_ID"))
	data.Set("client_secret", os.Getenv("CLIENT_SECRET"))
	data.Set("grant_type", "authorization_code")
	data.Set("code", code)
	data.Set("redirect_uri", os.Getenv("REDIRECT_URL"))

	resp, _ := http.PostForm("https://discord.com/api/v10/oauth2/token", data)
	var res map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&res)
	return res["access_token"].(string), nil
}

func getUserID(token string) (string, error) {
	req, _ := http.NewRequest("GET", "https://discord.com/api/v10/users/@me", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	res, _ := http.DefaultClient.Do(req)
	var user discordgo.User
	json.NewDecoder(res.Body).Decode(&user)
	return user.ID, nil
}
