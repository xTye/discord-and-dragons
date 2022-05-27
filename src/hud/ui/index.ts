import { ButtonBuilder, EmbedBuilder, ActionRowBuilder, MessageActionRowComponentBuilder, ButtonStyle, Snowflake, APISelectMenuOption, SelectMenuBuilder } from "discord.js";

export class UI {
  id: Snowflake
  embed: EmbedBuilder;
  actionrows: ActionRowBuilder<MessageActionRowComponentBuilder>[];
  

  constructor(id: Snowflake) {
    this.id = id;
    this.embed = new EmbedBuilder();
    this.actionrows = [];
  }

  setActionRow(at: number, ...components: MessageActionRowComponentBuilder[]) {
    if (this.actionrows[at])
      this.actionrows[at] = new ActionRowBuilder({ components: components });
    else
      throw new Error("Index out of range.");
  }

  addActionRow(...components: MessageActionRowComponentBuilder[]) {
    this.actionrows.push(new ActionRowBuilder({ components: components }));
  }

  setComponentInRow(row: number, col: number, component: MessageActionRowComponentBuilder) {
    if (this.actionrows[row])
      if (this.actionrows[row].components[col])
        this.actionrows[row].components[col] = component;
  }

  addComponentInRow(row: number, component: MessageActionRowComponentBuilder) {
    if (this.actionrows[row])
      this.actionrows[row].components.push(component);
  }

  setDisabledComponentInActionRow(row: number, col: number, disabled: boolean) {
    if (this.actionrows[row])
      if (this.actionrows[row].components[col])
        this.actionrows[row].components[col].data.disabled = disabled;
  }

  setButtonIdInActionRow(row: number, col: number, id: string) {
    if (this.actionrows[row]) {
      if (this.actionrows[row].components[col]) {
        this.actionrows[row].components[col].setCustomId(id);
      }
    }
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

  clearActionRows() {
    this.actionrows = [];
  }

  clearFields() {
    this.embed.setFields([]);
  }

  createSelectMenu(command: string, options: APISelectMenuOption[]) {
    const menu = new SelectMenuBuilder()
      .setCustomId(command + ' ' + this.id)
      .setOptions(options);

    return menu;
  }

  addWhiteSpace() {
    this.embed.addFields([
      {
      name: "\u200B",
      value: "\u200B",
      inline: false,
      }
    ]);
  }

  init() {}

  load(command?: string) {}
}