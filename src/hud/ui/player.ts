
import { ButtonStyle, EmbedBuilder } from "discord.js";
import { UI } from ".";
import { game } from "../..";
import { COLOSSEUM_EMBED, KILL_MESSAGES, MAP } from "../../lib/conts";
import { GameStateType } from "../../lib/types";
import { Region } from "../../locations/region";
import { Player } from "../../player";

enum ReadyRows { main = 0 }
enum ReadyButtons { map = 0, ready, start, description, help }

enum SearchRows { travel = 0, main }
enum SearchTravelComponents { select = 0 }
enum SearchMainComponents { map = 0, travel, activity, powerup, help }

export class PlayerUI extends UI {
  player: Player;

  constructor(id: string, player: Player) {
    super(id);
    this.player = player;
  }

  override init() {
    this.embed = new EmbedBuilder()
      .setTitle(`Hey, ${this.player.name}`)
      .setColor("#c94b68")
      .setDescription(`Welcome to the game! Here is a list of people who are also in the lobby.`)
      .setAuthor({ name: `Tickets: ${this.player.vote.tickets}`, iconURL: this.player.picture})
      .setThumbnail(MAP)
      .setImage(COLOSSEUM_EMBED)
      .setFooter({ text: `Time: ${this.player.travel.timer.minutes}:${this.player.travel.timer.seconds < 10 ? "0" + this.player.travel.timer.seconds : this.player.travel.timer.seconds}`, iconURL: this.player.location.picture })
      .setTimestamp(new Date());

    this.addWhiteSpace();
    this.addFields(...this.player.location.playersFields.values());
    this.addWhiteSpace();

    const mapButton = this.createButton(
      "/map page:default",
      "Map",
      ButtonStyle.Secondary,
      { name: "string", id: "975968769174274078" },
    );

    const readyButton = this.createButton(
      "/player ready",
      "Ready",
      ButtonStyle.Success,
      "✅",
    );

    const startButton = this.createButton(
      "/start",
      "Start",
      ButtonStyle.Secondary,
      "🧠",
    );

    const descriptionButton = this.createButton(
      "/player setdescription",
      "Set Description",
      ButtonStyle.Secondary,
      "📝",
    )

    const helpButton = this.createButton(
      "/help state:" + game.state,
      "Help",
      ButtonStyle.Secondary,
      "❔",
    );

    this.addActionRow(mapButton, readyButton, startButton, descriptionButton, helpButton);
  }

  updateVariables() {
    this.embed.setAuthor({ name: `Tickets: ${this.player.vote.tickets}`, iconURL: this.player.user.displayAvatarURL()})
      .setFooter({ text: `Time: ${this.player.travel.timer.minutes}:${this.player.travel.timer.seconds < 10 ? "0" + this.player.travel.timer.seconds : this.player.travel.timer.seconds}`, iconURL: this.player.location.picture })
      .setTimestamp(new Date());

    this.clearFields();

    this.addWhiteSpace();
    this.addFields(...this.player.location.playersFields.values());
    this.addWhiteSpace();
  }

  searchRound() {
    this.clearActionRows();
    this.updateVariables();

    this.embed.setTitle(this.player.location.channel.name)
      .setDescription(this.player.location.description)
      .setImage(this.player.location.gif)
      .setColor(this.player.location.color);

    if (this.player.location instanceof Region) {
      const regionMenu = this.createSelectMenu(
        "/travel select:",
        "Travel to...",
        this.player.location.regionSelections,
      );

      this.addActionRow(regionMenu);
    }

    const mapButton = this.createButton(
      "/map page:default",
      "Map",
      ButtonStyle.Secondary,
      { name: "string", id: "975968769174274078" },
    );

    const travelButton = this.createButton(
      "/travel",
      "Travel",
      ButtonStyle.Success,
      "🗺️",
      this.player.travel.destination ? true : false,
    );

    const activityButton = this.createButton(
      "/activity",
      "Activity",
      this.player.location.activity ? ButtonStyle.Primary : ButtonStyle.Secondary,
      this.player.location.activity ? this.player.location.activity.emoji : "🔘",
      this.player.location.activity ? false : true,
    );

    const powerUpsButton = this.createButton(
      "/pop",
      "Power Ups",
      this.player.location.activity ? ButtonStyle.Primary : ButtonStyle.Secondary,
      this.player.location.activity ? this.player.location.activity.emoji : "🔘",
      this.player.location.activity ? false : true,
    );

    const helpButton = this.createButton(
      "/help state:" + game.state,
      "Help",
      ButtonStyle.Secondary,
      "❔",
    );

    this.addActionRow(mapButton, travelButton, activityButton, powerUpsButton, helpButton);
  }

  kill() {
    this.clearActionRows();
    this.updateVariables();
    this.clearFields();

    this.embed.setTitle(KILL_MESSAGES[Math.floor(Math.random() * KILL_MESSAGES.length)] + this.player.name)
     .setDescription("Mankind is poised midway between the gods and the beasts. You have reached your fate, while the others will live on to step on your ashes.\n\n" +
      "Are they beasts?\n" +
      "What is a god?\n\n" +
      "You hear the sound of the dragon's wings ruffle...")
     .setColor(null)
     .setImage(null);
  }

  override load() {
    this.updateVariables();

    if (game.state === GameStateType.READY) {
      this.embed.setColor(this.player.ready ? "#4bc97f" : "#c94b68");

      const readyButton = this.createButton(
        "/player ready",
        this.player.ready ? "Unready" : "Ready",
        this.player.ready ? ButtonStyle.Danger : ButtonStyle.Success,
        this.player.ready ? { name: "redcross", id: "758380151238033419" } : "✅",
      );

      this.setComponentInRow(ReadyRows.main, ReadyButtons.ready, readyButton);
    }

    else if (game.state === GameStateType.SEARCH) {
      this.embed.setTitle(this.player.location.channel.name)
        .setDescription(this.player.location.description)
        .setImage(this.player.location.gif)
        .setColor(this.player.location.color);

      const activityButton = this.createButton(
        "/activity",
        "Activity",
        this.player.location.activity ? ButtonStyle.Primary : ButtonStyle.Secondary,
        this.player.location.activity ? this.player.location.activity.emoji : "🔘",
        this.player.location.activity ? false : true,
      );

      const powerUpsButton = this.createButton(
        "/pop",
        "Power Ups",
        this.player.location.activity ? ButtonStyle.Primary : ButtonStyle.Secondary,
        this.player.location.activity ? this.player.location.activity.emoji : "🔘",
        this.player.location.activity ? false : true,
      );
      
      this.setDisabledComponentInActionRow(SearchRows.travel, SearchTravelComponents.select, this.player.travel.traveling);
      this.setDisabledComponentInActionRow(SearchRows.main, SearchMainComponents.travel, this.player.travel.traveling);
      this.setComponentInRow(SearchRows.main, SearchMainComponents.activity, activityButton);
    }
  }
}