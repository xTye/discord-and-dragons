import { GameStateType, TimerType, } from "./lib/types";
import { general, convertTimer, DefaultTimer, SEARCH_TIME, INCREMENT_MILLIS, VOTE_TIME, MAX_ROUNDS, DefaultVoteRound, MAX_TIES, STARTING_ROUND, FROG, COLOSSEUM, TICKET_INC_DEATH, graph } from "./lib/conts";
import { CountVotes, InitVotes, ResetVotes, VoteResults, votes } from "./vote";
import { Collection, EmbedBuilder, Snowflake } from "discord.js";
import { Region, Route } from "./region";
import { Player } from "./player";

export class Game {
  state: GameStateType;
  rounds: number;
  voteRound: {
    err: ERR_CODES,
    ties: number,
    player: string,
    immuneRound: boolean,
  };
  timer: TimerType;
  regions: Region[];
  routes: Route[];
  players: Collection<Snowflake, Player>;

  constructor() {
    this.state = GameStateType.READY;
    this.rounds = 0;
    this.voteRound = {
      err: ERR_CODES.DEFAULT,
      ties: 0,
      player: "",
      immuneRound: true,
    },
    this.timer = DefaultTimer;
    this.regions = [];
    this.routes = [];
    this.players = new Collection<Snowflake, Player>();
  }

  addRegion(region: Region) {
    
  }
}

export const game = new Game();

export const enum ERR_CODES {DEFAULT = 0, MAX_TIES = -1, SUCCESS = -2, CALLBACK = -3, TIE = -4};


export async function Start() {
  try{
    STARTING_ROUND ? searchRound() : voteRound();
  } catch (err) {
    console.log(err);
  }
}

async function initSearch() {
  Object.values(graph).forEach(value => {
    if ("region" in value)
      value.region.newRound();
  });
}

export async function searchRound() {
  console.log("Entering search round.");
  game.timer = convertTimer(SEARCH_TIME);
  await initSearch();

  const mes = new EmbedBuilder()
    .setDescription(`ROAR!! the dragon shreaks. 'You have ${game.timer.minutes} minutes and ${game.timer.seconds < 10 ? "0" + game.timer.seconds : game.timer.seconds} seconds remaining for search time. Please me, and maybe I will grant you a wish 🐉'`);

  [...game.players].forEach(async ([key, player]) => {
    mes.setTitle(`${player.name}`)

    await player.channel.send({ embeds: [mes] });
  });

  game.state = GameStateType.SEARCH;

  //DESC Updates searching time left
  const interval = setInterval(async () => {
    game.timer = convertTimer(game.timer.milliseconds - INCREMENT_MILLIS);
  }, INCREMENT_MILLIS);

  //DESC Fires when searching is done
  setTimeout(async () => {
    clearInterval(interval);
    await voteRound();
  }, SEARCH_TIME);
}

export async function voteRound() {
  console.log("Entering voting round");
  InitVotes();
  game.timer = convertTimer(VOTE_TIME);

  const mes: EmbedBuilder = new EmbedBuilder()
    .setColor("#f54284")
    .setTitle("Vote Round")
    .setAuthor({ name: "Game Master", iconURL: COLOSSEUM })
    .setThumbnail(COLOSSEUM)
    .setDescription(`The walls rumble around you. 'You have ${game.timer.minutes} minutes and ${game.timer.seconds} remaining for vote time👩‍🚒'`)
    .addFields([{ name: "**Directions**", value: "Use the `/vote player <PLAYER ID> <TICKETS>` command to vote for a player with a certain number of tickets." }]);
    [...votes].forEach(([votee, voters]) => {
      const player = game.players.get(votee);
      if (!player) { return; }
      mes.addFields([{ name: `Player ID: ${player.playerId}`, value: `<@${votee}>`, inline: true }]);
    });
    
  [...game.players].forEach(async ([key, player]) => {
    await player.channel.send({ embeds: [mes] });
  });

  game.state = GameStateType.VOTE;

  //DESC Updates voting time left
  const interval = setInterval(async () => {
    game.timer = convertTimer(game.timer.milliseconds - INCREMENT_MILLIS);
  }, INCREMENT_MILLIS);

  //DESC Fires when voting is done
  setTimeout(async () => {
    game.state = GameStateType.COUNT_VOTES;
    clearInterval(interval);

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
    //DESC Iterate next round
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
  

  //! Maybe delete later for checking votes.
  ResetVotes();
  
  await searchRound();
}

async function constructFinalResults() {

  const mes = new EmbedBuilder()
    .setColor("#ec03fc")
    .setTitle(`Congratulations!`)
    .setAuthor({ name: "Game Master", iconURL: COLOSSEUM })
    .setThumbnail("https://media.giphy.com/media/wcjtdRkYDK0sU/giphy.gif")
    .setDescription(`Here are the winners of tonight's squid game 👿`)
    .setImage("https://media.giphy.com/media/W29GyCAWS46qv1tG7Y/giphy.gif");
  
  [...game.players].forEach(([id, player]) => {
    mes.addFields([{ name: `Player ID: ${player.playerId}` , value: `<@${id}> with ${player.vote.tickets - TICKET_INC_DEATH} tickets remaining.\u200B` }]);
  });

  [...game.players].forEach(([id, player]) => {
    player.channel.send({ embeds: [mes] });
  });

  general.channel.send({ embeds: [mes] });
}