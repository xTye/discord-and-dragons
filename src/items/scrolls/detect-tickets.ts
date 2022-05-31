import { CommandInteraction } from "discord.js";
import { ScrollItem } from ".";
import { Player } from "../../player";

const NAME = "Detect Tickets";
const DESCRIPTION = `The knowledge of power is more powerful than the power of democracy.\n
This scroll contains the secret of one's voting power. Use it wisely in a time of need or
waste its content and reap the consequences.`;
const PICTURE = "https://media.giphy.com/media/nkDllc3W0Y2de0A1mU/giphy.gif";
const EMOJI = { id: "980985746653610075", name: "scroll_fire", animated: true };

export class SilenceScroll extends ScrollItem {
  victim?: Player;

  constructor(player: Player) {
    super(
      player,
      NAME,
      DESCRIPTION,
      PICTURE,
      EMOJI,
      async (interaction: CommandInteraction) => {
        if (!this.victim) {await interaction.reply({ content: "Select a valid player for this spell.", ephemeral: true }); return;}
        await interaction.reply({ content: `<@${this.victim.user.id}> has **${this.victim.inventory.tickets}** tickets`, ephemeral: true});
        return this;
      },
    );
  }

  setVictim(player: Player) {
    this.victim = player;
  }
}