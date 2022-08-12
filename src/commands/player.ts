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
					{ name: COMMANDS.PLAYER.STATE.SELECT.CANCEL_ALERT, value: COMMANDS.PLAYER.STATE.SELECT.CANCEL_ALERT },
				)
				.setRequired(true)
			)
		)
		.addSubcommand(sub =>
			sub.setName(COMMANDS.PLAYER.INVENTORY.NAME)
			.setDescription(COMMANDS.PLAYER.INVENTORY.DESCRIPTION)
			.addStringOption(opt =>
				opt.setName(COMMANDS.PLAYER.INVENTORY.SELECT.NAME)
				.setDescription(COMMANDS.PLAYER.INVENTORY.SELECT.DESCRIPTION)
				.setChoices(
					{ name: COMMANDS.PLAYER.INVENTORY.SELECT.LOAD, value: COMMANDS.PLAYER.INVENTORY.SELECT.LOAD },
					{ name: COMMANDS.PLAYER.INVENTORY.SELECT.CONSUME, value: COMMANDS.PLAYER.INVENTORY.SELECT.CONSUME },
				)
			)
		)
		.addSubcommand(sub => 
			sub.setName(COMMANDS.PLAYER.VOTE.NAME)
			.setDescription(COMMANDS.PLAYER.VOTE.DESCRIPTION)
			.addStringOption(opt =>
				opt.setName(COMMANDS.PLAYER.VOTE.SELECT.NAME)
				.setDescription(COMMANDS.PLAYER.VOTE.SELECT.DESCRIPTION)
				.setChoices(
					{ name: COMMANDS.PLAYER.VOTE.SELECT.PLAYER, value: COMMANDS.PLAYER.VOTE.SELECT.PLAYER },
					{ name: COMMANDS.PLAYER.VOTE.SELECT.TICKETS, value: COMMANDS.PLAYER.VOTE.SELECT.TICKETS },
				)
				.setRequired(true)
			)
		)
		.addSubcommand(sub => 
			sub.setName(COMMANDS.PLAYER.ACTIVITY.NAME)
			.setDescription(COMMANDS.PLAYER.ACTIVITY.DESCRIPTION)
			.addStringOption(opt => 
				opt.setName(COMMANDS.PLAYER.ACTIVITY.SELECT.NAME)
				.setDescription(COMMANDS.PLAYER.ACTIVITY.SELECT.DESCRIPTION)
				.setChoices(
					{ name: COMMANDS.PLAYER.ACTIVITY.SELECT.JOIN, value: COMMANDS.PLAYER.ACTIVITY.SELECT.JOIN },
					{ name: COMMANDS.PLAYER.ACTIVITY.SELECT.ROCK, value: COMMANDS.PLAYER.ACTIVITY.SELECT.ROCK },
					{ name: COMMANDS.PLAYER.ACTIVITY.SELECT.LEAVE, value: COMMANDS.PLAYER.ACTIVITY.SELECT.LEAVE },
					{ name: COMMANDS.PLAYER.ACTIVITY.SELECT.VOTE, value: COMMANDS.PLAYER.ACTIVITY.SELECT.VOTE },
					{ name: COMMANDS.PLAYER.ACTIVITY.SELECT.VOTE_LOAD, value: COMMANDS.PLAYER.ACTIVITY.SELECT.VOTE_LOAD },
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
					await interaction.reply({ content: "Get ready..." });
					await player.readyUp();
					await interaction.deleteReply();
				} else if (select === COMMANDS.PLAYER.STATE.SELECT.LEAVE) {
					await interaction.reply({ content: "Leaving game..." });
					await player.kill();
					await interaction.deleteReply();
				} else if (select === COMMANDS.PLAYER.STATE.SELECT.LOAD_DESCRIPTION) {
					if (player.game.started) {await interaction.reply({ content: "Game has already started.", ephemeral: true }); return;}
					await player.hud.loadModalDescription(interaction);
				} else if (select === COMMANDS.PLAYER.STATE.SELECT.SET_DESCRIPTION) {
					await interaction.reply({ content: "Setting description..." });
					await player.setDescription(command[3]);
					await interaction.deleteReply();
				} else if (select === COMMANDS.PLAYER.STATE.SELECT.SYNC_MESSAGE) {
					await player.syncMessage(interaction);
				} else if (select === COMMANDS.PLAYER.STATE.SELECT.SYNC_VOICE) {
					await interaction.reply({ content: "Syncing voice..." });
					await player.syncVoice();
					await interaction.deleteReply();
				} else if (select === COMMANDS.PLAYER.STATE.SELECT.CANCEL_ALERT) {
					await interaction.reply({ content: "Loading..." });
					await player.hud.loadCancelAlert();
					await interaction.deleteReply();
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
					await player.inventory.consumeItem(item);
				} else {
					if (select === COMMANDS.PLAYER.INVENTORY.SELECT.LOAD) {
						await interaction.reply({ content: "Loading inventory..." });
						await player.hud.loadItemSelect(player);
						await interaction.deleteReply();
					} else if (select === COMMANDS.PLAYER.INVENTORY.SELECT.CONSUME) {
						if (!player.inventory.getSelect) {await interaction.reply({ content: "You must select an item.", ephemeral: true }); return;}
						if (player.inventory.getSelect.targetable && !player.inventory.getSelect.getTarget) {await interaction.reply({ content: "You must select an target for this item.", ephemeral: true }); return;}
						await interaction.reply({ content: "Consuming Item..." });
						await player.inventory.consumeItem(player.inventory.getSelect);
						await interaction.deleteReply();
					} else if (select === COMMANDS.PLAYER.INVENTORY.SELECT.DESELECT) {
						await interaction.reply({ content: "Setting Item..." });
						await player.inventory.setItem();
						await interaction.deleteReply();
					} else {
						const item = player.inventory.getItem(select);
						if (item) {
							await interaction.reply({ content: "Setting item..." });
							await player.inventory.setItem(item);
							await interaction.deleteReply();
						} else {
							const target = player.game.players.get(select);
							if (target) {
								if (!player.inventory.getSelect) {await interaction.reply({ content: "You must select an item before its target.", ephemeral: true }); return;}
								if (!player.inventory.getSelect.targetable) {await interaction.reply({ content: "This item is not targetable.", ephemeral: true }); return;}
								await interaction.reply({ content: "Setting target..." });
								await player.inventory.getSelect.setTarget(target);
								await interaction.deleteReply();
							} else {
								await interaction.reply({ content: "Not a valid command.", ephemeral: true });
								return;
							}
						}
					}
				}
			}
		}





		else if (command[1] === COMMANDS.PLAYER.TRAVEL.NAME) {
			if (!player) {await interaction.reply({ content: "You are not a player in the game.", ephemeral: true }); return;}
			
			else {
				if (!(game.round instanceof SearchRound)) {await interaction.reply({ content: "Game not in search phase.", ephemeral: true }); return;}
				if (player.travel.traveling) {await interaction.reply({ content: "You cannot travel while currently traveling.", ephemeral: true }); return;}
				if (player.active) {await interaction.reply({ content: "You cannot travel while in an activity.", ephemeral: true }); return;}
	
				if (!select) {
					const dest = player.travel.destination;
					if (!dest) {await interaction.reply({ content: "Please select a valid destination.", ephemeral: true }); return;}
					await player.beginTravel(interaction, dest);
				} else {
					if (!(player.location instanceof Region)) {await interaction.reply({ content: "You must be at a region to select a destination.", ephemeral: true }); return;}
					const destination = player.location.regions.get(select);
					await interaction.reply({ content: "Setting destination..." });
					await player.setDestination(destination);
					await interaction.deleteReply();
				}
			}
		}




		else if (command[1] === COMMANDS.PLAYER.VOTE.NAME) {
			if (!player) {await interaction.reply({ content: "You are not a player in the game.", ephemeral: true }); return;}
				
			else {
				if (select === COMMANDS.PLAYER.VOTE.SELECT.TICKETS) {
					if (!(game.round instanceof VoteRound)) {await interaction.reply({ content: "Game not in vote phase.", ephemeral: true }); return;}
				
					const tickets = +command[3];
					if (!tickets) {await interaction.reply({ content: "You must vote with a valid form of tickets.", ephemeral: true }); return;}
					
					player.setVoteTickets(tickets);

					await game.round.vote(interaction, player);
				} else if (select) {
					const votePlayer = player.game.players.get(select);
					if (!votePlayer) {await interaction.reply({ content: "Not a valid player in the game.", ephemeral: true }); return;}
					await player.setVotePlayer(interaction, votePlayer);
				} else {await interaction.reply({ content: "The world is on fire, honey take the children. Please try again.", ephemeral: true }); return;}
			}
		}





		else if (command[1] === COMMANDS.PLAYER.ACTIVITY.NAME) {
			if (!player) {await interaction.reply({ content: "You are not a player in the game.", ephemeral: true }); return;}
			
			else {
				if (!(player.game.round instanceof SearchRound)) {await interaction.reply({ content: "Game not in search phase", ephemeral: true}); return;}
				if (select === COMMANDS.PLAYER.ACTIVITY.SELECT.JOIN 
					|| select === COMMANDS.PLAYER.ACTIVITY.SELECT.ROCK
					|| select === COMMANDS.PLAYER.ACTIVITY.SELECT.LEAVE) {
					if (!player.location.activity) {await interaction.reply({ content: "No valid activity at this location.", ephemeral: true }); return;}	
					if (player.game.round.timer.getMillis <= player.location.activity.safeTime) {await interaction.reply({ content: "Not enough time to commence the game.", ephemeral: true }); return;}
					//if (player.active?.activity.timer) {await interaction.reply({ content: "Game already commenced this round, please wait another round to play.", ephemeral: true }); return;}	
					await player.location.activity.update(interaction, player, select);
				} else if (select === COMMANDS.PLAYER.ACTIVITY.SELECT.VOTE) {
					if (!player.active) {await interaction.reply({ content: "Not currently apart of an activity.", ephemeral: true }); return;}
					await player.active.activity.vote(interaction, player, command[3]);
				} else if (select === COMMANDS.PLAYER.ACTIVITY.SELECT.VOTE_LOAD) {
					if (!player.location.activity) {await interaction.reply({ content: "No valid activity at this location.", ephemeral: true }); return;}
					await player.hud.loadActivityModal(player, player.location.activity, interaction);
				} else {
					if (!player.location.activity) {await interaction.reply({ content: "No valid activity at this location.", ephemeral: true }); return;}
					await interaction.reply({ content: "Loading Activity UI..." })
					await player.hud.loadActivityUI(player, player.location.activity);
					await interaction.deleteReply();
				}
			}
		}
  },
};