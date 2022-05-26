
import { ButtonBuilder } from "@discordjs/builders";
import { ButtonStyle, EmbedBuilder } from "discord.js";
import { UI } from ".";
import { game } from "../..";
import { LAIR_PIC, LAIR_PIC_EMBED, MAP } from "../../lib/conts";
import { Player } from "../../player";

export class playerUI extends UI {
  player: Player;

  constructor(id: string, player: Player) {
    super(id);
    this.player = player;
  }

  override init() {
    this.embed = new EmbedBuilder()
      .setTitle(`Hey, ${this.player.name}`)
      .setColor("#c94b68")
      .setDescription(`Welcome to the game! Here is a list of people who are also in the lobby.`)
      .addFields([
        {
        name: "\u200B",
        value: "\u200B",
        inline: false,
        },
      ])
      .setAuthor({ name: `Tickets: ${this.player.vote.tickets}`, iconURL: this.player.user.displayAvatarURL()})
      .setThumbnail(MAP)
      .setImage(LAIR_PIC_EMBED)
      .setFooter({ text: `Time: ${this.player.travel.timer.minutes}:${this.player.travel.timer.seconds < 10 ? "0" + this.player.travel.timer.seconds : this.player.travel.timer.seconds}`, iconURL: LAIR_PIC })
      .setTimestamp(new Date());

    [...game.players].forEach(([id, player]) => {
      this.embed.addFields([{ name: `Player ID: ${player.playerId}`, value: `<@${player.user.id}>`, inline: true }]);
    });

    this.embed.addFields([
      {
      name: "\u200B",
      value: "\u200B",
      inline: false,
      }
    ])



    const mapButton = this.createButton(
      "/map page:default",
      "Map",
      ButtonStyle.Primary,
      { name: "string", id: "975968769174274078" }
    );

    const readyButton = this.createButton(
      "/ready",
      "Ready",
      ButtonStyle.Success,
      "✅"
    );

    this.addActionRow(mapButton, readyButton);
  }
}