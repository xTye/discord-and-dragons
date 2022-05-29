import { APIMessageComponentEmoji, ColorResolvable, Snowflake, StageChannel } from "discord.js";
import { GameLocation } from ".";
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
    gif: string,
    color: ColorResolvable,
    emoji: APIMessageComponentEmoji,
    regions?: Map<Snowflake, Region>) {
    super(channel, picture, description, gif, color, emoji);
    
    this.lostChance = lostChance;
    this.travelTime = travelTime;

    if (regions) {
      this.regions = regions;
      [...regions].forEach(([id, region]) => {
        region.addRoute(this);

        [...regions].forEach(([travId, travRegion]) => {
          if (id != travId) region.addConnectedRegion(this, travRegion);
        });
      });
    }
    else {
      this.regions = new Map<Snowflake, Region>();
    }
  }

  addRegion(region: Region) {
    // This may not work
    [...this.regions].forEach(([id, travRegion]) => {
      region.addConnectedRegion(this, travRegion);
      travRegion.addConnectedRegion(this, region);
    });

    this.regions.set(region.channel.id, region);
    region.addRoute(this);
  }
}