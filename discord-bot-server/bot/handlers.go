package bot

import "github.com/bwmarrin/discordgo"

func AddButtonHandlers(s *discordgo.Session) {
	s.AddHandler(func(s *discordgo.Session, i *discordgo.InteractionCreate) {
		if i.Type == discordgo.InteractionMessageComponent {
			data := i.MessageComponentData()

			// Custom format: "join_roleID"
			if len(data.CustomID) > 5 && data.CustomID[:5] == "join_" {
				roleID := data.CustomID[5:]

				// Assign the role
				err := s.GuildMemberRoleAdd(i.GuildID, i.Member.User.ID, roleID)

				msg := "✅ Success! You can now see the course channels."
				if err != nil {
					msg = "❌ Error: Could not assign role. Check bot permissions."
				}

				s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
					Type: discordgo.InteractionResponseChannelMessageWithSource,
					Data: &discordgo.InteractionResponseData{
						Content: msg,
						Flags:   discordgo.MessageFlagsEphemeral,
					},
				})
			}
		}
	})
}
