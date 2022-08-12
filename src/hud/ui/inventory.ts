import { ButtonStyle, Snowflake } from "discord.js";
import { GameUI } from ".";
import { Player } from "../../player";

export class InventoryUI extends GameUI {
  player: Player;

  constructor(id: Snowflake, player: Player) {
    super(id);
    
    this.player = player;
  }

  override load() {
    this.clearActionRows();
    
    if (!this.player.inventory.getSelect) {
      this.embed.setTitle("Select an item")
      .setDescription(null)
      .setThumbnail(null)
    } else {
      this.embed.setTitle(this.player.inventory.getSelect.name)
        .setDescription(`Quantity - ${this.player.inventory.getSelect.quantity}\n${this.player.inventory.getSelect.description}`)
        .setThumbnail(this.player.inventory.getSelect.picture);
    }

    if (this.player.inventory.getSelections.length > 0 && !this.player.inventory.getSelect) {
      const itemMenu = this.createSelectMenu(
        "/player inventory select:",
        this.player.inventory.getSelections.length > 0 ? "Item..." : "You have no items...",
        this.player.inventory.getSelections,
      );
  
      this.addActionRow(itemMenu);
    } else if (this.player.inventory.getSelect && this.player.inventory.getSelect?.targetable) {
      const targetMenu = this.createSelectMenu(
        "/player inventory select:",
        this.player.inventory.getSelect.getTarget ? this.player.inventory.getSelect.getTarget.name : "Select a target...",
        this.player.game.selections,
      );
  
      this.addActionRow(targetMenu);
    }

    const consumeButton = this.createButton(
      "/player inventory",
      "Consume",
      ButtonStyle.Primary,
      "💥",
      (this.player.inventory.getSelections.length <= 0) || (this.player.inventory.getSelect === undefined || (this.player.inventory.getSelect.targetable) && !this.player.inventory.getSelect.getTarget),
    );

    const deselectButton = this.createButton(
      "/player inventory select:deselect",
      "Deselect",
      ButtonStyle.Secondary,
      "↩️",
      this.player.inventory.getSelect === undefined,
    );

    const cancelButton = this.createButton(
      "/player state select:sync_message",
      "Cancel",
      ButtonStyle.Danger,
      { name: "redcross", id: "758380151238033419" },
    )

    this.addActionRow(consumeButton, deselectButton, cancelButton);
  }
}