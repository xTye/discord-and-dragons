import { Snowflake } from "discord.js";
import { GameUI } from ".";
import { Player } from "../../player";

export class ActivityUI extends GameUI {
  player: Player;

  constructor(id: Snowflake, player: Player) {
    super(id);
    
    this.player = player;
  }

  override load() {
    if (this.player.activity) {
      
    }
  }
}