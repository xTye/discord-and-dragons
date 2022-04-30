import { Message } from "discord.js";
import { COMMANDS } from "./commands";
import { players } from "./conts";

export function HandlePop(message: Message) {
  const player = players.get(message.author.id);
  if (!player) return;
  
  const subcommand = message.content.split(" ")
  if (subcommand.length < 2) return;

  switch (message.content.split(" ")[1]){
    case COMMANDS.POWERUP.SUBCOMMANDS.CHECK_TICK.COMMAND:
      checkTickets(message)
      break;
    case COMMANDS.POWERUP.SUBCOMMANDS.MUTE.COMMAND:
      COMMANDS.TRAVEL.SUBCOMMANDS.VOLCANO.COMMAND;
      break;
    case COMMANDS.POWERUP.SUBCOMMANDS.PRIO_SPK.COMMAND:
      COMMANDS.TRAVEL.SUBCOMMANDS.COASTAL.COMMAND;
      break;

  }
}

function checkTickets(message: Message) {

}