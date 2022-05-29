import { ButtonStyle, Snowflake } from "discord.js";
import { UI } from ".";
import { game } from "../..";
import { COMMANDS } from "../../lib/commands";
import { REGION_NUM } from "../../lib/conts";
import { Region } from "../../locations/region";

enum Row { navigate = 0 }
enum Buttons { prev = 0, go, next, back }

export class MapUI extends UI {
  region?: Region;
  page: number;

  constructor(id: Snowflake) {
    super(id);
    this.page = Math.floor(Math.random() * REGION_NUM);
    this.setRegion();

    if (this.region) {
      const prevButton = this.createButton(
        "/map page:prev",
        "Prev",
        ButtonStyle.Primary,
        "◀️",
      )

      const nextButton = this.createButton(
        "/map page:next",
        "Next",
        ButtonStyle.Primary,
        "▶️",
      )

      const cancelButton = this.createButton(
        "/player sync",
        "Cancel",
        ButtonStyle.Danger,
        { name: "redcross", id: "758380151238033419" },
      )

      this.addActionRow(prevButton, nextButton, cancelButton);
    }
  }

  handlePage(command: string) {
    if (command === COMMANDS.MAP.SUBCOMMANDS.DEFAULT.NAME) this.page = Math.floor(Math.random() * REGION_NUM);
    else if (command === COMMANDS.MAP.SUBCOMMANDS.NEXT.NAME) this.page = (this.page + 1) % REGION_NUM;
    else this.page = (this.page - 1) % REGION_NUM;
  }

  setRegion() {
    this.region = game.regions.at(this.page);
  }

  override async load(command: string) {
    this.handlePage(command);
    this.setRegion();

    if (this.region) {
      this.embed
        .setTitle(this.region.channel.name)
        .setDescription(this.region.description)
        .setImage(this.region.picture)
    }
  }
}