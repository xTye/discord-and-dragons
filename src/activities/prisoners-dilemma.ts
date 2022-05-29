import { GameActivity } from ".";
import { game } from "..";
import { DefaultTimer, Shuffle, time } from "../lib/conts";
import { TimerType } from "../lib/types";
import { GameLocation } from "../locations";
import { Player } from "../player";

const HOWTO_JOIN: string = "You can join the activity here by idling in the room, with a random chance that you may be selected to participate.";
const HOWTO_PLAY: string = `If both players choose to vote, then you both get muted in the voting round.\n
If either player chooses to vote and the other doesn't, then the player who selects yes gets a mute powerup (mute a player for a minute anytime during the game)\n
If both players don't vote, then a random person in the room gets the mute powerup`;

const POP_CHANCE = 0.05;
const INCREMENT = time.thirtySec;
const DECIDE_TIME = time.twentySec;
const VOTE = false;
const GIF = "https://i.pinimg.com/originals/0c/4d/70/0c4d70bd5b56eaf1585d35fc09a2c44e.gif";
const EMOJI = "⚖️";

export class PrisonersDilemma extends GameActivity {
  popChance: number;
  done: boolean;
  timer: TimerType;
  prisoner420?: {
    player: Player;
    vote: boolean;
  };
  prisoner69?: {
    player: Player;
    vote: boolean;
  };

  constructor(
    location: GameLocation) {
    super(location, GIF, EMOJI);

    this.popChance = POP_CHANCE;
    this.done = false;
    this.timer = DefaultTimer();
  }

  /**
   * @description Timer for random occurences on the prisoners delimma game
   */
  override newRound() {
    this.done = false;
    this.prisoner420 = undefined;
    this.prisoner69 = undefined;
    this.popChance = POP_CHANCE;

    this.timer.interval = setInterval(async () => {
      if (game.timer.milliseconds <= time.thirtySec) { this.clearTimer; return; }
      if (Math.random() > this.popChance) { this.popChance *= 2; return; }

      const locPlayers = [...this.location.players.values()];
      if (locPlayers.length < 2) return;

      this.clearTimer();
      this.done = true;

      Shuffle(locPlayers);
      
      this.prisoner420 = {
        player: locPlayers[0],
        vote: VOTE,
      };
      this.prisoner69 = {
        player: locPlayers[1],
        vote: VOTE,
      }

      this.prisoner420.player.setActivity(this);
      this.prisoner69.player.setActivity(this);

      //! DEPRECATED UPDATE HUD
      //await this.gameMessage();
  
      this.startMiniGameTimer();
  
    }, INCREMENT);
  }

  startMiniGameTimer() {
    setTimeout(async () => {
      if (!this.prisoner420 || !this.prisoner69) return;

      this.prisoner420.player.setActivity();
      this.prisoner69.player.setActivity();

      let resolved = false;

      if (this.prisoner420.vote && this.prisoner69.vote) {
        this.prisoner420.player.vote.muted = true;
        this.prisoner69.player.vote.muted = true;
        await this.prisoner420.player.channel.send(`You will both be muted this comming vote round.`);
        await this.prisoner69.player.channel.send(`You will both be muted this comming vote round.`);
        resolved = true;
      }

      if (this.prisoner420.vote) {
        this.prisoner420.player.powerups.mute += 1;
        await this.prisoner420.player.channel.send(`You have recieved a mute powerup`);
        await this.prisoner69.player.channel.send(`You did not recieve a mute powerup`);
        resolved = true;
      }

      if (this.prisoner69.vote) {
        this.prisoner69.player.powerups.mute += 1;
        await this.prisoner420.player.channel.send(`You did not recieve a mute powerup`);
        await this.prisoner69.player.channel.send(`You have recieved a mute powerup`);
        resolved = true;
      }

      if (resolved) return;

      this.prisoner420 = undefined;
      this.prisoner69 = undefined;

      const locPlayers = [...this.location.players.values()];
      const player = locPlayers[Math.floor(Math.random() * locPlayers.length)];
      if (!player) { console.log("Internal server error, maybe someone left?"); return; }
      player.powerups.mute += 1;
      if (player.user.id != this.prisoner420.player.user.id) await this.prisoner420.player.channel.send(`You did not recieve a mute powerup`);
      if (player.user.id != this.prisoner69.player.user.id) await this.prisoner69.player.channel.send(`You did not recieve a mute powerup`);
      await player.channel.send(`You have recieved a mute powerup`);
      
    }, DECIDE_TIME);
  }

  clearTimer() {
    if (!this.timer.interval) return;
    clearInterval(this.timer.interval);
    this.timer = DefaultTimer;
  }
}