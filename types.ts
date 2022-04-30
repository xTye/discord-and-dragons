import { GuildMember, TextChannel, VoiceChannel } from "discord.js";

export type Player = {
  playerId: number,
  user: GuildMember,
  channel: TextChannel,
  acvitity: {
    active: boolean,
    timer: TimerType,
    timeout: NodeJS.Timeout | undefined,
  },
  travel: {
    location: VoiceChannel,
    destination: VoiceChannel,
  },
  vote: {
    tickets: number,
    spentTickets: number,
    immunity: boolean,
  },
  powerups: PowerUpsType,
};

export type PowerUpsType = { 
  checkTickets: number,
  mute: number,
  prioritySpeak: number,
};

export enum GameStateType {READY, GM, SEARCH, VOTE, COUNT_VOTES};

export type TimerType = {
  milliseconds: number;
  minutes: number;
  seconds: number;
};

export type VotesType = Map<string, VoteType>;

export type VoteType = {
  numVotes: number;
  voters: VotesPerPlayerType;
}

export type VotesPerPlayerType = Map<string, number>;

export type PlayersByIdType = Map<number, string>;