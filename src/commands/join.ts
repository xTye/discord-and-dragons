import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { COMMANDS } from '../lib/commands';
import { MAX_PLAYERS } from '../lib/conts';
import { game } from '../game';
import { JoinGame } from '../player';
import { GameStateType } from '../lib/types';
 
export default {
	data: new SlashCommandBuilder()
		.setName(COMMANDS.JOIN.NAME)
		.setDescription(COMMANDS.JOIN.DESCRIPTION)

	, async execute(interaction: CommandInteraction) {
		const user = interaction.guild?.members.cache.get(interaction.user.id);
		if (!user) return;

		if (game.state !== GameStateType.READY){
			await interaction.reply("Game has already started.");
			return;
		}
	
		if (game.players.size >= MAX_PLAYERS) {
			await interaction.reply("The game is currently full.");
			return;
		}
	
		const isPlayer = game.players.get(user.id);
		if (isPlayer){
			await interaction.reply("You are already a player in the game.");
			return;
		}

    JoinGame(interaction, user);
  },
};