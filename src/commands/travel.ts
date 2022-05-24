import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { game } from '..';
import { COMMANDS } from '../lib/commands';
import { GameStateType } from '../lib/types';
 
export function generateTravelChoices() {
  let choices: { name: string, value: string }[] = [];

  [...game.regions].forEach(([id, region]) => {
    choices.push({ name: region.channel.name, value: id });
  });

  return choices;
}

export default {
  
  //HEAD MAKE A COMMAND BUILDER FOR THESE SUBCOMMANDS FOR DYNAMIC CREATED MAPS 

	data: new SlashCommandBuilder()
		.setName(COMMANDS.TRAVEL.NAME)
		.setDescription(COMMANDS.TRAVEL.DESCRIPTION)
    .addSubcommand(option => 
      option.setName(COMMANDS.TRAVEL.SUBCOMMANDS.TIME.NAME)
        .setDescription(COMMANDS.TRAVEL.SUBCOMMANDS.TIME.DESCRIPTION))    

  , 
  /**
   * Executes on travel command, checks if a player can travel
   * and begins travel if eligable.
   * 
   * @param interaction used for reply
   */
  async execute(interaction: CommandInteraction) {

    if (game.state != GameStateType.SEARCH){
      await interaction.reply("Game not in search phase");
      return;
    }

    const player = game.players.get(interaction.user.id);
    if (!player) await interaction.reply({ content: "You are not a player in the game", ephemeral: true });

    else {
      const subcommand = interaction.toString().split(" ");
      switch (subcommand[1]){
        //HEAD FIX "TO" AFTER BASIC IMPLIMENTATION IS DONE
        case "to":
          if (player.travel.traveling) {
            await interaction.reply("You cannot travel while currently traveling");
            return;
          }
          if (player.activity.active) {
            await interaction.reply("You cannot travel while in an activity");
            return;
          }
          const regex = /(?<=(location:))[^\s]*/g;
          const destSnow = interaction.toString().match(regex)?.toString();
          if (!destSnow) { await interaction.reply({ content: "Internal game error! ERROR CODE 1" }); return; }
          const destination = game.regions.get(destSnow);
          if (!destination) { await interaction.reply({ content: "Internal game error! ERROR CODE 2" }); return; }
          await player.beginTravel(destination, interaction);
            break;
        case COMMANDS.TRAVEL.SUBCOMMANDS.TIME.NAME:  
          await player.travelTime(interaction);
            break;
      }
    }
  },
};