import { CommandInteraction } from "discord.js";
import { ScrollItem } from ".";
import { GameTimer } from "../../lib/timer";
import { Player } from "../../player";

const SILENCE_TIME = GameTimer.oneMin;

const NAME = "Silence";
const ID = "silence";
const DESCRIPTION = `With great power comes the confinement of speech.\n\n
The mysteries of magic beckon the ability to speak. Use this almighty spell to mute
a fellow player to demolish chances of survival or help stupidity.`;
const PICTURE = "https://media.giphy.com/media/oM3TLGgymBlkKJDL6I/giphy.gif";
const EMOJI = { id: "980985746653610075", name: "scroll_fire", animated: true };
const TARGETABLE = true;

export class SilenceScroll extends ScrollItem {

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
        if (this.getTarget.stats.muted) {await player.hud.loadItemAlert("Silence", "This player is already muted."); return undefined;}

        this.getTarget.stats.muted = new GameTimer();
        await this.getTarget.user.voice.setSuppressed(true);
        await player.hud.loadItemAlert("Silence", `${this.getTarget.name} is *silenced*`);
        await this.getTarget.hud.loadAlert("Woosh", "You notice a mystic energy swirling around you as you start to be silenced.");

        this.getTarget.stats.muted.startTimer(async () => {
          
          if (this.getTarget && this.getTarget.stats.muted) {
            await this.getTarget.user.voice.setSuppressed(false);
            this.getTarget.stats.muted = undefined;
          }

        }, SILENCE_TIME);

        return this;
      },
    );
  }
}