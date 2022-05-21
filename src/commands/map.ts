import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { COMMANDS } from '../lib/commands';
import { game } from '../game';

//HEAD Add PM for nonplayer later
export default {
	data: new SlashCommandBuilder()
		.setName(COMMANDS.MAP.NAME)
		.setDescription(COMMANDS.MAP.DESCRIPTION)
    .addSubcommand(sub => 
      sub.setName(COMMANDS.MAP.SUBCOMMANDS.DEFAULT.NAME)
        .setDescription(COMMANDS.MAP.SUBCOMMANDS.DEFAULT.DESCRIPTION))
    .addSubcommand(sub => 
      sub.setName(COMMANDS.MAP.SUBCOMMANDS.NEXT.NAME)
        .setDescription(COMMANDS.MAP.SUBCOMMANDS.NEXT.DESCRIPTION))
    .addSubcommand(sub => 
      sub.setName(COMMANDS.MAP.SUBCOMMANDS.PREV.NAME)
        .setDescription(COMMANDS.MAP.SUBCOMMANDS.PREV.DESCRIPTION))

	, async execute(interaction: CommandInteraction) {

		const player = game.players.get(interaction.user.id);
    if (!player) {await interaction.reply({ content: "You are not a player in the game", ephemeral: true }); return;};

    //if 

    //player.hud.mapHUD();
  },
};