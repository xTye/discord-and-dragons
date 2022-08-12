
import { ActionRowBuilder, ButtonStyle, CommandInteraction, EmbedBuilder, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ThreadMemberFlagsBitField } from "discord.js";
import { GameUI } from ".";
import { game } from "../..";
import { MAP } from "../../lib/conts";
import { Region } from "../../locations/region";
import { Player } from "../../player";
import { VoteRound } from "../../rounds/vote";

const KILL_MESSAGES = [
  "Well played ",
  "Better luck next time ",
  "Almost ",
  "Killer work ",
  "Unlucky ",
];

const VOTE_MESSAGES = [
  "Destroy ",
  "Eliminate ",
  "%#@$ ",
  "I hate ",
  "Screw ",
];


enum ReadyRows { main = 0 }
enum ReadyButtons { map = 0, ready, start, description, help }

enum SearchRows { select = 0, travel, main }
enum SearchTravelComponents { select = 0 }
enum SearchTravelButtonComponents { map = 0, travel }
enum SearchMainComponents { inventory = 0, activity, help }

enum VoteRows { select = 0, vote, main }
enum VoteSelectComponents { select = 0 }
enum VoteTravelButtonComponents { map = 0 }
enum VoteMainComponents { inventory = 0, activity, help }

export class PlayerUI extends GameUI {
  player: Player;

  constructor(id: string, player: Player) {
    super(id);
    this.player = player;
  }

  override init() {
    this.embed = new EmbedBuilder()
      .setTitle(this.player.location.channel.name)
      .setDescription(this.player.inventory.getUI)
      .setColor("#c94b68")
      .setAuthor({ name: this.player.name, iconURL: this.player.picture})
      .setThumbnail(MAP)
      .setImage(this.player.location.gif)
      .setFooter({ text: `${this.player.game.round.name} Round`, iconURL: this.player.location.picture })
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
      "/player state select:ready",
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
      "/player state select:load_description",
      "Set Description",
      ButtonStyle.Secondary,
      "📝",
    );

    const helpButton = this.createButton(
      "/help state:" + game.round.name,
      "Help",
      ButtonStyle.Secondary,
      "❔",
    );

    this.addActionRow(mapButton, readyButton, startButton, descriptionButton, helpButton);
  }

  updateVariables() {
    this.embed.setTitle(this.player.location.channel.name)
      .setDescription(this.player.inventory.getUI)
      .setImage(this.player.location.gif)

    if (this.player.game.started)
      this.embed.setColor(this.player.location.color);

    this.clearFields();

    this.addWhiteSpace();
    this.addFields(...this.player.location.playersFields.values());
    this.addWhiteSpace();
  }

  loadStart() {
    this.embed.setTimestamp(null);
  }

  loadSearchRound() {
    this.clearActionRows();
    this.updateVariables();

    if (this.player.location instanceof Region) {
      const regionMenu = this.createSelectMenu(
        "/player travel select:",
        this.player.travel.destination ? this.player.travel.destination.region.channel.name : "Travel to...",
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
      "/player travel",
      "Travel",
      this.player.travel.traveling ? ButtonStyle.Danger : ButtonStyle.Success,
      "🗺️",
      (this.player.travel.destination ? false : true) || (this.player.travel.traveling ? true : false),
    );

    this.addActionRow(mapButton, travelButton);

    const inventoryButton = this.createButton(
      "/player inventory select:load",
      "Inventory",
      ButtonStyle.Primary,
      "🎒",
    );

    const activityButton = this.createButton(
      "/player activity",
      "Activity",
      this.player.location.activity ? ButtonStyle.Primary : ButtonStyle.Secondary,
      this.player.location.activity ? this.player.location.activity.emoji : "🔘",
      this.player.location.activity ? false : true,
    );

    const helpButton = this.createButton(
      "/help state:" + game.round.name,
      "Help",
      ButtonStyle.Secondary,
      "❔",
    );

    this.addActionRow(inventoryButton, activityButton, helpButton);
  }

  loadTraveling() {
    this.updateVariables();
    this.setDisabledComponentInActionRow(SearchRows.select, SearchTravelComponents.select, true);

    const activityButton = this.createButton(
      "/player activity",
      "Activity",
      this.player.location.activity ? ButtonStyle.Primary : ButtonStyle.Secondary,
      this.player.location.activity ? this.player.location.activity.emoji : "🔘",
      this.player.location.activity ? false : true,
    );

    this.setComponentInRow(SearchRows.main, SearchMainComponents.activity, activityButton);
    
    const travelButton = this.createButton(
      "/player travel",
      "Travel",
      this.player.travel.traveling ? ButtonStyle.Danger : ButtonStyle.Success,
      "🗺️",
      (this.player.travel.destination ? false : true) || (this.player.travel.traveling ? true : false),
    );

    this.setComponentInRow(SearchRows.travel, SearchTravelButtonComponents.travel, travelButton);
  }

  loadTraveled() {
    this.updateVariables();
    this.setDisabledComponentInActionRow(SearchRows.select, SearchTravelComponents.select, false);

    if (this.player.location instanceof Region) {
      const regionMenu = this.createSelectMenu(
        "/player travel select:",
        this.player.travel.destination ? this.player.travel.destination.region.channel.name : "Travel to...",
        this.player.location.regionSelections,
      );

      this.setComponentInRow(SearchRows.select, SearchTravelComponents.select, regionMenu);
    }

    const activityButton = this.createButton(
      "/player activity",
      "Activity",
      this.player.location.activity ? ButtonStyle.Primary : ButtonStyle.Secondary,
      this.player.location.activity ? this.player.location.activity.emoji : "🔘",
      this.player.location.activity ? false : true,
    );

    this.setComponentInRow(SearchRows.main, SearchMainComponents.activity, activityButton);

    const travelButton = this.createButton(
      "/player travel",
      "Travel",
      this.player.travel.traveling ? ButtonStyle.Danger : ButtonStyle.Success,
      "🗺️",
      (this.player.travel.destination ? false : true) || (this.player.travel.traveling ? true : false),
    );

    this.setComponentInRow(SearchRows.travel, SearchTravelButtonComponents.travel, travelButton);
  }

  loadRegionUpdate() {
    this.updateVariables();
  }

  kill() {
    this.clearActionRows();
    this.updateVariables();
    this.clearFields();
    this.embed.setFooter(null);

    this.embed.setTitle(KILL_MESSAGES[Math.floor(Math.random() * KILL_MESSAGES.length)] + this.player.name)
     .setDescription("Mankind is poised midway between the gods and the beasts. You have reached your fate, while the others will live on to step on your ashes.\n\n" +
      "Are they beasts?\n" +
      "What is a god?\n\n" +
      "You hear the sound of the dragon's wings ruffle...")
     .setColor(null)
     .setImage(null);
  }

  async loadModalDescription(interaction: CommandInteraction) {
    const textIn = new TextInputBuilder()
      .setStyle(TextInputStyle.Paragraph)
      .setLabel("Description")
      .setRequired(true)
      .setCustomId("set_description")
      .setMinLength(1)
      .setMaxLength(47)

    const rows: ActionRowBuilder<TextInputBuilder> = new ActionRowBuilder({ components: [textIn] });

    const modal = new ModalBuilder()
      .setTitle("Set Game Description")
      .setCustomId("/player state select:set_description")
      .addComponents(rows)

    await interaction.showModal(modal)
  }

  loadSetDescription() {
    this.clearFields();

    this.addWhiteSpace();
    this.addFields(...this.player.location.playersFields.values());
    this.addWhiteSpace();
  }

  loadSetDestination() {
    if (this.player.location instanceof Region) {
      const regionMenu = this.createSelectMenu(
        "/player travel select:",
        this.player.travel.destination ? this.player.travel.destination.region.channel.name : "Travel to...",
        this.player.location.regionSelections,
      );

      this.setComponentInRow(SearchRows.select, SearchTravelComponents.select, regionMenu);
    }

    const travelButton = this.createButton(
      "/player travel",
      "Travel",
      this.player.travel.traveling ? ButtonStyle.Danger : ButtonStyle.Success,
      "🗺️",
      (this.player.travel.destination ? false : true) || (this.player.travel.traveling ? true : false),
    );

    this.setComponentInRow(SearchRows.travel, SearchTravelButtonComponents.travel, travelButton);
  }

  loadReady() {
    this.embed.setColor(this.player.ready ? "#4bc97f" : "#c94b68");

    this.clearFields();

    this.addWhiteSpace();
    this.addFields(...this.player.location.playersFields.values());
    this.addWhiteSpace();

    const readyButton = this.createButton(
      "/player state select:ready",
      this.player.ready ? "Unready" : "Ready",
      this.player.ready ? ButtonStyle.Danger : ButtonStyle.Success,
      this.player.ready ? { name: "redcross", id: "758380151238033419" } : "✅",
    );

    this.setComponentInRow(ReadyRows.main, ReadyButtons.ready, readyButton);
  }

  loadVoteRound() {
    this.clearActionRows();
    this.updateVariables();

    if (this.player.game.round instanceof VoteRound) {
      const voteMenu = this.createSelectMenu(
        "/player vote select:",
        this.player.vote.player ? this.player.vote.player.name : "Vote for...",
        this.player.game.round.selections,
      );
  
      this.addActionRow(voteMenu);
    }

    const mapButton = this.createButton(
      "/map page:default",
      "Map",
      ButtonStyle.Secondary,
      { name: "string", id: "975968769174274078" },
    );

    this.addActionRow(mapButton);

    const inventoryButton = this.createButton(
      "/player inventory select:load",
      "Inventory",
      ButtonStyle.Primary,
      "🎒",
    );

    const activityButton = this.createButton(
      "/player activity",
      "Activity",
      this.player.location.activity ? ButtonStyle.Primary : ButtonStyle.Secondary,
      this.player.location.activity ? this.player.location.activity.emoji : "🔘",
      this.player.location.activity ? false : true,
    );

    const helpButton = this.createButton(
      "/help state:" + game.round.name,
      "Help",
      ButtonStyle.Secondary,
      "❔",
    );

    this.addActionRow(inventoryButton, activityButton, helpButton);
  }

  async loadVoteModal(interaction: CommandInteraction) {
    const textIn = new TextInputBuilder()
      .setStyle(TextInputStyle.Short)
      .setLabel(`You currently have ${this.player.inventory.tickets} tickets.`)
      .setRequired(true)
      .setCustomId("tickets")
      .setPlaceholder("How many tickets would you like to vote with?")
      .setMinLength(1)
      .setMaxLength(2)

    const rows: ActionRowBuilder<TextInputBuilder> = new ActionRowBuilder({ components: [textIn] });

    const modal = new ModalBuilder()
      .setTitle(`${VOTE_MESSAGES[Math.floor(Math.random() * VOTE_MESSAGES.length)]} ${this.player.vote.player?.name}`)
      .setCustomId("/player vote select:tickets")
      .addComponents(rows)

    await interaction.showModal(modal);
  }

  loadVoteUpdate() {
    this.updateVariables();

    if (this.player.game.round instanceof VoteRound) {
      const voteMenu = this.createSelectMenu(
        "/player vote select:",
        this.player.vote.player ? this.player.vote.player.name : "Vote for...",
        this.player.game.round.selections,
      );
  
      this.setComponentInRow(VoteRows.select, VoteSelectComponents.select, voteMenu);
    }
  }
}