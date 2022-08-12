import { CommandInteraction } from "discord.js";
import { ScrollItem } from ".";
import { Player } from "../../player";

const NAME = "Detect Tickets";
const ID = "detecttickets";
const DESCRIPTION = `The knowledge of power is more powerful than the power of democracy.\n
This scroll contains the secret of one's voting power. Use it wisely in a time of need or
waste its content and reap the consequences.`;
const PICTURE = "https://media.giphy.com/media/nkDllc3W0Y2de0A1mU/giphy.gif";
const EMOJI = { id: "980985746653610075", name: "scroll_fire", animated: true };
const TARGETABLE = true;

export class DetectTicketsScroll extends ScrollItem {

  constructor(player: Player) {
    super(
      player,
      NAME,
      ID,
      DESCRIPTION,
      PICTURE,
      EMOJI,
      TARGETABLE,
      async () => {
        if (!this.getTarget) return undefined;
        await player.hud.loadItemAlert("Detect Tickets", `<@${this.getTarget.user.id}> has **${this.getTarget.inventory.tickets}** tickets`);
        return this;
      },
    );
  }
}