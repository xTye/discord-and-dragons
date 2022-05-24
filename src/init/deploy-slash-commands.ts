import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import fs from 'node:fs';
import { generateTravelChoices } from '../commands/travel';
import { TOKEN } from '../lib/conts';

export const commands: Map<string, any> = new Map<string, any>();
export const commandArr: any[] = [];
const commandFiles = fs.readdirSync('./src/commands').filter((file: any) => file.endsWith('.ts'));

export function deploySlashCommands() {
	for (const file of commandFiles) {
		const ex = require(`../commands/${file}`);
		const command: SlashCommandBuilder = ex.default.data;
	
		if (file === "travel.ts")
			command.addSubcommand(subcom => 
				subcom.setName("to")
				.setDescription("Travel to a location")
				.addStringOption(option => 
					option.setName("location")
						.setDescription("location")
							.setChoices(...generateTravelChoices())
							.setRequired(true)
			));

		commands.set(command.name, ex.default);
		commandArr.push(command.toJSON());
	}
}

export const rest = new REST({ version: '9' }).setToken(TOKEN);