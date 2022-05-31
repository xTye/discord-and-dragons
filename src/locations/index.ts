import { SelectMenuOptionBuilder } from "@discordjs/builders";
import { APIEmbedField, APIMessageComponentEmoji, Collection, ColorResolvable, EmojiResolvable, Snowflake, StageChannel } from "discord.js";
import { game } from "..";
import { GameActivity } from "../activities";
import { Game } from "../game";
import { Player } from "../player";

export class GameLocation {
  game: Game;
  selection: SelectMenuOptionBuilder;
  channel: StageChannel;
  description: string;
  picture: string;
  gif: string;
  color: ColorResolvable;
  emoji: APIMessageComponentEmoji;
  players: Collection<Snowflake, Player>;
  playersFields: Collection<Snowflake, APIEmbedField>;
  activity?: GameActivity;

  constructor(
    game: Game,
    channel: StageChannel,
    picture: string,
    description: string,
    gif: string,
    color: ColorResolvable,
    emoji: APIMessageComponentEmoji) {
      this.channel = channel;
      this.players = new Collection<Snowflake, Player>();
      this.playersFields = new Collection<Snowflake, APIEmbedField>();
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

    if (!player.game.round.loading) {
      game.players.forEach((otherPlayer, id) => {
        if (otherPlayer != player)
          otherPlayer.hud.loadPlayerJoinedRegion();
      });
    }
  }

  playerLeft(player: Player) {
    this.players.delete(player.user.id);
    this.playersFields.delete(player.user.id);

    if (!player.game.round.loading) {
      game.players.forEach((otherPlayer, id) => {
        if (otherPlayer != player)
          otherPlayer.hud.loadPlayerJoinedRegion();
      });
    }
  }
}