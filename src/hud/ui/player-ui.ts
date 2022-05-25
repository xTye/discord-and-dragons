
import { ButtonBuilder } from "@discordjs/builders";
import { ButtonStyle, CommandInteraction, Snowflake } from "discord.js";
import { UI } from ".";
import { game } from "../..";
import { COMMANDS } from "../../lib/commands";
import { REGION_NUM } from "../../lib/conts";
import { Region } from "../../locations/region";

export class playerUI extends UI {


  override async load(command: string) {
    this.embed
      .setTitle(this.map.region.channel.name)
      .setDescription(this.map.region.description)
      .setImage(this.map.region.picture)

    const prevButton = this.createButton(
      "/map page:prev",
      "Prev",
      
      "◀️",
    )

    const travelButton = new ButtonBuilder()
      .setCustomId("/travel to location:" + this.map.region.channel.id)
      .setStyle(ButtonStyle.Success)
      .setLabel("Go")
      .setEmoji("🚶‍♀️")
      .setDisabled(game.state === GameStateType.READY ? true : false)

    const nextButton = new ButtonBuilder()
      .setCustomId("/map page:next")
      .setStyle(ButtonStyle.Primary)
      .setLabel("Next")
      .setEmoji("▶️")

    const cancelButton = new ButtonBuilder()
      .setCustomId("/hud")
      .setStyle(ButtonStyle.Danger)
      .setLabel("Cancel")
      .setEmoji("<:redcross:758380151238033419>")

    this.addActionRow(prevButton, travelButton, nextButton, cancelButton);

    return ;
  }
}