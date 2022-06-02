import { CommandInteraction, Message, Snowflake } from "discord.js";
import { Player } from "../player";
import { MapUI } from "./ui/map";
import { PlayerUI } from "./ui/player";
import { HelpUI } from "./ui/help";
import { ActivityUI } from "./ui/activity";
import { InventoryUI } from "./ui/inventory";
import { GameUI } from "./ui";
import { GameTimer } from "../lib/timer";
import { Game } from "../game";

const TIMEOUT_BUFFER = GameTimer.twoSec;
 
export class GameHUD {
  loading: boolean;
  rendering: boolean;
  renderPUI?: NodeJS.Timer;
  id: Snowflake;
  private ui: GameUI;
  private pui: PlayerUI;
  private aui?: ActivityUI;
  private iui?: InventoryUI;

  message: Message;

  constructor(id: Snowflake, player: Player) {
    this.loading = false;
    this.rendering = false;
    this.id = id;
    this.pui = new PlayerUI(id, player);
    this.ui = this.pui;
    this.message = Message.prototype;
  }

  stopAutoRender() {
    clearInterval(this.renderPUI);
  }

  async init() {
    this.message = await this.pui.player.channel.send({ content: `<@${this.pui.player.user.id}>` });
    this.ui.init();
    await this.message.edit({ embeds: [this.ui.embed], components: [...this.ui.actionrows] });

    this.renderPUI = setInterval(async () => {
      if (!this.loading && !this.rendering) {
        this.rendering = true;
        this.ui.loadTimers();
        this.message = await this.message.edit({ embeds: [this.ui.embed], components: [...this.ui.actionrows] });
        this.rendering = false;
      }
    }, TIMEOUT_BUFFER + Math.floor(Math.random() * GameTimer.halfSec));
  }

  async render(interaction?: CommandInteraction) {
    if (interaction)
      await interaction.reply({ content: "Loading..." });
    
    this.message = await this.message.edit({ embeds: [this.ui.embed], components: [...this.ui.actionrows] });
    
    if (interaction)
      await interaction.deleteReply();
  }

  async loadMap(interaction: CommandInteraction, command: string, game: Game) {
    this.loading = true;
    if (!(this.ui instanceof MapUI))
      this.ui = new MapUI(this.id, game);

    this.ui.load(command);
    this.render(interaction);
    this.loading = false;
  }

  async loadHelp(interaction: CommandInteraction) {
    this.loading = true;
    this.ui = new HelpUI(this.id);
    this.ui.load();
    this.render(interaction);
    this.loading = false;
  }

//# ===================
//HEAD Events by player
//# ===================

  async renderPlayerUI(interaction?: CommandInteraction) {
    this.loading = true;
    this.ui = this.pui;
    this.render(interaction);
    this.loading = false;
  }

  async loadReady(interaction: CommandInteraction) {
    this.loading = true;
    this.pui.load();
    this.render(interaction);
    this.loading = false;
  }

  async loadModalDescription() {
    this.loading = true;
    loadModal
    this.loading = false;
  }

  /**
   * This function is called in player setDescription and is not important
   * enough to make an API call on all of the players.
   * 
   * Therefore, it is not asynchronous.
   */
  loadSetDescription() {
    this.loading = true;
    this.pui.loadSetDescription();
    this.loading = false;
  }

  async loadMoveError() {
    this.loading = true;
    this.ui = new HelpUI(this.id);

    if (this.ui instanceof HelpUI)
      this.ui.loadSync();

    this.render();
    this.loading = false;
  }

  async loadPlayerKill(interaction?: CommandInteraction) {
    this.loading = true;
    clearInterval(this.renderPUI);
    this.pui.kill();
    this.ui = this.pui;
    await this.render(interaction);
    this.loading = false;
  }

  async searchRound() {
    this.loading = true;
    this.pui.searchRound();
    await this.render();
    this.loading = false;
  }

  async loadTravel(interaction?: CommandInteraction) {
    this.loading = true;
    //await this.loadPlayerUI(interaction);
    this.loading = false;
  }

  async loadItemSelect() {
    this.loading = true;
    this.loading = false;
  }

  async loadItemConsume(interaction?: CommandInteraction) {
    this.loading = true;
    this.loading = false;
  }


//# =================
//HEAD Events by game
//# =================

  async loadVoteUpdate() {
    this.loading = true;
    this.pui.loadVoteUpdate();
    await this.render();
    this.loading = false;
  }

  async loadRoundEnd() {
    this.loading = true;
    this.pui.loadRoundEnd();
    await this.render();
    this.loading = false;
  }

  async loadRoundStart() {
    this.loading = true;
    this.pui.loadRoundStart();
    await this.render();
    this.loading = false;
  }

  async loadRoundUpdate() {
    this.loading = true;
    this.pui.loadRoundUpdate();
    await this.render();
    this.loading = false;
  }

  async loadGameResults() {
    this.loading = true;
    this.pui.loadGameResults();
    await this.render();
    this.loading = false;
  }

//# =====================
//HEAD Events by activity
//# =====================

  async loadActivityUI() {
    this.loading = true;
    this
    this.loading = false;
  }

  async loadActivityUpdate(interaction?: CommandInteraction) {
    this.loading = true;
    if (this.aui) {
      this.aui.loadActivityUpdate();
      await this.render(interaction);
    }
    this.loading = false;
  }

  async loadActivityStart() {
    this.loading = true;
    if (this.aui) {
      this.aui.loadActivityStart();
      await this.render();
    }
    this.loading = false;
  }

  async loadActivityError() {
    this.loading = true;
    if (this.aui) {
      this.aui.loadActivityError();
      await this.render();
    }
    this.loading = false;
  }

  async loadActivityEnd() {
    this.loading = true;
    if (this.aui) {
      this.aui.loadActivityStart();
      await this.render();
    }
    this.loading = false;
  }

//# ===================
//HEAD Events by region
//# ===================


  /**
   * This function is called in region player joined and left
   * and is not meant to be rendered because it is not super important
   * to let players know when another player joins and leaves.
   * 
   * Therefore, it is not asynchronous.
   */
  loadRegionUpdate() {
    this.loading = true;
    this.pui.loadRegionUpdate();
    this.loading = false;
  }



}