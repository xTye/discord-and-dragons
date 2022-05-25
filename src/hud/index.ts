import { CommandInteraction, Message, Snowflake } from "discord.js";
import { UI } from "./ui";

export class HUD {
  id: Snowflake;
  message: Message;
  ui: UI;

  constructor(id: Snowflake) {
    this.id = id;
    this.message = Message.prototype;
    this.ui = new UI(id);
  }

  async render(interaction: CommandInteraction) {
    await interaction.reply({ content: "Loading..." });
    this.message = await this.message.edit({ embeds: [this.ui.embed], components: [...this.ui.actionrows] });
    await interaction.deleteReply();
  }
}