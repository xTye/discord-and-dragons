import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { COMMANDS } from '../lib/commands';
import { game } from "..";
import { GameStateType, MAX_PLAYERS } from '../game';
import { PLAYER_ROLE_ID } from '../lib/conts';
 
export default {
	data: new SlashCommandBuilder()
		.setName(COMMANDS.PLAYER.NAME)
		.setDescription(COMMANDS.PLAYER.DESCRIPTION)
		.addSubcommand(sub => 
			sub.setName(COMMANDS.PLAYER.SUBCOMMANDS.SYNC.NAME)
				.setDescription(COMMANDS.PLAYER.SUBCOMMANDS.SYNC.DESCRIPTION)
				.addStringOption(opt => 
					opt.setName(COMMANDS.PLAYER.SUBCOMMANDS.SYNC.SUBCOMMANDS.NAME)
						.setDescription(COMMANDS.PLAYER.SUBCOMMANDS.SYNC.SUBCOMMANDS.DESCRIPTION)
						.setChoices(
							{ name: "yes", value: COMMANDS.PLAYER.SUBCOMMANDS.SYNC.SUBCOMMANDS.YES },
							{ name: "no", value: COMMANDS.PLAYER.SUBCOMMANDS.SYNC.SUBCOMMANDS.NO },
						)
						.setRequired(true)))
		.addSubcommand(sub => 
			sub.setName(COMMANDS.PLAYER.SUBCOMMANDS.JOIN.NAME)
				.setDescription(COMMANDS.PLAYER.SUBCOMMANDS.JOIN.DESCRIPTION))
		.addSubcommand(sub => 
			sub.setName(COMMANDS.PLAYER.SUBCOMMANDS.READY.NAME)
				.setDescription(COMMANDS.PLAYER.SUBCOMMANDS.READY.DESCRIPTION))
		.addSubcommand(sub => 
			sub.setName(COMMANDS.PLAYER.SUBCOMMANDS.LEAVE.NAME)
				.setDescription(COMMANDS.PLAYER.SUBCOMMANDS.LEAVE.DESCRIPTION))

	, async execute(interaction: CommandInteraction, command: string[]) {

		const user = interaction.guild?.members.cache.get(interaction.user.id);
		if (!user) return;
		const player = game.players.get(user.id);

		if (player) {
			switch (command[1]) {
				case COMMANDS.PLAYER.SUBCOMMANDS.READY.NAME:
					if (game.state != GameStateType.READY) { await interaction.reply({ content: "The game has already started.", ephemeral: true }); return; }

					await player.readyUp(interaction);
					player.game.players.forEach((otherPlayer, id) => {
						if (player != otherPlayer)
							otherPlayer.hud.playerReadyChangeEvent();
					});
					break;
				case COMMANDS.PLAYER.SUBCOMMANDS.LEAVE.NAME:
					await player.kill();
					await interaction.reply({ content: "You have left the game.", ephemeral: true });
					break;
				case COMMANDS.PLAYER.SUBCOMMANDS.SYNC.NAME:
					const regex = /(?<=(voice:))[^\s]*/g;
					let voice = command[2].match(regex)?.toString();
					await player.sync(interaction, voice === "yes", true);
					break;
				default:
					await interaction.reply({ content: "You are already a player in the game.", ephemeral: true });
					return;
			}
		} else {
			if (command[1] === COMMANDS.PLAYER.SUBCOMMANDS.JOIN.NAME) {
				if (game.state !== GameStateType.READY) { await interaction.reply({ content: "Game has already started.", ephemeral: true }); return; }
				if (game.players.size >= MAX_PLAYERS) { await interaction.reply({ content: "The game is currently full.", ephemeral: true }); return; }
		
				game.joinGame(interaction, user);
			}

			if (command[1] === COMMANDS.PLAYER.SUBCOMMANDS.LEAVE.NAME) {
				await user.roles.remove(PLAYER_ROLE_ID);
				await interaction.reply({ content: "Your role has been removed.", ephemeral: true });
			}

		}
  },
};