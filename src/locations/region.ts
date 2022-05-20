import { EmbedBuilder, Snowflake, StageChannel } from "discord.js";
import { GameLocation } from ".";
import { POWERUP_MUTE_TIME } from "../lib/conts";
import { Route } from "./route";

export class Region extends GameLocation {
  routes: Map<Snowflake, Route>;

  constructor(
    channel: StageChannel,
    picture: string,
    description: string) {
      super(channel, picture, description);
      this.routes = new Map<Snowflake, Route>();
  }

  addRoute(route: Route) {
    this.routes.set(route.channel.id, route);
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