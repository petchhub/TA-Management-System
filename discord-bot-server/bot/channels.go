package bot

import "github.com/bwmarrin/discordgo"

func boolPointer(b bool) *bool {
	return &b
}

func SetUpCourse(s *discordgo.Session, guildID string, courseName string) (string, string, error) {

	// 1. Create Course Role
	role, _ := s.GuildRoleCreate(guildID, &discordgo.RoleParams{
		Name:        courseName,
		Mentionable: boolPointer(true),
		Hoist:       boolPointer(true),
	})

	// 2. Define Permissions (Lock everyone out, let Role in)
	// The ID for the @everyone role is the same as the GuildID
	everyoneID := guildID

	overWrites := []*discordgo.PermissionOverwrite{
		{
			ID:   everyoneID,
			Type: discordgo.PermissionOverwriteTypeRole,
			// Specifically deny ViewChannel to hide it from everyone else
			Deny: discordgo.PermissionViewChannel | discordgo.PermissionReadMessageHistory,
		},
		{
			ID:   role.ID,
			Type: discordgo.PermissionOverwriteTypeRole,
			// Specifically allow ViewChannel for the students
			Allow: discordgo.PermissionViewChannel | discordgo.PermissionSendMessages | discordgo.PermissionReadMessageHistory,
		},
	}

	// 3. Create Private Category
	category, err := s.GuildChannelCreateComplex(guildID, discordgo.GuildChannelCreateData{
		Name:                 courseName,
		Type:                 discordgo.ChannelTypeGuildCategory,
		PermissionOverwrites: overWrites,
	})
	if err != nil {
		return "", "", err
	}

	//4. Create Channel inside  Category
	channel, _ := s.GuildChannelCreateComplex(guildID, discordgo.GuildChannelCreateData{
		Name:     "Chat-" + courseName,
		Type:     discordgo.ChannelTypeGuildText,
		ParentID: category.ID,
	})

	// 5. Create Voice Channel inside Category
	s.GuildChannelCreateComplex(guildID, discordgo.GuildChannelCreateData{
		Name:     "Voice-" + courseName,
		Type:     discordgo.ChannelTypeGuildVoice,
		ParentID: category.ID,
	})

	return role.ID, channel.ID, nil
}
