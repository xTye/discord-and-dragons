import { ButtonBuilder, EmbedBuilder, ActionRowBuilder, MessageActionRowComponentBuilder, ButtonStyle, Snowflake, APISelectMenuOption, SelectMenuBuilder, APIEmbedField } from "discord.js";

export class GameUI {
  id: Snowflake;
  embed: EmbedBuilder;
  actionrows: ActionRowBuilder<MessageActionRowComponentBuilder>[];

  constructor(id: Snowflake) {
    this.id = id;
    this.embed = new EmbedBuilder();
    this.actionrows = [];
  }

  init() {}

  load(command?: string) {}

  timers() {}

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

  createSelectMenu(command: string, label: string, options: APISelectMenuOption[]) {
    const menu = new SelectMenuBuilder()
      .setCustomId(command + ' ' + this.id)
      .setPlaceholder(label)
      .setOptions(options);

    return menu;
  }

  addFields(...fields: APIEmbedField[]) {
    this.embed.addFields(fields);
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

  static whiteSpace(): APIEmbedField {
    return {
      name: "\u200B",
      value: "\u200B",
      inline: false,
    };
  }
}