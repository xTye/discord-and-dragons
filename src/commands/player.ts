import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { COMMANDS } from '../lib/commands';
import { game } from "..";
import { Game, MAX_PLAYERS } from '../game';
import { PLAYER_ROLE_ID } from '../lib/conts';
import { SearchRound } from '../rounds/search';
import { Region } from '../locations/region';
import { VoteRound } from '../rounds/vote';

export function generateTravelChoices(game: Game) {
  let choices: { name: string, value: string }[] = [];

  game.regions.forEach((region, id) => {
    choices.push({ name: region.channel.name, value: id });
  });

  return choices;
}

export default {
	data: new SlashCommandBuilder()
		.setName(COMMANDS.PLAYER.NAME)
		.setDescription(COMMANDS.PLAYER.DESCRIPTION)
		.addSubcommand(sub =>
			sub.setName(COMMANDS.PLAYER.STATE.NAME)
			.setDescription(COMMANDS.PLAYER.STATE.DESCRIPTION)
			.addStringOption(opt =>
				opt.setName(COMMANDS.PLAYER.STATE.SELECT.NAME)
				.setDescription(COMMANDS.PLAYER.STATE.SELECT.DESCRIPTION)
				.setChoices(
					{ name: COMMANDS.PLAYER.STATE.SELECT.JOIN, value: COMMANDS.PLAYER.STATE.SELECT.JOIN },
					{ name: COMMANDS.PLAYER.STATE.SELECT.READY, value: COMMANDS.PLAYER.STATE.SELECT.READY },
					{ name: COMMANDS.PLAYER.STATE.SELECT.LEAVE, value: COMMANDS.PLAYER.STATE.SELECT.LEAVE },
					{ name: COMMANDS.PLAYER.STATE.SELECT.LOAD_DESCRIPTION, value: COMMANDS.PLAYER.STATE.SELECT.LOAD_DESCRIPTION },
					{ name: COMMANDS.PLAYER.STATE.SELECT.SET_DESCRIPTION, value: COMMANDS.PLAYER.STATE.SELECT.SET_DESCRIPTION },
					{ name: COMMANDS.PLAYER.STATE.SELECT.SYNC_MESSAGE, value: COMMANDS.PLAYER.STATE.SELECT.SYNC_MESSAGE },
					{ name: COMMANDS.PLAYER.STATE.SELECT.SYNC_VOICE, value: COMMANDS.PLAYER.STATE.SELECT.SYNC_VOICE },
				)
				.setRequired(true)
			)
		)
		.addSubcommand(sub =>
			sub.setName(COMMANDS.PLAYER.INVENTORY.NAME)
			.setDescription(COMMANDS.PLAYER.INVENTORY.DESCRIPTION)
			.addStringOption(opt =>
				opt.setName(COMMANDS.PLAYER.INVENTORY.NAME)
				.setDescription(COMMANDS.PLAYER.INVENTORY.DESCRIPTION)
			)
		)
		.addSubcommandGroup(sub => 
			sub.setName(COMMANDS.PLAYER.VOTE.NAME)
			.setDescription(COMMANDS.PLAYER.VOTE.DESCRIPTION)
			.addSubcommand(opt => 
				opt.setName(COMMANDS.PLAYER.VOTE.SELECT.NAME)
				.setDescription(COMMANDS.PLAYER.VOTE.SELECT.DESCRIPTION)
			)
			.addSubcommand(opt => 
				opt.setName(COMMANDS.PLAYER.VOTE.WITH.NAME)
				.setDescription(COMMANDS.PLAYER.VOTE.WITH.DESCRIPTION)
			)
		)
		.addSubcommand(sub => 
			sub.setName(COMMANDS.PLAYER.ACTIVITY.NAME)
			.setDescription(COMMANDS.PLAYER.ACTIVITY.DESCRIPTION)
			.addStringOption(opt => 
				opt.setName(COMMANDS.PLAYER.ACTIVITY.NAME)
				.setDescription(COMMANDS.PLAYER.ACTIVITY.DESCRIPTION)
				.setChoices(
					{ name: COMMANDS.PLAYER.ACTIVITY.SELECT.JOIN, value: COMMANDS.PLAYER.ACTIVITY.SELECT.JOIN },
					{ name: COMMANDS.PLAYER.ACTIVITY.SELECT.ROCK, value: COMMANDS.PLAYER.ACTIVITY.SELECT.ROCK },
					{ name: COMMANDS.PLAYER.ACTIVITY.SELECT.VOTE_YES, value: COMMANDS.PLAYER.ACTIVITY.SELECT.VOTE_YES },
					{ name: COMMANDS.PLAYER.ACTIVITY.SELECT.VOTE_NO, value: COMMANDS.PLAYER.ACTIVITY.SELECT.VOTE_NO },
				)
				.setRequired(true)
			)
		)

	, async execute(interaction: CommandInteraction, command: string[]) {
		const player = game.players.get(interaction.user.id);
		const select = command[2].match(/(?<=(select:))[^\s]*/g)?.toString();

		if (command[1] === COMMANDS.PLAYER.STATE.NAME) {

			if (!select) {await interaction.reply({ content: "Not a valid command.", ephemeral: true }); return;}
			if (player) {
				if (select === COMMANDS.PLAYER.STATE.SELECT.JOIN) {
					await interaction.reply({ content: "You are already a player in the game.", ephemeral: true });
					return;
				} else if (select === COMMANDS.PLAYER.STATE.SELECT.READY) {
					if (player.game.started) {await interaction.reply({ content: "Game has already started.", ephemeral: true }); return;}
					player.readyUp(interaction);
				} else if (select === COMMANDS.PLAYER.STATE.SELECT.LEAVE) {
					player.kill(interaction);
				} else if (select === COMMANDS.PLAYER.STATE.SELECT.LOAD_DESCRIPTION) {
					if (player.game.started) {await interaction.reply({ content: "Game has already started.", ephemeral: true }); return;}
					player.setDescription(command[3]);
				} else if (select === COMMANDS.PLAYER.STATE.SELECT.SET_DESCRIPTION) {
					player.hud.loadSetDescription(interaction);
				}
			} else {
				const user = interaction.guild?.members.cache.get(interaction.user.id);
					if (!user) {interaction.reply({ content: "Internal server error, please try again.", ephemeral: true }); return;}

				if (select === COMMANDS.PLAYER.STATE.SELECT.JOIN) {
					if (game.started) {await interaction.reply({ content: "Game has already started.", ephemeral: true }); return;}
					if (game.players.size >= MAX_PLAYERS) {await interaction.reply({ content: "The game is currently full.", ephemeral: true }); return;}

					await game.joinGame(interaction, user);
				}
	
				if (select === COMMANDS.PLAYER.STATE.SELECT.LEAVE) {
					await user.roles.remove(PLAYER_ROLE_ID);
					await interaction.reply({ content: "Your role has been removed.", ephemeral: true });
				}
			}
		}





		else if (command[1] === COMMANDS.PLAYER.INVENTORY.NAME) {
			if (!player) {await interaction.reply({ content: "You are not a player in the game.", ephemeral: true }); return;}
	
			else {
				if (!select) {
					const item = player.inventory.getSelect;
					if (!item) {await interaction.reply({ content: "Please select a valid item", ephemeral: true }); return;}
					player.inventory.consumeItem(interaction, item);
				} else {
					const item = player.inventory.getItem(select);
					await interaction.reply({ content: "Setting item..." });
					player.inventory.setItem(item);
					await interaction.deleteReply();
				}
			}
		}





		else if (command[1] === COMMANDS.PLAYER.TRAVEL.NAME) {
			if (!player) {await interaction.reply({ content: "You are not a player in the game.", ephemeral: true }); return;}
			
			else {
				if (!(game.round instanceof SearchRound)) {await interaction.reply({ content: "Game not in search phase.", ephemeral: true }); return;}
				if (player.travel.traveling) {await interaction.reply({ content: "You cannot travel while currently traveling.", ephemeral: true }); return;}
				if (player.activity) {await interaction.reply({ content: "You cannot travel while in an activity.", ephemeral: true }); return;}
	
				if (!select) {
					const dest = player.travel.destination;
					if (!dest) {await interaction.reply({ content: "Please select a valid destination.", ephemeral: true }); return;}
					player.beginTravel(interaction, dest);
				} else {
					if (!(player.location instanceof Region)) {await interaction.reply({ content: "You must be at a region to select a destination.", ephemeral: true }); return;}
					const destination = player.location.regions.get(select);
					await interaction.reply({ content: "Setting destination..." });
					player.setDestination(destination);
					await interaction.deleteReply();
				}
			}
		}




		else if (command[1] === COMMANDS.PLAYER.VOTE.NAME) {
			if (!player) {await interaction.reply({ content: "You are not a player in the game.", ephemeral: true }); return;}
				
			else {
				if (command[2] === COMMANDS.PLAYER.VOTE.SELECT.NAME) {
					const votePlayer = player.game.players.get(command[3]);
					player.setVotePlayer(votePlayer);
				} else if (command[2] === COMMANDS.PLAYER.VOTE.WITH.DESCRIPTION) {
					if (!(game.round instanceof VoteRound)) {await interaction.reply({ content: "Game not in vote phase.", ephemeral: true }); return;}
				
					const tickets = +command[3];
					if (!tickets) {await interaction.reply({ content: "You must vote with a valid form of tickets.", ephemeral: true }); return;}
					player.setVoteTickets(tickets);

					await game.round.vote(interaction, player);
				}
			}
		}





		else if (command[1] === COMMANDS.PLAYER.ACTIVITY.NAME) {
			if (!player) {await interaction.reply({ content: "You are not a player in the game.", ephemeral: true }); return;}
			
			else {
				if (!(player.game.round instanceof SearchRound)) {await interaction.reply({ content: "Game not in search phase", ephemeral: true}); return;}
				if (!select) {await interaction.reply({ content: "Not a valid command.", ephemeral: true }); return;}

				if (select === COMMANDS.PLAYER.ACTIVITY.SELECT.JOIN 
					|| select === COMMANDS.PLAYER.ACTIVITY.SELECT.ROCK) {
					if (!player.location.activity) {await interaction.reply({ content: "No valid activity at this location.", ephemeral: true }); return;}
					player.location.activity.update(interaction, player, select);
				} else if (select === COMMANDS.PLAYER.ACTIVITY.SELECT.VOTE_YES
					|| select === COMMANDS.PLAYER.ACTIVITY.SELECT.VOTE_NO) {
					if (!player.activity) {await interaction.reply({ content: "Not currently apart of an activity.", ephemeral: true }); return;}
					player.activity.activity.vote(interaction, player.activity.x, select);
				}
			}
		}
  },
};