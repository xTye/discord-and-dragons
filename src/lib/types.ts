import { CommandInteraction, Interaction, SlashCommandBuilder, StageChannel, VoiceChannel } from "discord.js";
import { ERR_CODES } from "../game";
import { Region } from "../locations/region";
import { Route } from "../locations/route";

export type PowerUpsType = { 
  checkTickets: number,
  mute: number,
  prioritySpeak: number,
};

export enum HUDType {MAP};

export enum GameStateType {READY, GM, SEARCH, VOTE, COUNT_VOTES};

export type TimerType = {
  milliseconds: number;
  minutes: number;
  seconds: number;
  timeout?: NodeJS.Timeout;
  interval?: NodeJS.Timer;
};

export type VotesType = Map<string, VoteType>;

export type VoteType = {
  numVotes: number;
  voters: Map<string, number>;
};

export type VoteRoundType = {
  err: ERR_CODES;
  ties: number;
  player: string;
  immuneRound: boolean;
};

export type InteractionType = {
  data: SlashCommandBuilder;
  execute(interaction: CommandInteraction): Promise<void>;
}

export type ConnectedRegion = {
  route: Route;
  region: Region;
}

export type PlayersByIdType = Map<number, string>;

export type Location = StageChannel | VoiceChannel;