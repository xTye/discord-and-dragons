import { APIMessageComponentEmoji, EmbedBuilder, Snowflake, StageChannel } from "discord.js";
import { GameLocation } from ".";
import { Route } from "./route";

export class Region extends GameLocation {
  routes: Map<Snowflake, Route>;
  travRegions: Map<Snowflake, Region>;

  constructor(
    channel: StageChannel,
    picture: string,
    description: string,
    emoji: APIMessageComponentEmoji) {
      super(channel, picture, description, emoji);
      this.routes = new Map<Snowflake, Route>();
      this.travRegions = new Map<Snowflake, Region>();
  }

  addRoute(route: Route) {
    this.routes.set(route.channel.id, route);
  }

  addTravelRegion(region: Region) {
    this.travRegions.set(region.channel.id, region);
  }

  override findPath(dest: Region): Route | undefined {
    let path: Route[] = [];

    [...this.routes].every(([id, route]) => {
      if (route.regions.get(dest.channel.id)) {
        path.push(route);
        return false;
      }

      return true;
    });

    return path.pop();
  }

  async mapHUD(mes: EmbedBuilder) {
    mes.setImage(this.picture)
      .setDescription(this.description);
    
    return mes;
  }
}