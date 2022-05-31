import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { game } from '..';
import { GameStateType } from '../game';
import { COMMANDS } from '../lib/commands';
 
export default {

	data: new SlashCommandBuilder()
		.setName(COMMANDS.ACTIVITY.NAME)
		.setDescription(COMMANDS.ACTIVITY.DESCRIPTION)
		.addStringOption(sub => 
			sub.setName(COMMANDS.ACTIVITY.SUBCOMMANDS.DO.NAME)
				.setDescription(COMMANDS.ACTIVITY.SUBCOMMANDS.DO.DESCRIPTION)
				.addChoices(
					{ name: "Join", value: COMMANDS.ACTIVITY.SUBCOMMANDS.DO.JOIN },
					{ name: "Rock", value: COMMANDS.ACTIVITY.SUBCOMMANDS.DO.ROCK },
				))

	, async execute(interaction: CommandInteraction) {

		const player = game.players.get(interaction.user.id);
    if (!player) {await interaction.reply({ content: "You are not a player in the game.", ephemeral: true }); return;}

    else {
			if (game.state != GameStateType.SEARCH) {await interaction.reply({ content: "Game not in search phase", ephemeral: true}); return;}

      const subcommand = interaction.toString().split(" ");
			if (player.travel.traveling) {await interaction.reply("There are no activities you can do while in route (to be added...)"); return;}

			//! Create an entirely new UI for the activity.
      switch (subcommand[1]){

      }
    }
  },
  


};