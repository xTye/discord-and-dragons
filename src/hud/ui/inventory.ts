import { Snowflake } from "discord.js";
import { GameUI } from ".";
import { Player } from "../../player";

export class InventoryUI extends GameUI {
  player: Player;

  constructor(id: Snowflake, player: Player) {
    super(id);
    
    this.player = player;
  }

  override load() {
    
  }
}