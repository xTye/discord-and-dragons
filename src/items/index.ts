import { APISelectMenuOption } from "discord-api-types/v10";
import { APIMessageComponentEmoji, CommandInteraction } from "discord.js";
import { Player } from "../player";

export class GameItem {
  player: Player;
  name: string;
  id: string;
  description: string;
  picture: string;
  emoji: string | APIMessageComponentEmoji;
  selection: APISelectMenuOption;
  quantity: number;
  targetable: boolean;
  private target?: Player;
  func?: () => Promise<GameItem | undefined>;

  constructor (
    player: Player,
    name: string,
    id: string,
    description: string,
    picture: string,
    emoji: APIMessageComponentEmoji,
    targetable?: boolean,
    func?: (command?: string) => Promise<GameItem | undefined>,
    quantity?: number,
    ) {
      this.player = player;
      this.id = id;
      this.name = name;
      this.description = description;
      this.picture = picture;
      this.emoji = emoji;
      this.selection = {
        value: this.id,
        label: this.name,
        description: description.length > 47 ? description.substring(0, 46) : description,
        emoji,
      }
      this.targetable = targetable ? targetable : false;
      this.func = func;
      this.quantity = quantity ? quantity : 1;
  }

  async use() {
    if (this.func)
      return await this.func();

    return undefined;
  }

  get getEmoji() {
    if (typeof this.emoji === "string")
      return this.emoji;
    
    return `<${this.emoji.animated ? "a" : ""}:${this.emoji.name}:${this.emoji.id}>`
  }

  async setTarget(target?: Player) {
    this.target = target;

    await this.player.hud.loadItemSelect(this.player);
  }

  get getTarget() {
    return this.target;
  }
}