import { APIMessageComponentEmoji, CommandInteraction } from "discord.js";
import { Player } from "../../player";
import { GameItem } from "../index";

export class ScrollItem extends GameItem {
  constructor(
    player: Player,
    name: string,
    description: string,
    picture: string,
    emoji: APIMessageComponentEmoji,
    func: (interaction: CommandInteraction) => Promise<GameItem | undefined>, 
  ) {
    super(player, `${name} Scroll`, description, picture, emoji, func)
  }
}