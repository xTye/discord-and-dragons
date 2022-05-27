
import { APIEmbedField, APISelectMenuOption, ButtonStyle, EmbedBuilder, SelectMenuBuilder } from "discord.js";
import { UI } from ".";
import { game } from "../..";
import region from "../../commands/region";
import { LAIR_PIC, LAIR_PIC_EMBED, MAP } from "../../lib/conts";
import { GameStateType } from "../../lib/types";
import { Region } from "../../locations/region";
import { Player } from "../../player";

enum Row { main = 0 }
enum ReadyButtons { map = 0, ready, start }

export class playerUI extends UI {
  player: Player;
  location: {
    players: APIEmbedField[];
  };
  travel: {
    selections: APISelectMenuOption[];
    selection?: APISelectMenuOption;
  };

  constructor(id: string, player: Player) {
    super(id);
    this.player = player;
    this.location = {
      players: [],
    };
    this.travel = {
      selections: [],
    };

    this.loadTravelSelections();
  }

  loadTravelSelections() {
    this.travel.selections = [];
    
    if (this.player.location instanceof Region) {
      [...this.player.location.travRegions].forEach(([id, region]) => {
        this.travel.selections.push(region.selection.toJSON())
      });
    }
  }

  loadRegionPlayersReady() {
    this.location.players = [];

    [...this.player.location.players].forEach(([id, player]) => {
      this.location.players.push({ name: player.ready ? "Ready" : "Not Ready", value: `<@${player.user.id}>`, inline: true });
    });
  }

  override init() {
    this.embed = new EmbedBuilder()
      .setTitle(`Hey, ${this.player.name}`)
      .setColor("#c94b68")
      .setDescription(`Welcome to the game! Here is a list of people who are also in the lobby.`)
      .setAuthor({ name: `Tickets: ${this.player.vote.tickets}`, iconURL: this.player.user.displayAvatarURL()})
      .setThumbnail(MAP)
      .setImage(LAIR_PIC_EMBED)
      .setFooter({ text: `Time: ${this.player.travel.timer.minutes}:${this.player.travel.timer.seconds < 10 ? "0" + this.player.travel.timer.seconds : this.player.travel.timer.seconds}`, iconURL: LAIR_PIC })
      .setTimestamp(new Date());

    this.addWhiteSpace();
    this.loadRegionPlayersReady();
    this.embed.addFields(this.location.players);
    this.addWhiteSpace();

    const mapButton = this.createButton(
      "/map page:default",
      "Map",
      ButtonStyle.Primary,
      { name: "string", id: "975968769174274078" }
    );

    const readyButton = this.createButton(
      "/player ready",
      "Ready",
      ButtonStyle.Success,
      "✅"
    );

    const startButton = this.createButton(
      "/start",
      "Start",
      ButtonStyle.Secondary,
      "🧠"
    );

    this.addActionRow(mapButton, readyButton, startButton);
  }

  updateVariables() {
    this.embed.setAuthor({ name: `Tickets: ${this.player.vote.tickets}`, iconURL: this.player.user.displayAvatarURL()})
      .setFooter({ text: `Time: ${this.player.travel.timer.minutes}:${this.player.travel.timer.seconds < 10 ? "0" + this.player.travel.timer.seconds : this.player.travel.timer.seconds}`, iconURL: LAIR_PIC })
      .setTimestamp(new Date());
  }

  searchRound() {
    this.clearActionRows();
    this.updateVariables();

    this.embed.setTitle(`Search Phase`)
      .setColor("#4b8ec9")
      .setDescription(`Welcome to the game! Here is a list of people who are also in the lobby.`)
      .setAuthor({ name: `Tickets: ${this.player.vote.tickets}`, iconURL: this.player.user.displayAvatarURL()})
      .setThumbnail(MAP)
      .setImage(LAIR_PIC_EMBED);

    this.addWhiteSpace();

    const mapButton = this.createButton(
      "/map page:default",
      "Map",
      ButtonStyle.Primary,
      { name: "string", id: "975968769174274078" }
    );

    const readyButton = this.createButton(
      "/travel to:",
      "Ready",
      ButtonStyle.Success,
      "✅"
    );

    const startButton = this.createButton(
      "/start",
      "Start",
      ButtonStyle.Secondary,
      "🧠"
    );

    this.addActionRow(mapButton, readyButton, startButton);
  
    let menu: SelectMenuBuilder | undefined;

    if (this.player.location instanceof Region) {
      menu = this.createSelectMenu(
        "/travel to:",
        this.travel.selections,
      );
    }

    if (menu) this.addActionRow(menu);
  }

  override load() {
    this.updateVariables();

    if (game.state === GameStateType.READY) {
      this.embed.setColor(this.player.ready ? "#4bc97f" : "#c94b68");
      
      this.clearFields();

      this.addWhiteSpace();
      this.loadRegionPlayersReady();
      this.embed.addFields(this.location.players);
      this.addWhiteSpace();

      const readyButton = this.createButton(
        "/player ready",
        this.player.ready ? "Unready" : "Ready",
        this.player.ready ? ButtonStyle.Danger : ButtonStyle.Success,
        this.player.ready ? { name: "redcross", id: "758380151238033419" } : "✅",
      );

      this.setComponentInRow(Row.main, ReadyButtons.ready, readyButton);
    }
  }
}