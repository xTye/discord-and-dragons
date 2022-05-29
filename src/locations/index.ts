import { SelectMenuOptionBuilder } from "@discordjs/builders";
import { APIEmbedField, APIMessageComponentEmoji, ColorResolvable, EmojiResolvable, Snowflake, StageChannel } from "discord.js";
import { game } from "..";
import { GameActivity } from "../activities";
import { Player } from "../player";

export class GameLocation {
  selection: SelectMenuOptionBuilder;
  channel: StageChannel;
  description: string;
  picture: string;
  gif: string;
  color: ColorResolvable;
  emoji: APIMessageComponentEmoji;
  players: Map<Snowflake, Player>;
  playersFields: Map<Snowflake, APIEmbedField>;
  activity?: GameActivity;

  constructor(
    channel: StageChannel,
    picture: string,
    description: string,
    gif: string,
    color: ColorResolvable,
    emoji: APIMessageComponentEmoji) {
      this.channel = channel;
      this.players = new Map<Snowflake, Player>();
      this.playersFields = new Map<Snowflake, APIEmbedField>();
      this.description = description;
      this.picture = picture;
      this.gif = gif;
      this.color = color;
      this.emoji = emoji;

      this.selection = new SelectMenuOptionBuilder()
        .setValue(this.channel.id)
        .setLabel(this.channel.name)
        .setDescription(this.description.slice(0, this.description.length < 46 ? this.description.length : 46) + "...")
        .setEmoji(emoji);
  }

  findPath(dest: GameLocation) {}

  addActivity(activity: GameActivity) {
    this.activity = activity;
  }

  async arrivedMessage(player: Player) {}

  newRound() {}

  playerJoined(player: Player) {
    this.players.set(player.user.id, player);
    this.playersFields.set(player.user.id, player.field);

    [...game.players].forEach(async ([id, otherPlayer]) => {
      if (otherPlayer != player)
        await otherPlayer.hud.playerReadyChangeEvent();
    });
  }

  playerLeft(player: Player) {
    this.players.delete(player.user.id);
    this.playersFields.delete(player.user.id);

    [...game.players].forEach(async ([id, otherPlayer]) => {
      if (otherPlayer != player)
        await otherPlayer.hud.playerReadyChangeEvent();
    });
  }
}