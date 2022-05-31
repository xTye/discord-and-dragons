import { APISelectMenuOption } from "discord-api-types/v10";
import { APIMessageComponentEmoji, CommandInteraction } from "discord.js";
import { Player } from "../player";

export class GameItem {
  player: Player;
  name: string;
  description: string;
  picture: string;
  emoji: string | APIMessageComponentEmoji;
  selection: APISelectMenuOption;
  func?: (interaction: CommandInteraction) => Promise<GameItem | undefined>;

  constructor (
    player: Player,
    name: string,
    description: string,
    picture: string,
    emoji: APIMessageComponentEmoji,
    func?: (interaction: CommandInteraction, command?: string) => Promise<GameItem | undefined>,
    ) {
      this.player = player;
      this.name = name;
      this.description = description;
      this.picture = picture;
      this.emoji = emoji;
      this.selection = {
        value: this.name,
        label: this.name,
        description,
        emoji,
      }
      this.func = func;
  }

  async use(interaction: CommandInteraction) {
    if (!this.func) {await interaction.reply({ content: "This item cannot be consumed.", ephemeral: true }); return;}
    return await this.func(interaction);
  }
}