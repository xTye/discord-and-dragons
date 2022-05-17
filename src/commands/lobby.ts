import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { COMMANDS } from '../lib/commands';
import { GetPlayers } from '../player';
 
export default {
	data: new SlashCommandBuilder()
		.setName(COMMANDS.LOBBY.NAME)
		.setDescription(COMMANDS.LOBBY.DESCRIPTION)

	, async execute(interaction: CommandInteraction) {
    await GetPlayers(interaction);
  },
};