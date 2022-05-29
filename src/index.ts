import { Routes } from 'discord-api-types/v9';
import { Client, } from 'discord.js';
import { CLIENT_ID, GUILD_ID, TOKEN } from './lib/conts';
import { commandArr, commands, deploySlashCommands, rest } from './init/deploy-slash-commands';
import { init } from './init/init';
import { Game } from './game';
import { COMMANDS } from './lib/commands';

export const client = new Client({ intents: ["Guilds", "GuildVoiceStates", "GuildEmojisAndStickers"] });
export const game = new Game();

client.once("ready", async () => {
	try {
		await init();
		console.log('Started refreshing application (/) commands.');

		deploySlashCommands();
		await rest.put(
			Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
			{ body: commandArr },
		);

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
	console.log("Ready!");
});

client.on("interactionCreate", async (interaction) => {

	let commandName: string[] = [];
	
	if (interaction.isSelectMenu()) {
		commandName = interaction.customId.split(' ');

		const id = commandName[commandName.length - 1];
		if (id != interaction.user.id) {interaction.reply({ content: "These are not the select options you are looking for.", ephemeral: true }); return;}

		commandName[commandName.length - 2] += interaction.values[0];
	}
	else if (interaction.isCommand()) {
		commandName = interaction.toString().split(' ');
	}
	else if (interaction.isButton()) {
		commandName = interaction.customId.split(' ');

		const id = commandName[commandName.length - 1];

		if (commandName[1] === COMMANDS.PLAYER.SUBCOMMANDS.LEAVE.NAME || 
			commandName[1] === COMMANDS.PLAYER.SUBCOMMANDS.JOIN.NAME ||
			commandName[1] === COMMANDS.PLAYER.SUBCOMMANDS.SYNC.NAME) {}
		else if (id != interaction.user.id) {interaction.reply({ content: "These are not the buttons you are looking for.", ephemeral: true }); return;}
	} 
	else return;

	commandName[0] = commandName[0].slice(1);

	const command = commands.get(commandName[0]);
	if (!command) return;

	try {
		await command.execute(interaction, commandName);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(TOKEN);