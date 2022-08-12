import { ButtonStyle, CommandInteraction, EmbedBuilder, Snowflake } from "discord.js";
import { GameUI } from ".";
import { Player } from "../../player";

export class AlertUI extends GameUI {
  previous: GameUI;

  constructor(id: Snowflake, previous: GameUI) {
    super(id);
    this.previous = previous;
  }

  loadAlert(title: string, description: string) {
    this.embed = new EmbedBuilder()
      .setTitle(title === "" ? "Invalid title." : title)
      .setDescription(description === "" ? "Invalid description." : description);

    const cancelButton = this.createButton(
      "/player state select:cancel_alert",
      "Cancel",
      ButtonStyle.Danger,
      { name: "redcross", id: "758380151238033419" },
    );

    this.addActionRow(cancelButton);
  }
}