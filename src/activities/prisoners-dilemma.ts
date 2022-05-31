import { GameActivity, PlayerActivityType } from ".";
import { GameTimer } from "../lib/timer";
import { GameLocation } from "../locations";
import { SilenceScroll } from "../items/scrolls/silence"

const HOWTO_JOIN = "You can join the activity here by idling in the room, with a random chance that you may be selected to participate.";
const HOWTO_PLAY = `You have twenty seconds to vote.\n
If both players choose to vote, then you both get muted in the voting round.\n
If either player chooses to vote and the other doesn't, then the player who selects yes gets a mute powerup (mute a player for a minute anytime during the game)\n
If both players don't vote, then a random person in the room gets the mute powerup`;

const NAME = "Prisoner's Dilemma";
const POP_CHANCE = 0.05;
const INCREMENT = GameTimer.thirtySec;
const DECIDE_TIME = GameTimer.twentySec;
const VOTE = false;
const GIF = "https://i.pinimg.com/originals/0c/4d/70/0c4d70bd5b56eaf1585d35fc09a2c44e.gif";
const EMOJI = "⚖️";

export class PrisonersDilemma extends GameActivity {
  popChance: number;
  done: boolean;
  timer: GameTimer;
  prisoner420?: PlayerActivityType;
  prisoner69?: PlayerActivityType;

  constructor(location: GameLocation) {
    super(NAME, location, GIF, EMOJI);

    this.popChance = POP_CHANCE;
    this.done = false;
    this.timer = new GameTimer();
  }

  /**
   * @description Timer for random occurences on the prisoners delimma game
   */
  override newRound() {
    this.done = false;
    this.prisoner420 = undefined;
    this.prisoner69 = undefined;
    this.popChance = POP_CHANCE;

    this.timer.customInterval(async () => {
      if (this.location.game.round.timer.getMillis <= GameTimer.thirtySec) { this.timer.stopInterval(); return; }
      if (Math.random() > this.popChance) { this.popChance *= 2; return; }

      const locPlayers = [...this.location.players.values()];
      if (locPlayers.length < 2) return;

      this.timer.stopInterval();
      this.done = true;

      this.prisoner420 = this.join(locPlayers.slice(Math.floor(Math.random() * locPlayers.length), 1)[0]);
      this.prisoner69 = this.join(locPlayers.slice(Math.floor(Math.random() * locPlayers.length), 1)[0]);

      this.prisoner420.player.hud.loadActivity();
      this.prisoner69.player.hud.loadActivity();
  
      this.startMiniGameTimer();
  
    }, INCREMENT);
  }

  startMiniGameTimer() {
    this.timer.startTimer(async () => {
      if (this.prisoner420 && this.prisoner69) {
        let resolved = false;

        this.prisoner420.player.setActivity();
        this.prisoner69.player.setActivity();

        if (this.prisoner420.vote && this.prisoner69.vote) {
          this.location.game.mutedPlayers.set(this.prisoner420.player.user.id, this.prisoner420.player);
          this.location.game.mutedPlayers.set(this.prisoner69.player.user.id, this.prisoner69.player);
          this.prisoner420.player.hud.loadActivity();
          this.prisoner69.player.hud.loadActivity();
          resolved = true;
        }
        else if (this.prisoner420.vote) {
          this.prisoner420.player.inventory.addItem(new SilenceScroll(this.prisoner420.player));
          this.prisoner420.player.hud.loadActivity();
          resolved = true;
        }
        else if (this.prisoner69.vote) {
          this.prisoner69.player.inventory.addItem(new SilenceScroll(this.prisoner420.player));
          this.prisoner69.player.hud.loadActivity();
          resolved = true;
        }

        if (resolved) return;

        const locPlayers = [...this.location.players.values()];
        const player = locPlayers[Math.floor(Math.random() * locPlayers.length)];
        if (!player) {console.log("Internal server error, maybe someone left?"); return;}
        player.inventory.addItem(new SilenceScroll(player));
        await player.hud.loadActivity();

      } else {

        if (this.prisoner420 && !this.prisoner69) {
          this.prisoner420.player.setActivity();
        } else if (!this.prisoner420 && this.prisoner69) {
          this.prisoner69.player.setActivity();
        }

        this.newRound();

      }
      
      this.prisoner420 = undefined;
      this.prisoner69 = undefined;

    }, DECIDE_TIME);
  }
}