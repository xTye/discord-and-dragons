import { CommandInteraction, Message, Snowflake } from "discord.js";
import { Player } from "../player";
import { UI } from "./ui";
import { mapUI } from "./ui/map-ui";
import { playerUI } from "./ui/player-ui";
import { time } from "../lib/conts";

const TIMEOUT_BUFFER = time.threeSec;

export class HUD {
  id: Snowflake;
  pui: playerUI;
  timeout?: NodeJS.Timeout;
  ui: UI;

  message: Message;

  constructor(id: Snowflake, player: Player) {
    this.id = id;
    this.pui = new playerUI(id, player);
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
    this.ui.init();
    this.message = await this.pui.player.channel.send({ embeds: [this.ui.embed], components: [...this.ui.actionrows] });
  }

  async loadMap(interaction: CommandInteraction, command: string) {
    if (!(this.ui instanceof mapUI))
      this.ui = new mapUI(this.id);

    this.ui.load(command);
    this.render(interaction);
  }

  async playerReadyChangeEvent() {
    if (this.timeout) return;

    this.timeout = setTimeout(async () => {
      
      this.timeout = undefined;
      this.loadPlayerUI();

    }, TIMEOUT_BUFFER + Math.floor(Math.random() * time.halfSec));
  }

  async searchRound() {

  }
}