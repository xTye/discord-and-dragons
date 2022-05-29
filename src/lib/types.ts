import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Region } from "../locations/region";
import { Route } from "../locations/route";

export type PowerUpsType = { 
  checkTickets: number,
  mute: number,
  prioritySpeak: number,
};

export type TimerType = {
  milliseconds: number;
  minutes: number;
  seconds: number;
  timeout?: NodeJS.Timeout;
  interval?: NodeJS.Timer;
};

export type InteractionType = {
  data: SlashCommandBuilder;
  execute(interaction: CommandInteraction): Promise<void>;
};

export type ConnectedRegion = {
  route: Route;
  region: Region;
};

export type YesString = "yes" | "y" | "1";
