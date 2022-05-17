import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { JOIN } from '../activities/sike-dilemma';
import { COMMANDS } from '../lib/commands';
import { game } from '../game';
import { GameStateType } from '../lib/types';
 
export default {

	data: new SlashCommandBuilder()
		.setName(COMMANDS.REGION.NAME)
		.setDescription(COMMANDS.REGION.DESCRIPTION)
		.addSubcommand(sub => 
			sub.setName(COMMANDS.REGION.SUBCOMMANDS.ROOM.NAME)
				.setDescription(COMMANDS.REGION.SUBCOMMANDS.ROOM.DESCRIPTION))
		.addSubcommand(sub => 
			sub.setName(COMMANDS.REGION.SUBCOMMANDS.PLAY.NAME)
				.setDescription(COMMANDS.REGION.SUBCOMMANDS.PLAY.DESCRIPTION)
				.addIntegerOption(option =>
					option.setName("as")
						.setDescription("Play as a helper or helpee")
						.setRequired(true)
						.addChoices(
							{ name: "Helpee", value: JOIN.HELPEE },
							{ name: "Helper", value: JOIN.HELPER },
					)))
		.addSubcommand(sub => 
			sub.setName(COMMANDS.REGION.SUBCOMMANDS.VOTE.NAME)
				.setDescription(COMMANDS.REGION.SUBCOMMANDS.VOTE.DESCRIPTION)
				.addBooleanOption(option => 
					option.setName("vote")
						.setDescription("To vote or not to vote")
						.setRequired(true)))
		.addSubcommand(sub => 
			sub.setName(COMMANDS.REGION.SUBCOMMANDS.FISH.NAME)
				.setDescription(COMMANDS.REGION.SUBCOMMANDS.FISH.DESCRIPTION))
		.addSubcommand(sub => 
			sub.setName(COMMANDS.REGION.SUBCOMMANDS.ROCK.NAME)
				.setDescription(COMMANDS.REGION.SUBCOMMANDS.ROCK.DESCRIPTION))
		.addSubcommand(sub => 
			sub.setName(COMMANDS.REGION.SUBCOMMANDS.PLAYERS.NAME)
				.setDescription(COMMANDS.REGION.SUBCOMMANDS.PLAYERS.DESCRIPTION))

	, async execute(interaction: CommandInteraction) {

		if (game.state != GameStateType.SEARCH){
      await interaction.reply("Game not in search phase");
      return;
    }

		const player = game.players.get(interaction.user.id);
    if (!player) await interaction.reply({ content: "You are not a player in the game", ephemeral: true });

    else {
      const subcommand = interaction.toString().split(" ");
			if (subcommand[1] === COMMANDS.REGION.SUBCOMMANDS.ROOM.NAME) { await player.findRoom(interaction); return;}

			if (player.travel.traveling) { await interaction.reply("There are no activities you can do while in route (to be added...)"); return; }

      switch (subcommand[1]){
				case COMMANDS.REGION.SUBCOMMANDS.PLAY.NAME:
					const regexPlay = /(?<=(as:))[^\s]*/g;
          const as = interaction.toString().match(regexPlay)?.toString();
					if (!as) { await interaction.reply({ content: "Internal game error! ERROR CODE 3" }); return;}
					await player.activityPlay(interaction, +as);
						break;
        case COMMANDS.REGION.SUBCOMMANDS.VOTE.NAME:
					const regexVote = /(?<=(vote:))[^\s]*/g;
          const vote = interaction.toString().match(regexVote)?.toString();
          if (!vote) { await interaction.reply({ content: "Internal game error! ERROR CODE 4" }); return;}
					if (vote === "true")
          	await player.activityVote(interaction, true);
					else
						await player.activityVote(interaction, false);
            break;
				case COMMANDS.REGION.SUBCOMMANDS.FISH.NAME:
					await player.activityFish(interaction);
						break;
				case COMMANDS.REGION.SUBCOMMANDS.ROCK.NAME:
					await player.activityRock(interaction);
						break;
				case COMMANDS.REGION.SUBCOMMANDS.PLAYERS.NAME:
					await player.regionPlayersMessage(interaction);
						break;
      }
    }
  },
  


};