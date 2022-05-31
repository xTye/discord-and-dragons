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
  private popui?: InventoryUI;

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
      if (!this.loading && !this.rendering && this.ui === this.pui) {
        this.rendering = true;
        this.pui.timers();
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

  async loadMoveError() {
    this.loading = true;
    this.ui = new HelpUI(this.id);

    if (this.ui instanceof HelpUI)
      this.ui.loadSync();

    this.render();
    this.loading = false;
  }

  loadKill(interaction?: CommandInteraction) {
    clearInterval(this.renderPUI);
    this.pui.kill();
    this.ui = this.pui;
    this.render(interaction);
  }

  async searchRound() {
    this.loading = true;
    this.pui.searchRound();
    this.loading = false;
  }

  async loadTravel(interaction?: CommandInteraction) {
    //await this.loadPlayerUI(interaction);
  }
}