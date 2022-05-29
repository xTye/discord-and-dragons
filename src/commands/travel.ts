import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { game } from '..';
import { COMMANDS } from '../lib/commands';
import { GameStateType } from '../lib/types';
import { Region } from '../locations/region';
 
export function generateTravelChoices() {
  let choices: { name: string, value: string }[] = [];

  [...game.regions].forEach(([id, region]) => {
    choices.push({ name: region.channel.name, value: id });
  });

  return choices;
}

export default {
	data: new SlashCommandBuilder()
		.setName(COMMANDS.TRAVEL.NAME)
		.setDescription(COMMANDS.TRAVEL.DESCRIPTION)
  , 
  /**
   * Executes on travel command, checks if a player can travel
   * and begins travel if eligable.
   * 
   * @param interaction used for reply
   */
  async execute(interaction: CommandInteraction, commands: string[]) {

    const player = game.players.get(interaction.user.id);
    if (!player) {await interaction.reply({ content: "You are not a player in the game.", ephemeral: true }); return;}

    else {
      if (game.state != GameStateType.SEARCH) {await interaction.reply({ content: "Game not in search phase.", ephemeral: true }); return;}
      if (player.travel.traveling) {await interaction.reply({ content: "You cannot travel while currently traveling.", ephemeral: true }); return;}
      if (player.activity) {await interaction.reply({ content: "You cannot travel while in an activity.", ephemeral: true }); return;}

      const regex = /(?<=(select:))[^\s]*/g;
      const selection = commands[1].match(regex)?.toString();
      if (!selection) {
        await player.beginTravel(interaction);
      } else {
        if (!(player.location instanceof Region)) {await interaction.reply({ content: "You must be at a region to select a destination.", ephemeral: true }); return;}
        const destination = player.location.regions.get(selection);
        await interaction.reply({ content: "Setting destination..." });
        player.setDestination(destination);
        await interaction.deleteReply();
      }
    }
  },
};