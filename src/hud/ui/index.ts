import { ButtonBuilder, EmbedBuilder, ActionRowBuilder, MessageActionRowComponentBuilder, ButtonStyle, Snowflake, APISelectMenuOption, SelectMenuBuilder, APIEmbedField, APIMessageComponentEmoji } from "discord.js";
import { Player } from "../../player";

export class GameUI {
  player?: Player;
  id: Snowflake;
  embed: EmbedBuilder;
  actionrows: ActionRowBuilder<MessageActionRowComponentBuilder>[];

  constructor(id: Snowflake) {
    this.id = id;
    this.embed = new EmbedBuilder();
    this.actionrows = [];
  }

  load(command?: string) {}

  loadTimers() {
    if (this.player && this.player.game.started) {
      let timers = `Round: ${this.player.game.round.timer.string}`;

      if (this.player.travel.traveling)
        timers += ` | Travel: ${this.player.travel.timer.string}`;

      if (this.player.active) {
        if (this.player.active.activity.timer)
          timers += ` | Activity: ${this.player.active.activity.timer.string}`;
        else
          if (this.player.active.timer)
            timers += ` | Activity: ${this.player.active.timer.string}`;
      }

      if (this.player.stats.muted)
        timers += ` | Muted: ${this.player.stats.muted.string}`;
      

      this.embed.setFooter({
        text: `${this.player.game.round.name} ${timers}`,
        iconURL: this.player.location.picture
      });
    }
  }

  init() {}

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

  /**
 * Function for joining a game. Create a new player object, and adds the instance to 
 * the current players in the game.
 * 
 * @param command custom id of the button meant to be used as a command interaction
 * @param label label of the button
 * @param style style of the button
 * @param emoji emoji of the button
 * @param disable true is disable
 */
  createButton(command: string, label: string, style?: ButtonStyle, emoji?: APIMessageComponentEmoji | string, disabled?: boolean) {
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