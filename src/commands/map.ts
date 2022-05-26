import { SlashCommandBuilder } from '@discordjs/builders';
import { ButtonInteraction, CommandInteraction } from 'discord.js';
import { game } from '..';
import { COMMANDS } from '../lib/commands';

//HEAD Add PM for nonplayer later
export default {
	data: new SlashCommandBuilder()
		.setName(COMMANDS.MAP.NAME)
		.setDescription(COMMANDS.MAP.DESCRIPTION)
    .addStringOption(option =>
      option.setName("page")
        .setDescription("Choose a page in the map hud")
        .addChoices(
          { name: "default", value: COMMANDS.MAP.SUBCOMMANDS.DEFAULT.NAME },
          { name: "next", value: COMMANDS.MAP.SUBCOMMANDS.NEXT.NAME },
          { name: "previous", value: COMMANDS.MAP.SUBCOMMANDS.PREV.NAME },
        )
        .setRequired(true))


	, async execute(interaction: CommandInteraction, command: string[]) {

    // Add non-player hud in the future
		const player = game.players.get(interaction.user.id);
    if (!player) {await interaction.reply({ content: "You are not a player in the game", ephemeral: true }); return; }

    else {
      const regex = /(?<=(page:))[^\s]*/g;

      let page = command[1].match(regex)?.toString();
      if (!page) { await interaction.reply({ content: "Internal server error, please try again", ephemeral: true }); return; }

      player.hud.loadMap(interaction, page);
    }
  },
};