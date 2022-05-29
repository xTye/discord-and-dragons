import { Snowflake } from "discord.js";
import { UI } from ".";
import { Player } from "../../player";

export class ActivityUI extends UI {
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