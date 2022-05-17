import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { COMMANDS } from '../lib/commands';
import { game } from '../game';
import { GameStateType } from '../lib/types';
import { ListVotes } from '../vote';
 
export default {
  
	data: new SlashCommandBuilder()
		.setName(COMMANDS.VOTE.NAME)
		.setDescription(COMMANDS.VOTE.DESCRIPTION)

    .addSubcommand(subcom => 
      subcom.setName(COMMANDS.VOTE.SUBCOMMANDS.LIST.NAME)
        .setDescription(COMMANDS.VOTE.SUBCOMMANDS.LIST.DESCRIPTION))
    .addSubcommand(subcom => 
      subcom.setName(COMMANDS.VOTE.SUBCOMMANDS.PLAYER.NAME)
        .setDescription(COMMANDS.VOTE.SUBCOMMANDS.PLAYER.DESCRIPTION)
        .addUserOption(option => 
          option.setName("player")
            .setDescription("Vote a player")
            .setRequired(true))
          .addIntegerOption(option2 => 
            option2.setName("tickets")
              .setDescription("Why not just use all of your tickets? 💸")
              .setMaxValue(10)
              .setMinValue(1)
              .setRequired(true)))
    .addSubcommand(subcom => 
      subcom.setName(COMMANDS.VOTE.SUBCOMMANDS.TICKETS.NAME)
        .setDescription(COMMANDS.VOTE.SUBCOMMANDS.TICKETS.DESCRIPTION))
  , 
  /**
   * Executes on travel command, checks if a player can travel
   * and begins travel if eligable.
   * 
   * @param interaction used for reply
   */
  async execute(interaction: CommandInteraction) {

    const player = game.players.get(interaction.user.id);
    if (!player) await interaction.reply({ content: "You are not a player in the game", ephemeral: true });
    else {

      const subcommand = interaction.toString().split(" ");

      if (subcommand[1] === COMMANDS.VOTE.SUBCOMMANDS.TICKETS.NAME) {
        await player.tickets(interaction);
        return;
      }

      if (game.state !== GameStateType.VOTE) {
        await interaction.reply("Game not in vote phase.");
        return;
      }
  
      
      if (subcommand[1] === COMMANDS.VOTE.SUBCOMMANDS.LIST.NAME) {
        await ListVotes(interaction);
        return;
      }

      switch (subcommand[1]) {
        case COMMANDS.VOTE.SUBCOMMANDS.PLAYER.NAME:
  
          const playerIdRegex = /(?<=(player:))[^\s]*/g;
          const ticketsRegex = /(?<=(tickets:))[^\s]*/g;

          let temp = subcommand[2].match(playerIdRegex);
          const playerId = temp ? +temp : 0;
          
          console.log(playerId);
        
          temp = subcommand[3].match(ticketsRegex);
          if (!temp) {
            await interaction.reply("Not a valid form for JSON acceptance.");
            return;
          }
          const numVotes = temp ? +temp : 1;

          if (numVotes > player.vote.tickets - player.vote.spentTickets) {
            await interaction.reply("You cannot vote with more tickets than you have");
            return;
          }
        

          //await player.execVote(interaction, votee, numVotes);
            break;
      }
    }
  },
};