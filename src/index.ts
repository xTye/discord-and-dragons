import { Routes } from 'discord-api-types/v9';
import { Client } from 'discord.js';
import { CLIENT_ID, GUILD_ID, TOKEN } from './lib/conts';
import { commandArr, commands, rest } from './init/deploy-slash-commands';
import { init } from './init/init';

export const client = new Client({ intents: ["Guilds", "GuildVoiceStates"] });

client.once("ready", async () => {
	try {
		init();
		console.log('Started refreshing application (/) commands.');

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

	let commandName = "";

	if (interaction.isCommand()) commandName = interaction.commandName;
	else if (interaction.isButton()) commandName = interaction.customId.split(' ')[0];
	else return;

	const command = commands.get(commandName);
	if (!command) return;
	
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(TOKEN);