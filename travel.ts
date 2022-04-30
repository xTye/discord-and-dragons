import { Message } from "discord.js";
import { COMMANDS } from "./commands";
import { convertTimer, DefaultTimer, graph, INCREMENT_MILLIS, players } from "./conts";
import { game } from "./game";
import { GameStateType, Player } from "./types";

export function HandleTravel(message: Message) {
  const player = players.get(message.author.id);
  if (!player) return;
  
  const subcommand = message.content.split(" ")
  if (subcommand.length < 2) return;

  let destination: string | null = null;
  let time = false;
  switch (subcommand[1]){
    case COMMANDS.TRAVEL.SUBCOMMANDS.MEADOW.COMMAND:
      destination = COMMANDS.TRAVEL.SUBCOMMANDS.MEADOW.COMMAND;
      break;
    case COMMANDS.TRAVEL.SUBCOMMANDS.VOLCANO.COMMAND:
      destination = COMMANDS.TRAVEL.SUBCOMMANDS.VOLCANO.COMMAND;
      break;
      case COMMANDS.TRAVEL.SUBCOMMANDS.COASTAL.COMMAND:
        destination = COMMANDS.TRAVEL.SUBCOMMANDS.COASTAL.COMMAND;
        break;
      case COMMANDS.TRAVEL.SUBCOMMANDS.OCEAN.COMMAND:
        destination = COMMANDS.TRAVEL.SUBCOMMANDS.OCEAN.COMMAND;
        break;
    case COMMANDS.TRAVEL.SUBCOMMANDS.CAVERN.COMMAND:
      destination = COMMANDS.TRAVEL.SUBCOMMANDS.CAVERN.COMMAND;
      break;
    case COMMANDS.TRAVEL.SUBCOMMANDS.LAIR.COMMAND:
      destination = COMMANDS.TRAVEL.SUBCOMMANDS.LAIR.COMMAND;
      break;
    case COMMANDS.TRAVEL.SUBCOMMANDS.TIME.COMMAND:
      time = true;
      break;
  }

  if (game.state != GameStateType.SEARCH)
    return;
  if (time) travelTime(message);
  if (destination) Travel(player, destination, message);
}

async function Travel(player: Player, to: string, message: Message) {
  //DESC lair to rt1
  if (to === COMMANDS.TRAVEL.SUBCOMMANDS.MEADOW.COMMAND && player.travel.location.id === graph.dragonsLair.id) {
    await player.user.voice.setChannel(graph.lairToRed.id);
    player.travel.location = graph.lairToRed.channel;
    player.acvitity.timer.milliseconds = graph.lairToRed.trvlTime;

    player.travel.destination = graph.tier1Red.channel;
  }

  //DESC rt1 to rt3
  else if (to === COMMANDS.TRAVEL.SUBCOMMANDS.VOLCANO.COMMAND && player.travel.location.id === graph.tier1Red.id) {
    await player.user.voice.setChannel(graph.redToRed.id);
    player.travel.location = graph.redToRed.channel;
    player.acvitity.timer.milliseconds = graph.redToRed.trvlTime;

    player.travel.destination = graph.tier3Red.channel;
  }

  //DESC rt3 to rt1
  else if (to === COMMANDS.TRAVEL.SUBCOMMANDS.MEADOW.COMMAND && player.travel.location.id === graph.tier3Red.id) {
    await player.user.voice.setChannel(graph.redToRed.id);
    player.travel.location = graph.redToRed.channel;
    player.acvitity.timer.milliseconds = graph.redToRed.trvlTime;

    player.travel.destination = graph.tier1Red.channel;
  }

  //DESC rt1 to lair
  else if (to === COMMANDS.TRAVEL.SUBCOMMANDS.LAIR.COMMAND && player.travel.location.id === graph.tier1Red.id) {
    await player.user.voice.setChannel(graph.lairToRed.id);
    player.travel.location = graph.lairToRed.channel;
    player.acvitity.timer.milliseconds = graph.lairToRed.trvlTime;

    player.travel.destination = graph.dragonsLair.channel;
  }

  //DESC lair to bt1
  else if (to === COMMANDS.TRAVEL.SUBCOMMANDS.COASTAL.COMMAND && player.travel.location.id === graph.dragonsLair.id) {
    await player.user.voice.setChannel(graph.lairToBlue.id);
    player.travel.location = graph.lairToBlue.channel;
    player.acvitity.timer.milliseconds = graph.lairToBlue.trvlTime;

    player.travel.destination = graph.tier1Blue.channel;
  }

  //DESC bt1 to bt3
  else if (to === COMMANDS.TRAVEL.SUBCOMMANDS.OCEAN.COMMAND && player.travel.location.id === graph.tier1Blue.id) {
    await player.user.voice.setChannel(graph.blueToBlue.id);
    player.travel.location = graph.blueToBlue.channel;
    player.acvitity.timer.milliseconds = graph.blueToBlue.trvlTime;
    
    player.travel.destination = graph.tier3Blue.channel;
  }

  //DESC bt3 to bt1
  else if (to === COMMANDS.TRAVEL.SUBCOMMANDS.COASTAL.COMMAND && player.travel.location.id === graph.tier3Blue.id) {
    await player.user.voice.setChannel(graph.blueToBlue.id);
    player.travel.location = graph.blueToBlue.channel;
    player.acvitity.timer.milliseconds = graph.blueToBlue.trvlTime;

    player.travel.destination = graph.tier1Blue.channel;
  }

  //DESC bt1 to lair
  else if (to === COMMANDS.TRAVEL.SUBCOMMANDS.LAIR.COMMAND && player.travel.location.id === graph.tier1Blue.id) {
    await player.user.voice.setChannel(graph.lairToBlue.id);
    player.travel.location = graph.lairToBlue.channel;
    player.acvitity.timer.milliseconds = graph.lairToBlue.trvlTime;

    player.travel.destination = graph.dragonsLair.channel;
  }

  //DESC lair to yt2
  else if (to === COMMANDS.TRAVEL.SUBCOMMANDS.CAVERN.COMMAND && player.travel.location.id === graph.dragonsLair.id) {
    await player.user.voice.setChannel(graph.lairToYellow.id);
    player.travel.location = graph.lairToYellow.channel;
    player.acvitity.timer.milliseconds = graph.lairToYellow.trvlTime;

    player.travel.destination = graph.tier2Yellow.channel;
  }

  //DESC yt2 to lair
  else if (to === COMMANDS.TRAVEL.SUBCOMMANDS.LAIR.COMMAND && player.travel.location.id === graph.tier2Yellow.id) {
    await player.user.voice.setChannel(graph.lairToYellow.id);
    player.travel.location = graph.lairToYellow.channel;
    player.acvitity.timer.milliseconds = graph.lairToYellow.trvlTime;

    player.travel.destination = graph.dragonsLair.channel;
  }

  //DESC Throw error
  else {
    message.reply(`Can not travel to ${to} from ${player.travel.location.name} use the \`!map\` command to view the existing map`);
    return;
  }

  player.acvitity.timer = convertTimer(player.acvitity.timer.milliseconds);
  await message.reply(`Traveling to ${player.travel.destination.name} from ${player.travel.location.name} across the *rough lands of the island*. It will take ${player.acvitity.timer.minutes} minutes and ${player.acvitity.timer.seconds} seconds to get there. Good Luck!`);

  //* Simulate travel
  try {
    player.acvitity.active = true;
    beginTravel(player);
  } catch (err) {
    player.acvitity.active = false;
  }
}

async function beginTravel(player: Player) {
  const TRAVEL_TIME = player.acvitity.timer.milliseconds;

  const interval = setInterval(async () => {
    player.acvitity.timer = convertTimer(player.acvitity.timer.milliseconds - INCREMENT_MILLIS);
  }, INCREMENT_MILLIS);

  const timeout = setTimeout(async () => {
    clearInterval(interval);
    player.user.voice.setChannel(player.travel.destination.id);
    player.travel.location = player.travel.destination;
    player.acvitity.active = false;
    player.acvitity.timer = DefaultTimer;
  }, TRAVEL_TIME);

  player.acvitity.timeout = timeout;
}

export function travelTime(message: Message) {
  const user = message.guild?.members.cache.get(message.author.id);
  if (!user) return;

  const player = players.get(user.id);
  if (!player){
    message.reply("Not a valid player");
    return;
  }
  if (player.acvitity.active == false) {
    message.reply("Not currently traveling");
    return;
  }

  message.reply(`You have ${player.acvitity.timer.minutes} minutes and ${player.acvitity.timer.seconds} seconds left of travel.`);
}


export function canTransit(message: Message) {
  if (game.state !== GameStateType.SEARCH) {
    message.reply("Game not in search phase.");
    return;
  } 

  const user = message.guild?.members.cache.get(message.author.id);
  if (!user) return;

  const player = players.get(user.id)
  if (!player){
    message.reply("Not a valid player");
    return;
  }
  if (player.acvitity.active) {
    message.reply("Currently in activity.");
    return;
  }

  return player;
}

export function DragonMove(player: Player) {
  player.user.voice.setChannel(graph.dragonsLair.id);
  player.travel.location = graph.dragonsLair.channel;
  player.travel.destination = graph.dragonsLair.channel;
  player.acvitity.timer = DefaultTimer;
  player.acvitity.active = false;
}