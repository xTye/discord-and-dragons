import { ButtonBuilder, EmbedBuilder, ActionRowBuilder, MessageActionRowComponentBuilder, ButtonStyle, Snowflake } from "discord.js";

export class UI {
  id: Snowflake
  embed: EmbedBuilder;
  actionrows: ActionRowBuilder<MessageActionRowComponentBuilder>[];

  constructor(id: Snowflake) {
    this.id = id;
    this.embed = new EmbedBuilder();
    this.actionrows = [];
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

  createButton(command: string, label: string, style?: ButtonStyle, emoji?: { name: string, id: Snowflake } | string, disabled?: boolean) {
    const button = new ButtonBuilder()
      .setCustomId(command + ' ' + this.id)
      .setStyle(style ? style : ButtonStyle.Primary)
      .setLabel(label)
      .setDisabled(disabled ? disabled : false);

    if (emoji)
      button.setEmoji(typeof emoji === "string" ? emoji : `<:${emoji.name}:${emoji.id}>`);

    return button;
  }

  init() {}

  load(command?: string) {}
}