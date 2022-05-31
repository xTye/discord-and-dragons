import { ActionRowBuilder, APIMessageComponentEmoji, Collection, CommandInteraction, EmbedBuilder, MessageActionRowComponentBuilder, Snowflake } from "discord.js";
import { GameLocation } from "../locations";
import { Player } from "../player";

export type PlayerActivityType = {
  player: Player;
  vote?: boolean;
}

export class GameActivity {
  name: string;
  location: GameLocation;
  gif: string;
  emoji: APIMessageComponentEmoji | string;
  players: Collection<Snowflake, PlayerActivityType>;

  constructor(name: string, location: GameLocation, gif?: string, emoji?: APIMessageComponentEmoji | string) {
    this.name = name;
    this.location = location;
    this.gif = gif ? gif : this.location.gif;
    this.emoji = emoji ? emoji : this.location.emoji;
    this.players = new Collection<Snowflake, PlayerActivityType>;
  }

  actionRows(): ActionRowBuilder<MessageActionRowComponentBuilder>[] {
    return [];
  }

  newRound() {
    this.players.clear();
  }

  async update(interaction: CommandInteraction, player: Player, command?: string) {}

  async vote(interaction: CommandInteraction, x: PlayerActivityType, command?: string) {
    await interaction.reply({ content: "There is no vote at this location", ephemeral: true });
  }

  join(player: Player, vote?: boolean) {
    const x: PlayerActivityType = {
      player,
      vote,
    };

    this.players.set(x.player.user.id, x);
    x.player.setActivity(this);

    return x;
  }

  leave(x?: PlayerActivityType) {
    if (!x) return;
    this.players.delete(x.player.user.id);
    x.player.setActivity();
  }
}