import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import fs from 'node:fs';
import { TOKEN } from '../lib/conts';

export const commands: Map<string, any> = new Map<string, any>();
export const commandArr: any[] = [];
const commandFiles = fs.readdirSync('./src/commands').filter((file: any) => file.endsWith('.ts'));

for (const file of commandFiles) {
	const ex = require(`../commands/${file}`);
	const command: SlashCommandBuilder = ex.default.data;
	commands.set(command.name, ex.default);
	commandArr.push(command.toJSON());
}

export const rest = new REST({ version: '9' }).setToken(TOKEN);