import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import fs from 'node:fs';
import { game } from '..';
import { generateTravelChoices } from '../commands/player';
import { COMMANDS } from '../lib/commands';
import { TOKEN } from '../lib/conts';

export const commands: Map<string, any> = new Map<string, any>();
export const commandArr: any[] = [];
const commandFiles = fs.readdirSync('./src/commands').filter((file: any) => file.endsWith('.ts'));

export function deploySlashCommands() {
	for (const file of commandFiles) {
		const ex = require(`../commands/${file}`);
		const command: SlashCommandBuilder = ex.default.data;
	
		if (file === "player.ts") {
			command.addSubcommand(sub => 
				sub.setName(COMMANDS.PLAYER.TRAVEL.NAME)
					.setDescription(COMMANDS.PLAYER.TRAVEL.DESCRIPTION)
					.addStringOption(opt =>
						opt.setName(COMMANDS.PLAYER.TRAVEL.SELECT.NAME)
						.setDescription(COMMANDS.PLAYER.TRAVEL.DESCRIPTION)
						.setChoices(...generateTravelChoices(game))
					)
			);
		}

		commands.set(command.name, ex.default);
		commandArr.push(command.toJSON());
	}
}

export const rest = new REST({ version: '9' }).setToken(TOKEN);