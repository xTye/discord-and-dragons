import { APIMessageComponentEmoji, Collection, ColorResolvable, Snowflake, StageChannel } from "discord.js";
import { GameLocation } from ".";
import { GameTimer } from "../lib/timer";
import { Region } from "./region";

const LOST_CHANCE = 0.01;
const MIN_TRAVEL_TIME = GameTimer.fiveSec;

export class Route extends GameLocation {
  lostChance: number;
  travelTime: number;
  regions: Collection<Snowflake, Region>;

  constructor(
    channel: StageChannel,
    travelTime: number,
    picture: string,
    description: string,
    gif: string,
    color: ColorResolvable,
    emoji: APIMessageComponentEmoji,
    regions?: Collection<Snowflake, Region>,
    lostChance?: number) {
    super(channel, picture, description, gif, color, emoji);
    
    this.lostChance = lostChance ? lostChance : LOST_CHANCE;
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
      this.regions = new Collection<Snowflake, Region>();
    }
  }

  getTravelTime(mult: number) {
    const time = this.travelTime - Math.round(this.travelTime * mult);
    return time > MIN_TRAVEL_TIME ? time : MIN_TRAVEL_TIME;
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