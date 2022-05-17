import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { COMMANDS } from '../lib/commands';
 
export default {
	data: new SlashCommandBuilder()
		// .setName('help')
		// .setDescription(COMMANDS.HELP.DESCRIPTION)
		// .addStringOption(option => 
		// 	option.setName("ingame")
		// 		.setDescription("List all ingame commands")
		// 		.addChoices(
    //       { name: "travel", value: "travel" },
    //       { name: "vote", value: "vote" },
    //       { name: "pop", value: "pop" },
    //       { name: "location", value: "location" }))
    .setName(COMMANDS.HELP.COMMAND.slice(1))
		.setDescription(COMMANDS.HELP.DESCRIPTION)
    .addSubcommand(option => 
			option.setName("list")
				.setDescription("List all commands"))
    .addSubcommand(option => 
			option.setName("trav")
				.setDescription("List all travel commands"))
    .addSubcommand(option => 
			option.setName("vote")
				.setDescription("List all vote commands"))
    .addSubcommand(option => 
      option.setName("pop")
        .setDescription("List all power up commands"))
    .addSubcommand(option => 
      option.setName("loc")
        .setDescription("List all location commands"))
	, async execute(interaction: CommandInteraction) {
    
    const [command, subcommand] = interaction.toString().split(" ");
    
    //HandleCommands(interaction, subcommand);

	},
};
