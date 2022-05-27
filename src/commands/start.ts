import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { COMMANDS } from '../lib/commands';
import { GameStateType } from '../lib/types';
import { game } from '..';
 
export default {
	data: new SlashCommandBuilder()
		.setName(COMMANDS.START.NAME)
		.setDescription(COMMANDS.START.DESCRIPTION)

	, async execute(interaction: CommandInteraction) {

    if (game.state !== GameStateType.READY) {await interaction.reply("Game has already started.");return;}
  
    const user = interaction.guild?.members.cache.get(interaction.user.id);
    if (!user) return;
  
    const player = game.players.get(user.id);
    if (!player) {await interaction.reply({ content: "You are not a player in the game. Use the !join command to join the game.", ephemeral: true });return;}
    if (game.playerJoinQueue.length !== 0) {await interaction.reply({ content: "Player is still joining game.", ephemeral: true });return;}

    let start = true;

    [...game.players].forEach(([id, player]) => {
      start = start && player.ready;
    });

    if (!start) {await interaction.reply({ content: "All players are not ready", ephemeral: true });return;}
  
    //! Put back in when live
    // if (players.size != 8) {
    //   message.reply(`Sorry ${Name(player)}, but there are only \`${players.size}/${MAX_PLAYERS}\` players in the game right now.`);
    //   return;
    // }

    await interaction.reply({ content: "Game start initiated." });
    game.start();
  },
};