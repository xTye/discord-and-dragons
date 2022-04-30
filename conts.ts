import { CategoryChannel, Message, TextChannel, VoiceChannel } from "discord.js";
import { ERR_CODES } from "./game";
import { Player, PlayersByIdType, PowerUpsType, TimerType, VoteType } from "./types";

export const time = {
  fifteenMin    : 900000,
  tenMin        : 600000,
  fiveMin       : 300000,
  twoMin        : 120000,
  oneMin        : 60000,
  thirtySec     : 30000,
  twentySec     : 20000,
  fifteenSec    : 15000,
  tenSec        : 10000,
};

export const MAX_PLAYERS = 8;
export const MAX_ROUNDS = 1;
export const MAX_TIES = 2;
export const SEARCH_TIME = time.fiveMin;
export const VOTE_TIME = time.twoMin;
export const LAST_WORDS = time.tenSec;
export const INCREMENT_MILLIS = 5000;
export const TICKET_INC_IMMUNE = 1;
export const TICKET_INC_DEATH = 1;
export const STARTING_ROUND = true;

export const TEIR3_SEARCH_PROB = 0.1;
export const TIER2_PROB = 0.01;
export const TIER1_SEARCH_PROB = 0.1;

export const playersCategory = {
  id: "967517776593965087",
  channel: CategoryChannel.prototype,
  set setChannel(channel: CategoryChannel) {
    this.channel = channel;
  },
};

export const general = {
  id: "967515407441346683",
  channel: TextChannel.prototype,
  set setChannel(channel: TextChannel) {
    this.channel = channel;
  },
  message: Message.prototype,
  set setMessage(message: Message) {
    this.message = message;
  }
};

export const graph = {
  dragonsLair     : {id: "967524434426626108", tickets: 0, channel: VoiceChannel.prototype, set setChannel(channel: VoiceChannel) {this.channel = channel}},
  tier1Red        : {id: "967524580522602526", tickets: 0, rng: TIER1_SEARCH_PROB, channel: VoiceChannel.prototype, set setChannel(channel: VoiceChannel) {this.channel = channel}},
  tier3Red        : {id: "967524780678983690", tickets: 0, rng: TEIR3_SEARCH_PROB, channel: VoiceChannel.prototype, set setChannel(channel: VoiceChannel) {this.channel = channel}},
  tier1Blue       : {id: "967524960446865408", tickets: 0, rng: TIER1_SEARCH_PROB, channel: VoiceChannel.prototype, set setChannel(channel: VoiceChannel) {this.channel = channel}},
  tier3Blue       : {id: "967525006215098418", tickets: 0, rng: TEIR3_SEARCH_PROB, channel: VoiceChannel.prototype, set setChannel(channel: VoiceChannel) {this.channel = channel}},
  tier2Yellow     : {id: "967525051563909120", tickets: 0, rng: TIER2_PROB, channel: VoiceChannel.prototype, set setChannel(channel: VoiceChannel) {this.channel = channel}},

  lairToRed       : {id: "967527461401288754", trvlTime: time.thirtySec, channel: VoiceChannel.prototype, set setChannel(channel: VoiceChannel) {this.channel = channel}},
  lairToBlue      : {id: "967527646869221446", trvlTime: time.thirtySec, channel: VoiceChannel.prototype, set setChannel(channel: VoiceChannel) {this.channel = channel}},
  lairToYellow    : {id: "967527748220375110", trvlTime: time.thirtySec, channel: VoiceChannel.prototype, set setChannel(channel: VoiceChannel) {this.channel = channel}},
  redToRed        : {id: "967527602271187026", trvlTime: time.thirtySec, channel: VoiceChannel.prototype, set setChannel(channel: VoiceChannel) {this.channel = channel}},
  blueToBlue      : {id: "967527847432421427", trvlTime: time.thirtySec, channel: VoiceChannel.prototype, set setChannel(channel: VoiceChannel) {this.channel = channel}},
};

export const players: Map<string, Player> = new Map<string, Player>();
export const playersById: PlayersByIdType = new Map<number, string>();
export const inQueue: boolean[] = [];

export function convertTimer(milliseconds: number) {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.ceil((milliseconds - (minutes * 60000)) / 1000);
  
  return {
    milliseconds,
    minutes,
    seconds,
  }
};

export const DefaultPowerUps: PowerUpsType = {
  checkTickets: 0,
  mute: 0,
  prioritySpeak: 0,
};

export const DefaultTimer = {
  milliseconds: 0,
  minutes: 0,
  seconds: 0,
};

export const DefaultVoteRound = { err: ERR_CODES.DEFAULT, ties: 0, player: "", immuneRound: true, };

export function DefaultVotes() {
  return new Map<string, VoteType>();
};


export function DefaultVotesPerPlayer() {
  return new Map<string, number>();
};