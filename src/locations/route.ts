import { Snowflake, StageChannel } from "discord.js";
import { GameLocation } from ".";
import { Player } from "../player";
import { Region } from "./region";

export class Route extends GameLocation {
  lostChance: number;
  travelTime: number;
  regions: Map<Snowflake, Region>;

  constructor(
    channel: StageChannel,
    lostChance: number,
    travelTime: number,
    picture: string,
    description: string,
    regions?: Map<Snowflake, Region>) {
    super(channel, picture, description);
    
    this.lostChance = lostChance;
    this.travelTime = travelTime;

    if (regions) {
      this.regions = regions;
      [...regions].forEach(([id, region]) => {
        region.addRoute(this);
      });
    }
    else {
      this.regions = new Map<Snowflake, Region>();
    }
  }

  addRegion(region: Region) {
    this.regions.set(region.channel.id, region);
    region.addRoute(this);
  }
}