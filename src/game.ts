import { GameStateType, TimerType, } from "./lib/types";
import { convertTimer, DefaultTimer, SEARCH_TIME, INCREMENT_MILLIS, VOTE_TIME, MAX_ROUNDS, DefaultVoteRound, MAX_TIES, STARTING_ROUND, FROG, COLOSSEUM, TICKET_INC_DEATH, graph, general } from "./lib/conts";
import { CountVotes, InitVotes, ResetVotes, VoteResults, votes } from "./vote";
import { Collection, CommandInteraction, EmbedBuilder, Snowflake } from "discord.js";
import { Player } from "./player";
import { Region } from "./locations/region";
import { Route } from "./locations/route";
import { GameLocation } from "./locations";
import { game } from ".";
import { joinVoiceChannel, VoiceConnection } from "@discordjs/voice";

export enum ERR_CODES {DEFAULT = 0, MAX_TIES = -1, SUCCESS = -2, CALLBACK = -3, TIE = -4};

export class Game {
  state: GameStateType;
  rounds: number;
  voteRoundData: {
    err: ERR_CODES,
    ties: number,
    player: string,
    immuneRound: boolean,
  };
  connection?: VoiceConnection;
  timer: TimerType;
  locationStart?: GameLocation;
  locationVote?: GameLocation;
  regions: Collection<Snowflake, Region>;
  routes: Collection<Snowflake, Route>;
  players: Collection<Snowflake, Player>;
  readyQueue: boolean[];

  constructor() {
    this.state = GameStateType.READY;
    this.rounds = 0;
    this.voteRoundData = {
      err: ERR_CODES.DEFAULT,
      ties: 0,
      player: "",
      immuneRound: true,
    },
    this.timer = DefaultTimer;
    this.regions = new Collection<Snowflake, Region>();
    this.routes = new Collection<Snowflake, Route>();
    this.players = new Collection<Snowflake, Player>();
    this.readyQueue = [];
  }

  addRegion(region: Region, locationStart?: GameLocation, locationVote?: GameLocation) {
    this.regions.set(region.channel.id, region);

    if (locationStart) this.locationStart = locationStart;
    if (locationVote) this.locationVote = locationVote;
  }

  setLocationStart(locationsStart: GameLocation) {
    this.locationStart = locationsStart;
  }

  setLocationVote(locationVote: GameLocation) {
    this.locationVote = locationVote;
  }

  async start() {
    [...this.players].forEach(([id, player]) => {
      player.field.name = "___";
    });

    try{
      STARTING_ROUND ? this.searchRound() : this.voteRound();
    } catch (err) {
      console.log(err);
    }
  }

  async initSearch() {
    console.log("Entering search round.");
    this.timer = convertTimer(SEARCH_TIME);

    [...this.regions].forEach(([id, region]) => {
        region.newRound();
    });

    [...this.players].forEach(async ([key, player]) => {
      await player.hud.searchRound();
    });

    this.state = GameStateType.SEARCH;
  }

  async searchRound() {
    await this.initSearch();
  
    //DESC Updates searching time left
    const interval = setInterval(async () => {
      this.timer = convertTimer(this.timer.milliseconds - INCREMENT_MILLIS);
    }, INCREMENT_MILLIS);
  
    //DESC Fires when searching is done
    setTimeout(async () => {
      clearInterval(interval);
      await this.voteRound();
    }, SEARCH_TIME);
  }

  async voteRound() {
    console.log("Entering voting round");
    InitVotes();
    this.timer = convertTimer(VOTE_TIME);
  
    const mes: EmbedBuilder = new EmbedBuilder()
      .setColor("#f54284")
      .setTitle("Vote Round")
      .setAuthor({ name: "Game Master", iconURL: COLOSSEUM })
      .setThumbnail(COLOSSEUM)
      .setDescription(`The walls rumble around you. 'You have ${this.timer.minutes} minutes and ${this.timer.seconds} remaining for vote time👩‍🚒'`)
      .addFields([{ name: "**Directions**", value: "Use the `/vote player <PLAYER ID> <TICKETS>` command to vote for a player with a certain number of tickets." }]);
      [...votes].forEach(([votee, voters]) => {
        const player = this.players.get(votee);
        if (!player) { return; }
        mes.addFields([{ name: `Player ID: ${player.playerId}`, value: `<@${votee}>`, inline: true }]);
      });
      
    [...this.players].forEach(async ([key, player]) => {
      await player.channel.send({ embeds: [mes] });
    });
  
    this.state = GameStateType.VOTE;
  
    //DESC Updates voting time left
    const interval = setInterval(async () => {
      this.timer = convertTimer(this.timer.milliseconds - INCREMENT_MILLIS);
    }, INCREMENT_MILLIS);
  
    //DESC Fires when voting is done
    setTimeout(async () => {
      this.state = GameStateType.COUNT_VOTES;
      clearInterval(interval);
  
      this.voteRoundData.ties += 1;
      await CountVotes();
      if (this.voteRoundData.ties < MAX_TIES) {
        if (this.voteRoundData.err === ERR_CODES.SUCCESS) {
          await this.iterateNextHalfRound();
        }
        else {
          console.log("It was a tie");
  
          //# Recursion on itself
          await this.voteRound();
        }
      }
      //DESC Iterate next round
      else {
        this.voteRoundData.err = ERR_CODES.MAX_TIES;
        await this.iterateNextHalfRound();
      }
    }, VOTE_TIME);
  }

  async iterateNextHalfRound() {
    await VoteResults();
  
    const immuneRound = this.voteRoundData.immuneRound;
    if (!immuneRound) this.rounds++;
    if (this.rounds >= MAX_ROUNDS) {
      this.constructFinalResults();
      return;
    }
  
    this.voteRoundData.err = DefaultVoteRound.err;
    this.voteRoundData.player = DefaultVoteRound.player;
    this.voteRoundData.ties = 0;
    this.voteRoundData.immuneRound = !immuneRound;
    
  
    //! Maybe delete later for checking votes.
    ResetVotes();
    
    await this.searchRound();
  }
  
  async constructFinalResults() {
  
    const mes = new EmbedBuilder()
      .setColor("#ec03fc")
      .setTitle(`Congratulations!`)
      .setAuthor({ name: "Game Master", iconURL: COLOSSEUM })
      .setThumbnail("https://media.giphy.com/media/wcjtdRkYDK0sU/giphy.gif")
      .setDescription(`Here are the winners of tonight's squid game 👿`)
      .setImage("https://media.giphy.com/media/W29GyCAWS46qv1tG7Y/giphy.gif");
    
    [...this.players].forEach(([id, player]) => {
      mes.addFields([{ name: `Player ID: ${player.playerId}` , value: `<@${id}> with ${player.vote.tickets - TICKET_INC_DEATH} tickets remaining.\u200B` }]);
    });
  
    [...this.players].forEach(([id, player]) => {
      player.channel.send({ embeds: [mes] });
    });
  
    general.channel.send({ embeds: [mes] });
  }
}


