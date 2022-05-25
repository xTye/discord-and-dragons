import { ButtonBuilder, ButtonStyle, CommandInteraction, EmbedBuilder, User } from "discord.js";
import { HUD } from ".";
import { client, game } from "..";
import { LAIR_PIC, LAIR_PIC_EMBED, MAP } from "../lib/conts";
import { GameStateType } from "../lib/types";
import { Player } from "../player";

export class playerHUD extends HUD {
  playerUI: 

  async init(player: Player) {
    this.embed = new EmbedBuilder()
      .setTitle(`Hey, ${player.name}`)
      .setColor("#c94b68")
      .setDescription(`Welcome to the game! Here is a list of people who are also in the lobby.`)
      .addFields([
        {
        name: "\u200B",
        value: "\u200B",
        inline: false,
        },
      ])
      .setAuthor({ name: `Tickets: ${player.vote.tickets}`, iconURL: player.user.displayAvatarURL()})
      .setThumbnail(MAP)
      .setImage(LAIR_PIC_EMBED)
      .setFooter({ text: `Time: ${player.travel.timer.minutes}:${player.travel.timer.seconds < 10 ? "0" + player.travel.timer.seconds : player.travel.timer.seconds}`, iconURL: LAIR_PIC })
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

    this.message = await player.channel.send({ embeds: [this.embed], components: [...this.actionrows] });
  }
}