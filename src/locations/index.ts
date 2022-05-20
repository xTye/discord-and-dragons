import { Snowflake, StageChannel } from "discord.js";
import { RegionActivity } from "../activities";
import { Player } from "../player";

export class GameLocation {
  channel: StageChannel;
  description: string;
  picture: string;
  players: Map<Snowflake, Player>;
  activity?: RegionActivity;

  constructor(
    channel: StageChannel,
    picture: string,
    description: string) {
      this.channel = channel;
      this.players = new Map<Snowflake, Player>();
      this.description = description;
      this.picture = picture;
  }

  findPath(dest: GameLocation) {}

  addActivity(activity: RegionActivity) {
    this.activity = activity;
  }

  async arrivedMessage(player: Player) {}

  newRound() {}
}