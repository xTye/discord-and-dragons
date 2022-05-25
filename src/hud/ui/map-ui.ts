import { ButtonBuilder } from "@discordjs/builders";
import { ButtonStyle, CommandInteraction, Snowflake } from "discord.js";
import { UI } from ".";
import { game } from "../..";
import { COMMANDS } from "../../lib/commands";
import { REGION_NUM } from "../../lib/conts";
import { Region } from "../../locations/region";

export class mapUI extends UI {
  region: Region;
  page: number;

  constructor(id: Snowflake) {
    super(id);

    this.page = Math.floor(Math.random() * REGION_NUM);

    const isRegion = game.regions.at(this.page);
    this.region = isRegion ? isRegion : ;
  }

  override async load(command: string) {

    if (command === COMMANDS.MAP.SUBCOMMANDS.NEXT.NAME) this.page = (this.page + 1) % REGION_NUM;
    else this.page = (this.page - 1) % REGION_NUM;

    this.embed
      .setTitle(this.region.channel.name)
      .setDescription(this.region.description)
      .setImage(this.region.picture)

    const prevButton = this.createButton(
      "/map page:prev",
      "Prev",
      ButtonStyle.Primary,
      "◀️",
    )

    const travelButton = this.createButton(
      .setCustomId("/travel to location:" + this.map.region.channel.id)
      .setStyle(ButtonStyle.Success)
      .setLabel("Go")
      .setEmoji("🚶‍♀️")
      .setDisabled(game.state === GameStateType.READY ? true : false)

    const nextButton = this.createButton(
      .setCustomId("/map page:next")
      .setStyle(ButtonStyle.Primary)
      .setLabel("Next")
      .setEmoji("▶️")

    const cancelButton = this.createButton(
      .setCustomId("/hud")
      .setStyle(ButtonStyle.Danger)
      .setLabel("Cancel")
      .setEmoji("<:redcross:758380151238033419>")

    this.addActionRow(prevButton, travelButton, nextButton, cancelButton);

    return ;
  }
}