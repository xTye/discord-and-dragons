import { SelectMenuOptionBuilder } from "@discordjs/builders";
import { APIMessageComponentEmoji, EmojiResolvable, Snowflake, StageChannel } from "discord.js";
import { RegionActivity } from "../activities";
import { Player } from "../player";

export class GameLocation {
  selection: SelectMenuOptionBuilder;
  channel: StageChannel;
  description: string;
  picture: string;
  emoji: APIMessageComponentEmoji;
  players: Map<Snowflake, Player>;
  activity?: RegionActivity;

  constructor(
    channel: StageChannel,
    picture: string,
    description: string,
    emoji: APIMessageComponentEmoji) {
      this.channel = channel;
      this.players = new Map<Snowflake, Player>();
      this.description = description;
      this.picture = picture;
      this.emoji = emoji;

      this.selection = new SelectMenuOptionBuilder()
        .setValue(this.channel.id)
        .setLabel(this.channel.name)
        .setDescription(this.description.slice(0, this.description.length < 46 ? this.description.length : 46) + "...")
        .setEmoji(emoji);
  }

  findPath(dest: GameLocation) {}

  addActivity(activity: RegionActivity) {
    this.activity = activity;
  }

  async arrivedMessage(player: Player) {}

  newRound() {}
}