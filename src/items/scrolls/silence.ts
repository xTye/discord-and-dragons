import { CommandInteraction } from "discord.js";
import { ScrollItem } from ".";
import { GameTimer } from "../../lib/timer";
import { Player } from "../../player";

const SILENCE_TIME = GameTimer.oneMin;

const NAME = "Silence";
const DESCRIPTION = `With great power comes the confinement of speech.\n\n
The mysteries of magic beckon the ability to speak. Use this almighty spell to mute
a fellow player to demolish chances of survival or help stupidity.`;
const PICTURE = "https://media.giphy.com/media/oM3TLGgymBlkKJDL6I/giphy.gif";
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
        if (this.victim.stats.muted) {await interaction.reply({ content: "This player is already muted.", ephemeral: true }); return;}

        this.victim.stats.muted = new GameTimer();
        await this.victim.user.voice.setSuppressed(true);
        await interaction.reply({ content: `${this.victim.name} is *silenced*`, ephemeral: true});
      
        this.victim.stats.muted.startTimer(async () => {
          
          if (this.player.stats.muted && this.victim) {
            await this.victim.user.voice.setSuppressed(false);
            this.player.stats.muted = undefined;
          }

        }, SILENCE_TIME);

        return this;
      },
    );
  }

  setVictim(player: Player) {
    this.victim = player;
  }
}