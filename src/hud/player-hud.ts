import { ButtonBuilder, ButtonStyle, CommandInteraction, EmbedBuilder, User } from "discord.js";
import { HUD } from ".";
import { game } from "../game";
import { LAIR_DESC, MAP } from "../lib/conts";
import { Player } from "../player";

export class playerHUD extends HUD {

  init(player: Player) {
    this.embed = new EmbedBuilder()
      .setTitle(`Hey, ${player.name}`)
      .setDescription(`Welcome to the game! Here is a list of people who are also in the lobby.`)
      .setAuthor({ name: `Tickets: ${player.vote.tickets}`, iconURL: player.user.displayAvatarURL()})
      .setThumbnail(MAP)
      .setFooter({ text: `\`\`\`Time: ${player.travel.timer.minutes}:${player.travel.timer.seconds < 10 ? "0" + player.travel.timer.seconds : player.travel.timer.seconds}\`\`\``, iconURL: LAIR_DESC });
    
      [...game.players].forEach(([id, player]) => {
      player.hud.embed.addFields([{ name: `Player ID: ${player.playerId}`, value: `<@${player.user.id}>`, inline: true }]);
    });

    const mapButton = new ButtonBuilder()
      .setCustomId("map")
      .setStyle(ButtonStyle.Primary)
      .setLabel("Map")
      .setEmoji("975969511020822528")

    const readyButton = new ButtonBuilder()
      .setCustomId("ready")
      .setStyle(ButtonStyle.Success)
      .setLabel("977479954914750494")

    player.hud.addActionRow(mapButton, readyButton);

    this.render(player);
  }
  
  override async mapHUD(interaction: CommandInteraction, page: string, player: Player) {

    this.getMapPage(page);

    this.map.region = game.regions.at(this.map.page);
    if (!this.map.region) { await interaction.reply({ content: "Load failure", ephemeral: true }); return; }

    await interaction.reply({ content: "Loading..." });

    this.embed
      .setTitle(this.map.region.channel.name)
      .setDescription(this.map.region.description)
      .setImage(this.map.region.picture)
      //.setFields([{ name: "" }])

    await this.render(player);
  }
}