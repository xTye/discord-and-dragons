import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { game } from '..';
import { COMMANDS } from '../lib/commands';
 
export default {

	data: new SlashCommandBuilder()
		.setName(COMMANDS.POWERUP.NAME)
		.setDescription(COMMANDS.POWERUP.DESCRIPTION)
		.addSubcommand(subcom => 
      subcom.setName(COMMANDS.POWERUP.SUBCOMMANDS.CHECK_TICK.NAME)
        .setDescription(COMMANDS.POWERUP.SUBCOMMANDS.CHECK_TICK.DESCRIPTION)
        .addIntegerOption(option => 
          option.setName("player")
            .setDescription("See the this persons tickets")
            .setRequired(true)))
    .addSubcommand(subcom => 
      subcom.setName(COMMANDS.POWERUP.SUBCOMMANDS.MUTE.NAME)
        .setDescription(COMMANDS.POWERUP.SUBCOMMANDS.MUTE.DESCRIPTION)
        .addIntegerOption(option => 
          option.setName("playerid")
            .setDescription("Use /lobby to get the list of players with playerid")
            .setChoices(
              { name: "1", value: 1 },
              { name: "2", value: 2 },
              { name: "3", value: 3 },
              { name: "4", value: 4 },
              { name: "5", value: 5 },
              { name: "6", value: 6 },
              { name: "7", value: 7 },
              { name: "8", value: 8 },
              )
            .setRequired(true)))

	, async execute(interaction: CommandInteraction) {

		const player = game.players.get(interaction.user.id);
    if (!player) await interaction.reply({ content: "You are not a player in the game", ephemeral: true });

    else {
      const subcommand = interaction.toString().split(" ");
      const regex = /(?<=(playerid:))[^\s]*/g;

      let temp = subcommand[2].match(regex)?.toString();

      const victim = game.players.get(temp ? temp : "");
      if (!victim) {
        await interaction.reply("Not a valid id, please use `/lobby` command to list the users with ids");
        return;
      }

      switch (subcommand[1]){
				case COMMANDS.POWERUP.SUBCOMMANDS.CHECK_TICK.NAME:
    			await player.popCheckTick(interaction, victim);
						break;
        case COMMANDS.POWERUP.SUBCOMMANDS.MUTE.NAME:
    			await player.popMute(interaction, victim);
						break;
      }
    }
  },
  


};