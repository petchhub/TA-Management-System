package bot

import (
	"github.com/bwmarrin/discordgo"
)

// func CreateServer(s *discordgo.Session, name string) (string, error) {
// 	guild, err := s.GuildCreate(name)
// 	if err != nil {
// 		return "", err
// 	}

// 	channels, _ := s.GuildChannels(guild.ID)
// 	invite, err := s.ChannelInviteCreate(channels[0].ID, discordgo.Invite{
// 		MaxAge:  86400,
// 		MaxUses: 1,
// 	})

// 	return "http://discord.gg/" + invite.Code, err
// }

func SetupCourseInExistingServer(s *discordgo.Session, guildID string, courseName string) (string, error) {
	// 1. Create a Category for the Course
	category, err := s.GuildChannelCreateComplex(guildID, discordgo.GuildChannelCreateData{
		Name: courseName,
		Type: discordgo.ChannelTypeGuildCategory,
	})
	if err != nil {
		return "", err
	}

	// 2. Create a Text Channel inside that category
	channel, err := s.GuildChannelCreateComplex(guildID, discordgo.GuildChannelCreateData{
		Name:     "announcements",
		Type:     discordgo.ChannelTypeGuildText,
		ParentID: category.ID,
	})
	if err != nil {
		return "", err
	}

	// 3. Create an Invite directly to that new channel
	invite, err := s.ChannelInviteCreate(channel.ID, discordgo.Invite{
		MaxAge:  86400, // 24 hours
		MaxUses: 1,
	})

	return "https://discord.gg/" + invite.Code, err
}

// func CreateServerSecure(s *discordgo.Session, guildID string, name string) (string, error) {
// 	// 1. Check if Bot has "Manage Channels" permission in this server
// 	perms, err := s.UserChannelPermissions(s.State.User.ID, guildID)
// 	if err != nil {
// 		return "", fmt.Errorf("could not fetch bot permissions: %v", err)
// 	}

// 	if perms&discordgo.PermissionManageChannels == 0 {
// 		return "", fmt.Errorf("bot is missing 'Manage Channels' permission in server %s", guildID)
// 	}

// 	// 2. Proceed with creation (Same as before)
// 	guild, err := s.GuildCreate(name) // Reminder: This will still fail with 20001 for Bots
// 	// Use the Category/Channel logic from the previous step instead!

// 	return "...", nil
// }
