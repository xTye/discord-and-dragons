import DiscordJS, { Intents } from "discord.js";
import dotenv from "dotenv";
import { init } from "./init";
dotenv.config();
import { HandleCommand } from "./commands";

export const client = new DiscordJS.Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
  ]
});
//! Variables

//* Ready
client.on("ready", () => {
  init();
  console.log("Bot is ready!");
});

//* Message Create
client.on("messageCreate", async (message) => {
  HandleCommand(message);
});

client.login(process.env.TOKEN);