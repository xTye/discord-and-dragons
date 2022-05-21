import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { HUD } from '../hud';
import { COMMANDS } from '../lib/commands';
 
export default {
	data: new SlashCommandBuilder()
		.setName(COMMANDS.LOBBY.NAME)
		.setDescription(COMMANDS.LOBBY.DESCRIPTION)

	, async execute(interaction: CommandInteraction) {
    await HUD.GetPlayers(interaction);
  },
};