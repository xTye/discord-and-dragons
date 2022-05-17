import { EmbedBuilder, Snowflake, StageChannel, VoiceChannel } from "discord.js";
import { RegionActivity } from "./activities/activity";
import { MAP } from "./lib/conts";
import { Player } from "./player";

export class Region {
  channel: StageChannel;
  description: string;
  picture: string;
  regPlayers: Map<Snowflake, Player>;
  edges: Map<Snowflake, Route>;
  activity?: RegionActivity;

  constructor(
    channel: StageChannel,
    picture: string,
    description: string) {
      this.channel = channel;
      this.regPlayers = new Map<Snowflake, Player>();
      this.edges = new Map<Snowflake, Route>();
      this.description = description;
      this.picture = picture;
      this.activity 
  }

  addActivity(activity: RegionActivity) {
    this.activity = activity;
  }
  
  newRound() {}

  async arrivedMessage(player: Player) {}

async mapHUD(mes: EmbedBuilder) {
    mes.setColor("#00ff44")
      .setThumbnail(MAP)
      .setImage(this.picture)
      .setDescription(this.description);
    
    return mes;
  }
}

export class Route {
  channel: VoiceChannel | StageChannel;
  lostChance: number;
  travelTime: number;
  picture: string;

  routPlayers: Map<Snowflake, Player>;
  regions: Map<Snowflake, Region>;

  constructor(
    channel: VoiceChannel | StageChannel,
    lostChance: number,
    travelTime: number,
    picture: string) {
    this.channel = channel;
    this.lostChance = lostChance;
    this.travelTime = travelTime;
    this.picture = picture;

    this.routPlayers = new Map<Snowflake, Player>();
    this.regions = new Map<Snowflake, Region>();
  }
}