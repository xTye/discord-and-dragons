import { Routes } from 'discord-api-types/v9';
import { Client, SlashCommandSubcommandBuilder } from 'discord.js';
import { CLIENT_ID, GUILD_ID, INCREMENT_MILLIS, TOKEN } from './lib/conts';
import { commandArr, commands, deploySlashCommands, rest } from './init/deploy-slash-commands';
import { init } from './init/init';
import { Game } from './game';

export const client = new Client({ intents: ["Guilds", "GuildVoiceStates"] });
export const game = new Game();

client.once("ready", async () => {
	try {
		init();
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
	
	if (interaction.isSelectMenu()) {console.log(interaction.customId);}

	if (interaction.isCommand()) commandName = interaction.toString().split(' ');
	else if (interaction.isButton()) {
		commandName = interaction.customId.split(' ');

		const id = commandName[commandName.length - 1];
		if (id != interaction.user.id) {interaction.reply({ content: "These are not the buttons you are looking for.", ephemeral: true }); return;}
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