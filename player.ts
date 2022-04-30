import { GuildMember, Message } from "discord.js";
import { DefaultPowerUps, DefaultTimer, graph, inQueue, MAX_PLAYERS, players, playersById, playersCategory } from "./conts";
import { game } from "./game";
import { GameStateType, Player } from "./types";

export async function JoinGame(message: Message) {
  const user = message.guild?.members.cache.get(message.author.id);
  try{
    if (!user) return;
    // if (user.voice.channel && user.voice.channel.id !== "967515407441346684") {
    //   await message.reply("You must be in the `General` voice channel to join.");
    //   return;
    // }

    if (game.state !== GameStateType.READY){
      await message.reply("Game has already started.");
      return;
    }

    if (players.size >= MAX_PLAYERS) {
      await message.reply("The game is currently full.");
      return;
    }

    const isPlayer = players.get(user.id);
    if (isPlayer){
      await message.reply("You are already a player in the game.");
      return;
    }

    inQueue.push(true);
    if (!message.guild?.roles.everyone) return;
    const name = user.nickname ? user.nickname : user.displayName;
    const channel = await playersCategory.channel.createChannel(`${name}s-commands`, {
      permissionOverwrites: [{
        id: user.id,
        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
      },
      {
        id: message.guild?.roles.everyone,
        deny: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
      }]
    });
    await user.voice.setChannel(graph.dragonsLair.id );
    const player: Player = {
      playerId: players.size + 1,
      user: user,
      channel: channel,
      acvitity: {
        active: false,
        timer: DefaultTimer,
        timeout: undefined,
      },
      travel: {
        location: graph.dragonsLair.channel,
        destination: graph.dragonsLair.channel,
        traveling: false,
        timer: DefaultTimer,
        timeout: undefined,
      },
      vote: {
        immunity: false,
        tickets: 1,
        spentTickets: 0,
      },
      powerups: DefaultPowerUps,
    };
    players.set(player.user.id, player);
    playersById.set(player.playerId, player.user.id);
    
    
    await message.reply(`Welcome to the game ${Name(player)}! The current lobby is \`${players.size}/${MAX_PLAYERS}\` full.`);
    console.log(`${Name(player)} has joined the game.`)
  } catch (err) {
    message.reply("Must be in `General` voice chat to play the game.");
    console.log(err);
  }
  
  inQueue.pop();
}

export function FindRoom(message: Message) {
  const user = message.guild?.members.cache.get(message.author.id);
  if (!user) return;

  const player = players.get(user.id);
  if (!player){
    message.reply("Not a valid player");
    return;
  }

  message.reply(player.travel.location.name);
}

export function Name(player: Player) {
  return player.user.nickname ? player.user.nickname : player.user.displayName;
}

export function Kill(id: string, playerId: number) {
  players.delete(id);
  playersById.delete(playerId);
}

export function Tickets(message: Message) {
  const user = message.guild?.members.cache.get(message.author.id);
  if (!user) return;

  const player = players.get(user.id);
  if (!player){
    message.reply("Not a valid player");
    return;
  }

  message.reply(`You have \`${player.vote.tickets - player.vote.spentTickets}\` tickets remaining.`);
}

export function GetPlayers(message: Message) {
  try{
    let reply = "```\n";
    reply += "ID\t   |\tPlayer\n";
    reply += "--\t   |\t------\n";
    [...players].forEach(([id, player]) => {
      reply += `${player.playerId}\t\t|\t${Name(player)}\n`;
    });
    reply += "```";
    message.reply(reply);
  } catch (err) {
    console.log(err);
  }
}

export function GetPlayer(id: string) {
  return players.get(id);
}

export function isPlayer(player: any): player is Player {
  return player !== undefined;
}