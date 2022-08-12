import { ActionRowBuilder, APIMessageComponentEmoji, Collection, ColorResolvable, CommandInteraction, EmbedBuilder, MessageActionRowComponentBuilder, Snowflake } from "discord.js";
import { GameTimer } from "../lib/timer";
import { GameLocation } from "../locations";
import { Player } from "../player";

export class GameActivity {
  name: string;
  timer?: GameTimer;
  location: GameLocation;
  htjoin: string;
  htplay: string;
  gif: string;
  color: ColorResolvable;
  emoji: APIMessageComponentEmoji | string;
  players: Collection<Snowflake, Player>;
  safeTime: number;
  done: boolean = false;
  

  constructor(name: string, location: GameLocation, htjoin?: string, htplay?: string, gif?: string, color?: ColorResolvable, emoji?: APIMessageComponentEmoji | string, safeTime?: number) {
    this.name = name;
    this.location = location;
    this.htjoin = htjoin ? htjoin : "Uh oh, there are no join directions... Good Luck";
    this.htplay = htplay ? htplay : "Uh of, there are no play directions... Good Luck";
    this.color = color ? color : "#FFFFFF";
    this.gif = gif ? gif : this.location.gif;
    this.emoji = emoji ? emoji : this.location.emoji;
    this.players = new Collection<Snowflake, Player>;
    this.safeTime = safeTime ? safeTime : 0;
  }

  actionRows(): ActionRowBuilder<MessageActionRowComponentBuilder>[] {
    return [];
  }

  newRound() {
    this.players.clear();
  }

  get embed() {
    return new EmbedBuilder().setTitle(this.name)
      .setFields(
        { name: "How to join", value: this.htjoin },
        { name: "How to play", value: this.htplay },
      )
      .setColor(this.color)
      .setImage(this.gif)
  }

  async update(interaction: CommandInteraction, player: Player, command?: string) {
    await interaction.reply({ content: "Loading Activity..." });
    await player.hud.loadAlert("Uh oh", "Our developing monkeys messed up somewhere...");
    await interaction.deleteReply();
  }

  async vote(interaction: CommandInteraction, player: Player, command?: string) {
    await interaction.reply({ content: "Loading Activity..." });
    await player.hud.loadAlert("Uh oh", "Our developing monkeys messed up somewhere...");
    await interaction.deleteReply();
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

  async leave(player?: Player) {
    if (!player) return;
    this.players.delete(player.user.id);
    player.setActivity();
  }
}