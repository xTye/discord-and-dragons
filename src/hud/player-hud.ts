import { ButtonBuilder, ButtonStyle, CommandInteraction, EmbedBuilder, User } from "discord.js";
import { HUD } from ".";
import { client, game } from "..";
import { LAIR_DESC, LAIR_PIC, LAIR_PIC_EMBED, MAP } from "../lib/conts";
import { GameStateType } from "../lib/types";
import { Player } from "../player";

export class playerHUD extends HUD {

  override async render(interaction: CommandInteraction) {
    await interaction.reply({ content: "Loading..." });
    this.message = await this.message.edit({ embeds: [this.embed], components: [...this.actionrows] });
    await interaction.deleteReply();
  }

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

    const mapButton = new ButtonBuilder()
      .setCustomId("/map page:default")
      .setStyle(ButtonStyle.Primary)
      .setLabel("Map")
      .setEmoji("<:alsen:975968769174274078>")

    const readyButton = new ButtonBuilder()
      .setCustomId("/ready")
      .setStyle(ButtonStyle.Success)
      .setLabel("Ready")
      .setEmoji("✅")

    this.addActionRow(mapButton, readyButton);

    this.message = await player.channel.send({ embeds: [this.embed], components: [...this.actionrows] });
  }
  
  override async mapHUD(interaction: CommandInteraction, page: string) {

    this.getMapPage(page);

    this.map.region = game.regions.at(this.map.page);
    if (!this.map.region) { await interaction.reply({ content: "Load failure", ephemeral: true }); return; }

    this.embed
      .setTitle(this.map.region.channel.name)
      .setDescription(this.map.region.description)
      .setImage(this.map.region.picture)

    const prevButton = new ButtonBuilder()
      .setCustomId("/map page:prev")
      .setStyle(ButtonStyle.Primary)
      .setLabel("Prev")
      .setEmoji("◀️")

    const travelButton = new ButtonBuilder()
      .setCustomId("/travel to location:" + this.map.region.channel.id)
      .setStyle(ButtonStyle.Success)
      .setLabel("Go")
      .setEmoji("🚶‍♀️")
      .setDisabled(game.state === GameStateType.READY ? true : false)

    const nextButton = new ButtonBuilder()
      .setCustomId("/map page:next")
      .setStyle(ButtonStyle.Primary)
      .setLabel("Next")
      .setEmoji("▶️")

    const cancelButton = new ButtonBuilder()
      .setCustomId("/hud")
      .setStyle(ButtonStyle.Danger)
      .setLabel("Cancel")
      .setEmoji("<:redcross:758380151238033419>")

    this.addActionRow(prevButton, travelButton, nextButton, cancelButton);

    await this.render(interaction);
  }
}