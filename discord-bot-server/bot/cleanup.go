package bot

import (
	"fmt"
	"log"
	"strings"

	"github.com/bwmarrin/discordgo"
)

var whitelistedChannels = map[string]bool{
	"server-info":     true,
	"general-chat":    true,
	"member-join-log": true,
	"General":         true,
}

// normalizeName strips emoji prefixes so that "ℹ️│server-info" becomes "server-info".
func normalizeName(name string) string {
	if idx := strings.Index(name, "│"); idx != -1 {
		return strings.TrimSpace(name[idx+len("│"):])
	}
	return strings.TrimSpace(name)
}

var whitelistedRoles = map[string]bool{
	"TA-management_server": true,
	"@everyone":            true,
}

func CleanupSemester(s *discordgo.Session, guildID string) error {
	// 1. Cleanup Channels (Text, Voice, Categories)
	channels, err := s.GuildChannels(guildID)
	if err != nil {
		return fmt.Errorf("failed to fetch channels: %v", err)
	}

	for _, ch := range channels {
		if whitelistedChannels[normalizeName(ch.Name)] {
			continue
		}

		_, err := s.ChannelDelete(ch.ID)
		if err != nil {
			log.Printf("Failed to delete channel %s (%s): %v", ch.Name, ch.ID, err)
			// Continue deleting others
		} else {
			log.Printf("Deleted channel %s (%s)", ch.Name, ch.ID)
		}
	}

	// 2. Cleanup Roles
	roles, err := s.GuildRoles(guildID)
	if err != nil {
		return fmt.Errorf("failed to fetch roles: %v", err)
	}

	for _, role := range roles {
		// Skip whitelisted roles and managed roles (bots/integrations)
		if whitelistedRoles[role.Name] || role.Managed {
			continue
		}

		err := s.GuildRoleDelete(guildID, role.ID)
		if err != nil {
			log.Printf("Failed to delete role %s (%s): %v", role.Name, role.ID, err)
		} else {
			log.Printf("Deleted role %s (%s)", role.Name, role.ID)
		}
	}

	return nil
}
