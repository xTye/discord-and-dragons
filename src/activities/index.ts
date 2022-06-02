import { ActionRowBuilder, APIMessageComponentEmoji, Collection, CommandInteraction, EmbedBuilder, MessageActionRowComponentBuilder, Snowflake } from "discord.js";
import { GameTimer } from "../lib/timer";
import { GameLocation } from "../locations";
import { Player } from "../player";

export class GameActivity {
  name: string;
  location: GameLocation;
  gif: string;
  emoji: APIMessageComponentEmoji | string;
  players: Collection<Snowflake, Player>;

  constructor(name: string, location: GameLocation, gif?: string, emoji?: APIMessageComponentEmoji | string) {
    this.name = name;
    this.location = location;
    this.gif = gif ? gif : this.location.gif;
    this.emoji = emoji ? emoji : this.location.emoji;
    this.players = new Collection<Snowflake, Player>;
  }

  actionRows(): ActionRowBuilder<MessageActionRowComponentBuilder>[] {
    return [];
  }

  newRound() {
    this.players.clear();
  }

  async update(interaction: CommandInteraction, player: Player, command?: string) {
    await interaction.reply({ content: "Cannot voluntarily interact with an activity at this location.", ephemeral: true });
  }

  async vote(interaction: CommandInteraction, player: Player, command?: string) {
    await interaction.reply({ content: "There is no vote at this location.", ephemeral: true });
  }

  protected join(player: Player, options?: { timer?: GameTimer , vote?: boolean}) {
    this.players.set(player.user.id, player);
    player.setActivity({ 
      activity: this,
      timer: options?.timer,
      vote: options?.vote,
    });

    return player;
  }

  leave(player?: Player) {
    if (!player) return;
    this.players.delete(player.user.id);
    player.setActivity();
  }
}