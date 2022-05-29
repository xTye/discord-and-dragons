import { CommandInteraction, Message, Snowflake } from "discord.js";
import { Player } from "../player";
import { UI } from "./ui";
import { MapUI } from "./ui/map";
import { PlayerUI } from "./ui/player";
import { HelpUI } from "./ui/help";
import { time } from "../lib/conts";
import { ActivityUI } from "./ui/activity";
import { PowerUpUI } from "./ui/powerup";

const TIMEOUT_BUFFER = time.threeSec;
 

export class HUD {
  id: Snowflake;
  pui: PlayerUI;
  aui?: ActivityUI;
  popui?: PowerUpUI;
  timeout?: NodeJS.Timeout;
  ui: UI;

  message: Message;

  constructor(id: Snowflake, player: Player) {
    this.id = id;
    this.pui = new PlayerUI(id, player);
    this.ui = this.pui;

    this.message = Message.prototype;
  }

  async render(interaction?: CommandInteraction) {
    if (interaction)
      await interaction.reply({ content: "Loading..." });
    
    this.message = await this.message.edit({ embeds: [this.ui.embed], components: [...this.ui.actionrows] });
    
    if (interaction)
      await interaction.deleteReply();
  }

  async loadPlayerUI(interaction?: CommandInteraction, render?: boolean) {
    if (this.timeout) {clearTimeout(this.timeout); this.timeout = undefined;}
    
    this.pui.load();

    if (render)
      this.ui = this.pui;

    if (this.ui === this.pui)
      if (interaction)
        await this.render(interaction);
      else
        await this.render();
  }

  async init() {
    this.message = await this.pui.player.channel.send({ content: `<@${this.pui.player.user.id}>` });
    this.ui.init();
    await this.message.edit({ embeds: [this.ui.embed], components: [...this.ui.actionrows] });
  }

  async loadMap(interaction: CommandInteraction, command: string) {
    if (!(this.ui instanceof MapUI))
      this.ui = new MapUI(this.id);

    this.ui.load(command);
    this.render(interaction);
  }

  async loadHelp(interaction: CommandInteraction) {
    this.ui = new HelpUI(this.id);
    this.ui.load();
    this.render(interaction);
  }

  async loadMoveError() {
    this.ui = new HelpUI(this.id);

    if (this.ui instanceof HelpUI)
      this.ui.loadSync();
    
    this.render();
  }

  async loadKill() {
    this.pui.kill();
    this.loadPlayerUI(undefined, true);
  }

  async playerReadyChangeEvent() {
    if (this.timeout) return;

    this.timeout = setTimeout(async () => {

      await this.loadPlayerUI();

    }, TIMEOUT_BUFFER + Math.floor(Math.random() * time.halfSec));
  }

  async searchRound() {
    this.pui.searchRound();
    await this.loadPlayerUI();
  }

  async loadTravel(interaction?: CommandInteraction) {
    await this.loadPlayerUI(interaction);
  }
}