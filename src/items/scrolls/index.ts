import { APIMessageComponentEmoji, CommandInteraction } from "discord.js";
import { Player } from "../../player";
import { GameItem } from "../index";

export class ScrollItem extends GameItem {
  constructor(
    player: Player,
    name: string,
    id: string,
    description: string,
    picture: string,
    emoji: APIMessageComponentEmoji,
    targetable: boolean,
    func: () => Promise<GameItem | undefined>,
    quantity?: number,
  ) {
    super(player, `${name} Scroll`, id, description, picture, emoji, targetable, func, quantity)
  }
}