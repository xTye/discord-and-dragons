import { APIMessageComponentEmoji, APISelectMenuOption, Collection, ColorResolvable, Snowflake, StageChannel } from "discord.js";
import { GameLocation } from ".";
import { Game } from "../game";
import { Route } from "./route";

export type ConnectedRegion = {
  route: Route;
  region: Region;
};

export class Region extends GameLocation {
  routes: Collection<Snowflake, Route>;
  regions: Collection<Snowflake, ConnectedRegion>;
  regionSelections: APISelectMenuOption[];

  constructor(
    game: Game,
    channel: StageChannel,
    picture: string,
    description: string,
    gif: string,
    color: ColorResolvable,
    emoji: APIMessageComponentEmoji) {
      super(game, channel, picture, description, gif, color, emoji);
      this.routes = new Collection<Snowflake, Route>();
      this.regions = new Collection<Snowflake, ConnectedRegion>();
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