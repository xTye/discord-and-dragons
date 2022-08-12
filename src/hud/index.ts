import { CommandInteraction, Message, Snowflake } from "discord.js";
import { Player } from "../player";
import { MapUI } from "./ui/map";
import { PlayerUI } from "./ui/player";
import { HelpUI } from "./ui/help";
import { ActivityUI } from "./ui/activity";
import { InventoryUI } from "./ui/inventory";
import { AlertUI } from "./ui/alert";
import { GameUI } from "./ui";
import { GameTimer } from "../lib/timer";
import { Game } from "../game";
import { GameActivity } from "../activities";

const TIMEOUT_BUFFER = GameTimer.fiveSec;
 
export class GameHUD {
  loading: boolean;
  rendering: boolean;
  renderPUI?: NodeJS.Timer;
  id: Snowflake;
  private ui: GameUI;
  private pui: PlayerUI;
  private aui?: ActivityUI;

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
      this.pui.loadTimers();
      this.aui?.loadTimers();

      if (!this.loading && !this.rendering && (this.pui === this.ui || this.aui)) {
        this.rendering = true;
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
    this.render(interaction);
    this.loading = false;
  }

  loadStart() {
    this.loading = true;
    this.pui.loadStart();
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

  async loadReady() {
    this.loading = true;
    this.pui.loadReady();
    this.loading = false;
  }

  async loadModalDescription(interaction: CommandInteraction) {
    await this.pui.loadModalDescription(interaction);
  }

  async loadVoteModal(interaction: CommandInteraction) {
    await this.pui.loadVoteModal(interaction);
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

  async loadSetDestination() {
    this.loading = true;
    this.pui.loadSetDestination();
    await this.render();
    this.loading = false;
  }

  async loadMoveError() {
    this.loading = true;
    this.ui = new HelpUI(this.id);

    if (this.ui instanceof HelpUI)
      this.ui.loadSync();

    await this.render();
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

  //# PLEASE NOTE THAT AUI BECOMES UNDEFINED HERE
  async loadTraveling(interaction?: CommandInteraction) {
    this.loading = true;
    this.aui = undefined;
    this.pui.loadTraveling();
    await this.renderPlayerUI(interaction);
    this.loading = false;
  }

  //# PLEASE NOTE THAT AUI BECOMES UNDEFINED HERE
  async loadTraveled(interaction?: CommandInteraction) {
    this.loading = true;
    this.aui = undefined;
    this.pui.loadTraveled();
    await this.renderPlayerUI(interaction);
    this.loading = false;
  }

  async loadItemSelect(player: Player) {
    this.loading = true;
    if (!(this.ui instanceof InventoryUI))
      this.ui = new InventoryUI(this.id, player);
    
    this.ui.load();

    await this.render();
    this.loading = false;
  }

  async loadItemConsume() {
    this.loading = true;
    await this.renderPlayerUI();
    this.loading = false;
  }

  async loadCancelAlert()  {
    this.loading = true;
    if (this.ui instanceof AlertUI)
      this.ui = this.ui.previous;
    else
      this.ui = this.pui;
    
    await this.render();
    this.loading = false;
  }

  loadInventory() {
    this.loading = true;
    this.pui.updateVariables();
    this.loading = false;
  }


//# =================
//HEAD Events by game
//# =================

  async loadAlert(title: string, description: string, interaction?: CommandInteraction) {
    this.loading = true;
    this.ui = new AlertUI(this.id, this.ui);

    if (this.ui instanceof AlertUI)
      this.ui.loadAlert(title, description);

    await this.render(interaction);
    this.loading = false;
  }

  async loadItemAlert(title: string, description: string) {
    this.loading = true;
    this.ui = new AlertUI(this.id, this.pui);

    if (this.ui instanceof AlertUI)
      this.ui.loadAlert(title, description);

    await this.render();
    this.loading = false;
  }

  async loadRoundEnd() {
    this.loading = true;
    //this.pui.loadRoundEnd();
    await this.render();
    this.loading = false;
  }

  //# This will be implimented in the future, but for
  //# temporary push for a finish, the rounds will be
  //# called seperately.
  // async loadRoundStart() {
  //   this.loading = true;
  //   this.pui.loadRoundStart();
  //   await this.render();
  //   this.loading = false;
  // }

  async loadSearchRound() {
    this.loading = true;
    this.pui.loadSearchRound();
    await this.renderPlayerUI();
    this.loading = false;
  }

  async loadVoteRound() {
    this.loading = true;
    this.aui = undefined;
    this.pui.loadVoteRound();
    await this.renderPlayerUI();
    this.loading = false;
  }

  async loadVoteUpdate() {
    this.loading = true;
    this.pui.loadVoteUpdate();
    await this.render();
    this.loading = false;
  }

  async loadGameResults() {
    this.loading = true;
    //this.pui.loadGameResults();
    await this.render();
    this.loading = false;
  }

//# =====================
//HEAD Events by activity
//# =====================

  async loadActivityUI(player: Player, activity: GameActivity, interaction?: CommandInteraction) {
    this.loading = true;
    if (!this.aui)
      this.aui = new ActivityUI(this.id, player, activity);

    this.ui = this.aui;
    await this.render(interaction);
    this.loading = false;
  }

  async loadActivityUpdate(message: string | null, interaction?: CommandInteraction) {
    this.loading = true;
    if (this.aui) {
      this.aui.loadActivityUpdate(message);
      await this.render(interaction);
    }
    this.loading = false;
  }

  async loadActivityLeave(interaction?: CommandInteraction) {
    this.loading = true;
    this.aui?.loadActivityUpdate(null);
    await this.render(interaction);
    this.loading = false;
  }

  async loadActivityModal(player: Player, activity: GameActivity, interaction: CommandInteraction) {
    this.loading = true;
    if (this.aui)
      await this.aui.loadActivityModal(interaction);
    else {
      this.aui = new ActivityUI(this.id, player, activity);
      await this.aui.loadActivityModal(interaction);
    }
    this.loading = false;
  }

  async loadActivityForce(player: Player, activity: GameActivity, message: string) {
    this.loading = true;
    if (!this.aui)
      this.aui = new ActivityUI(this.id, player, activity);

    this.aui.loadActivityUpdate(message);
    this.ui = this.aui;
    await this.render();
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