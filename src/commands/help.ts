import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { COMMANDS } from '../lib/commands';
import { game } from '..';
 
export default {
	data: new SlashCommandBuilder()
		.setName(COMMANDS.HELP.NAME)
		.setDescription(COMMANDS.HELP.DESCRIPTION)

	, async execute(interaction: CommandInteraction) {

    const player = game.players.get(interaction.user.id);
    if (!player) {interaction.reply({ content: "Not a player, refer to the #help channel", ephemeral: true }); return;}

    await player.hud.loadHelp(interaction);
  },
};