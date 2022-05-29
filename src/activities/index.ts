import { APIMessageComponentEmoji, CommandInteraction, EmbedBuilder, Snowflake } from "discord.js";
import { DefaultTimer } from "../lib/conts";
import { TimerType } from "../lib/types";
import { GameLocation } from "../locations";
import { Player } from "../player";

export type PlayerActivityType = {
  player: Player;
  timer?: TimerType;
  vote?: boolean;
}

export class GameActivity {
  name: string;
  location: GameLocation;
  gif: string;
  emoji: APIMessageComponentEmoji | string;
  players: Map<Snowflake, PlayerActivityType>;
  ui: EmbedBuilder;

  constructor(name: string, location: GameLocation, gif?: string, emoji?: APIMessageComponentEmoji | string) {
    this.name = name;
    this.location = location;
    this.gif = gif ? gif : this.location.gif;
    this.emoji = emoji ? emoji : this.location.emoji;
    this.players = new Map<Snowflake, PlayerActivityType>;
    this.ui = new EmbedBuilder();
  }

  newRound() {
    this.players.forEach((x, id) => {
      clearTimeout(x.timer?.timeout);
      x.player.setActivity();
    });

    this.players.clear();
  }

  async update(interaction: CommandInteraction, player: Player, command?: string) {}

  async vote(interaction: CommandInteraction, x: PlayerActivityType, command?: string) {
    await interaction.reply({ content: "There is no vote at this location", ephemeral: true });
  }

  join(player: Player, timer?: TimerType, vote?: boolean) {
    const x: PlayerActivityType = {
      player,
      timer,
      vote,
    };

    this.players.set(x.player.user.id, x);
    x.player.setActivity(this);

    return x;
  }

  leave(x?: PlayerActivityType) {
    if (!x) return;

    clearInterval(x.timer?.interval);
    clearTimeout(x.timer?.timeout);
    this.players.delete(x.player.user.id);
    x.player.setActivity();
  }
}