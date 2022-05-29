import { APIMessageComponentEmoji, APISelectMenuOption, ColorResolvable, Snowflake, StageChannel } from "discord.js";
import { GameLocation } from ".";
import { ConnectedRegion } from "../lib/types";
import { Player } from "../player";
import { Route } from "./route";

export class Region extends GameLocation {
  routes: Map<Snowflake, Route>;
  regions: Map<Snowflake, ConnectedRegion>;
  regionSelections: APISelectMenuOption[];

  constructor(
    channel: StageChannel,
    picture: string,
    description: string,
    gif: string,
    color: ColorResolvable,
    emoji: APIMessageComponentEmoji) {
      super(channel, picture, description, gif, color, emoji);
      this.routes = new Map<Snowflake, Route>();
      this.regions = new Map<Snowflake, ConnectedRegion>();
      this.regionSelections = [];
  }

  addRoute(route: Route) {
    this.routes.set(route.channel.id, route);
  }

  addConnectedRegion(route: Route, region: Region) {
    this.regions.set(region.channel.id, { route, region });
    this.regionSelections.push(region.selection.toJSON());
  }
}