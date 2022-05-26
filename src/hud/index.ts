import { CommandInteraction, Message, Snowflake } from "discord.js";
import { Player } from "../player";
import { UI } from "./ui";
import { mapUI } from "./ui/map-ui";
import { playerUI } from "./ui/player-ui";

export class HUD {
  id: Snowflake;
  pui: playerUI;
  ui: UI;

  message: Message;

  constructor(id: Snowflake, player: Player) {
    this.id = id;
    this.pui = new playerUI(id, player);
    this.ui = this.pui;

    this.message = Message.prototype;
  }

  async render(interaction: CommandInteraction) {
    await interaction.reply({ content: "Loading..." });
    this.message = await this.message.edit({ embeds: [this.ui.embed], components: [...this.ui.actionrows] });
    await interaction.deleteReply();
  }

  loadPlayerUI(interaction: CommandInteraction) {
    this.ui = this.pui;
    this.render(interaction)
  }

  async init() {
    this.ui.init();
    this.message = await this.pui.player.channel.send({ embeds: [this.ui.embed], components: [...this.ui.actionrows] });
  }

  async loadMap(interaction: CommandInteraction, command: string) {
    if (!(this.ui instanceof mapUI))
      this.ui = new mapUI(this.id);

    this.ui.load(command);
    this.render(interaction);
  }
}