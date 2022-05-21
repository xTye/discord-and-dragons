import { ActionRowBuilder, ButtonBuilder, CommandInteraction, EmbedBuilder, Message, MessageActionRowComponentBuilder } from "discord.js";
import { game } from "../game";
import { COMMANDS } from "../lib/commands";
import { REGION_NUM } from "../lib/conts";
import { Region } from "../locations/region";
import { Player } from "../player";

export class HUD {
  map: {
    region?: Region,
    page: number,
  };
  message: Message;
  embed: EmbedBuilder;
  actionrows: ActionRowBuilder<MessageActionRowComponentBuilder>[];
  interaction: CommandInteraction;

  constructor() {
    this.map = {
      page: -1,
    };
    this.message = Message.prototype;
    this.embed = new EmbedBuilder();
    this.actionrows = [];
    this.interaction = CommandInteraction.prototype;
  }

  async render(player: Player) {
    this.message = await this.message.edit({ embeds: [this.embed], components: [...this.actionrows] });
  }

  setActionRow(at: number, ...buttons: ButtonBuilder[]) {
    if (this.actionrows[at])
      this.actionrows[at] = new ActionRowBuilder({ components: buttons });
    else
      throw new Error("Index out of range.");
  }

  addActionRow(...buttons: ButtonBuilder[]) {
    this.actionrows.push(new ActionRowBuilder({ components: buttons }));
  }

  getMapPage(page: string) {
    if (page === COMMANDS.MAP.SUBCOMMANDS.DEFAULT.NAME) this.map.page = Math.floor(Math.random() * REGION_NUM);
    else if (page === COMMANDS.MAP.SUBCOMMANDS.NEXT.NAME) this.map.page = (this.map.page + 1) % REGION_NUM;
    else this.map.page = (this.map.page - 1) % REGION_NUM;
  }

  async mapHUD(interaction: CommandInteraction, page: string) {

    this.getMapPage(page);

    this.map.region = game.regions.at(this.map.page);
    if (!this.map.region) { await interaction.reply({ content: "Load failure", ephemeral: true }); return false; }

    this.embed
      .setTitle(this.map.region.channel.name)
      .setDescription(this.map.region.description)
      .setImage(this.map.region.picture)
      //.setFields([{ name: "" }])

    await interaction.reply({ embeds: [this.embed] });
  }

  static async GetPlayers(interaction: CommandInteraction) {
    const mes = new EmbedBuilder()
      .setDescription("Here are a list of the active lobby / game. This will probably stay like this until the game is actually finished.");
    
      [...game.players].forEach(([id, player]) => {
      mes.addFields([{ name: `Player ID: ${player.playerId}`, value: `<@${player.user.id}>`, inline: true }]);
    });
  
  
    await interaction.reply({ embeds: [mes], ephemeral: true });
  }
}