import { Message } from "discord.js";
import { GameStateType, TimerType } from "./types";
import { general, convertTimer, DefaultTimer, players, SEARCH_TIME, INCREMENT_MILLIS, VOTE_TIME, MAX_ROUNDS, DefaultVoteRound, inQueue, playersById, MAX_TIES, STARTING_ROUND } from "./conts";
import { CountVotes, InitVotes, ResetVotes, VoteResults } from "./vote";
import { Name } from "./player";

export const game = {
  state: GameStateType.READY,
  rounds: 0,
  voteRound: DefaultVoteRound,
  timer: DefaultTimer,
}

export const enum ERR_CODES {DEFAULT = 0, MAX_TIES = -1, SUCCESS = -2, CALLBACK = -3, TIE = -4};
export const target: EventTarget = new EventTarget();

export async function Start(message: Message) {
  if (game.state !== GameStateType.READY) {
    message.reply("Game has already started.");
    return;
  }

  const user = message.guild?.members.cache.get(message.author.id);
  if (!user) return;

  const player = players.get(user.id);
  if (!player) {
    await general.channel.send(`You are not a player in the game. Use the !join command to join the game.`);
    return;
  }

  if (inQueue.length !== 0) {
    await general.channel.send(`Player is still joining game.`);
    return;
  }

  //! Put back in when live
  // if (players.size != 8) {
  //   message.reply(`Sorry ${Name(player)}, but there are only \`${players.size}/${MAX_PLAYERS}\` players in the game right now.`);
  //   return;
  // }

  try{
    STARTING_ROUND ? searchRound() : voteRound();
  } catch (err) {
    console.log(err);
  }
}

export async function searchRound() {
  game.timer = convertTimer(SEARCH_TIME);
  await general.channel.send(`We have now entered the search phase. Please feel free to roam the map using the !travel <location> command.`);
  const message = await general.channel.send(`Time left: \`${game.timer.minutes}:${game.timer.seconds}\``);
  game.state = GameStateType.SEARCH;
  const interval = setInterval(async () => {
    game.timer = convertTimer(game.timer.milliseconds - INCREMENT_MILLIS);
    await message.edit(`Time left: \`${game.timer.minutes}:${game.timer.seconds}\``);
  }, INCREMENT_MILLIS);

  setTimeout(async () => {
    clearInterval(interval);
    await message.delete();
    await voteRound();
  }, SEARCH_TIME);
}

export async function voteRound() {
  InitVotes();

  game.timer = convertTimer(VOTE_TIME);
  await general.channel.send(`We have now entered the ${game.voteRound.immuneRound ? "Immune" : "Death"} voitng phase. A timer will be started to count your votes.`);
  const message = await general.channel.send(`Time left: \`${game.timer.minutes}:${game.timer.seconds}\``);
  game.state = GameStateType.VOTE;

  //# Interval timer
  const interval = setInterval(async () => {
    game.timer = convertTimer(game.timer.milliseconds - INCREMENT_MILLIS);
    await message.edit(`Time left: \`${game.timer.minutes}:${game.timer.seconds}\``);
  }, INCREMENT_MILLIS);

  //# Timeout timer
  setTimeout(async () => {
    game.state = GameStateType.COUNT_VOTES;
    clearInterval(interval);
    await message.delete();

    game.voteRound.ties += 1;
    await CountVotes();
    if (game.voteRound.ties < MAX_TIES) {
      if (game.voteRound.err === ERR_CODES.SUCCESS) {
        await iterateNextHalfRound();
      }
      else {
        console.log("It was a tie");


        //# Recursion on itself
        await voteRound();
      }
    }
    //# Iterate next round
    else {
      game.voteRound.err = ERR_CODES.MAX_TIES;
      await iterateNextHalfRound();
    }
  }, VOTE_TIME);
}

export async function iterateNextHalfRound() {
  await VoteResults();

  const immuneRound = game.voteRound.immuneRound;
  if (!immuneRound) game.rounds++;
  if (game.rounds >= MAX_ROUNDS) {
    constructFinalResults();
    return;
  }

  game.voteRound.err = DefaultVoteRound.err;
  game.voteRound.player = DefaultVoteRound.player;
  game.voteRound.ties = 0;
  game.voteRound.immuneRound = !immuneRound;
  

  //TODO: Maybe delete later for checking votes.
  ResetVotes();
  
  await searchRound();
}

async function constructFinalResults() {

  let message = "Congratulations to these lucky winners:\n"
  message += "```ID\t\tPlayer\n";

  //# Iterate through votee's
  [...players].forEach(([id, player]) => {
    message += `${player.playerId}\t\t${Name(player)}\n`;
  });

  message += "```";

  general.channel.send(message);
}