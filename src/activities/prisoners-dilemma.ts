import { EmbedBuilder, StageChannel } from "discord.js";
import { RegionActivity } from "./activity";
import { COLOSSEUM, DefaultTimer, time } from "../lib/conts";
import { game } from "../game";
import { Player } from "../player";
import { Region } from "../region";

const ACTIVITY_CHANCE = 1.0;

export class PrisonersDilemma extends RegionActivity {
  activity = {
    popChance: ACTIVITY_CHANCE,
    done: false,
    timer: DefaultTimer,
    increment: time.thirtySec,
    decideTimer: time.twentySec,
  };
  player1: Player | undefined = undefined;
  player2: Player | undefined = undefined;
  arrivedMessageString: string = "You can join the activity here by idling in the room, with a random chance that you may be selected to participate.";
  gameMessageString: string = `If both players choose to vote, then you both get muted in the voting round.\n
  If either player chooses to vote and the other doesn't, then the player who selects yes gets a mute powerup (mute a player for a minute anytime during the game)\n
  If both players don't vote, then a random person in the room gets the mute powerup`;

  async arrivedMessage(player: Player) {
    const mes = new EmbedBuilder()
      .setDescription(this.arrivedMessageString);
    
    await player.channel.send({ embeds: [mes] });
  }

  async gameMessage() {
    const mes = new EmbedBuilder()
      .setDescription(this.gameMessageString);

    await this.player1?.channel.send({ content: `<@${this.player1.user.id}>` });
    await this.player1?.channel.send({ embeds: [mes] });
    await this.player2?.channel.send({ content: `<@${this.player2.user.id}>` });
    await this.player2?.channel.send({ embeds: [mes] });
  }

  /**
   * @description Timer for random occurences on the prisoners delimma game
   */
  override newRound() {
    this.activity.done = false;
    this.player1 = undefined;
    this.player2 = undefined;
    this.activity.popChance = ACTIVITY_CHANCE;

    this.activity.timer.interval = setInterval(async () => {
      if (game.timer.milliseconds <= time.thirtySec) { this.clearTimer; return; }
      if (Math.random() > this.activity.popChance) { this.activity.popChance *= 2; return; }
      
      const regPlayers = [...this.region.regPlayers.values()];
      if (regPlayers.length < 2) return;

      this.clearTimer();

      this.activity.done = true;
      this.player1 = regPlayers.splice(Math.floor(Math.random() * regPlayers.length), 1)[0];
      this.player2 = regPlayers.splice(Math.floor(Math.random() * regPlayers.length), 1)[0];
      this.player1.activity.active = true;
      this.player2.activity.active = true;
      await this.player1.user.voice.setMute(true);
      await this.player2.user.voice.setMute(true);
      await this.gameMessage();
  
      this.startMiniGameTimer();
  
    }, this.activity.increment)
  }

  startMiniGameTimer() {
    setTimeout(async () => {
      if (!this.player1 || !this.player2) return;

      this.player1.activity.active = false;
      this.player2.activity.active = false;
      await this.player1.user.voice.setMute(false);
      await this.player2.user.voice.setMute(false);

      let resolved = false;

      if (this.player1.activity.prisonDilemma && this.player2.activity.prisonDilemma) {
        this.player1.vote.muted = true;
        this.player2.vote.muted = true;
        await this.player1.channel.send(`You will both be muted this comming vote round.`);
        await this.player2.channel.send(`You will both be muted this comming vote round.`);
        resolved = true;
      }

      if (this.player1.activity.prisonDilemma) {
        this.player1.powerups.mute += 1;
        await this.player1.channel.send(`You have recieved a mute powerup`);
        await this.player2.channel.send(`You did not recieve a mute powerup`);
        resolved = true;
      }

      if (this.player2.activity.prisonDilemma) {
        this.player2.powerups.mute += 1;
        await this.player1.channel.send(`You did not recieve a mute powerup`);
        await this.player2.channel.send(`You have recieved a mute powerup`);
        resolved = true;
      }

      this.player1.activity.prisonDilemma = false;
      this.player2.activity.prisonDilemma = false;

      if (resolved) return;

      const player = [...this.region.regPlayers.values()].at(Math.floor(Math.random() * this.region.regPlayers.size));
      if (!player) { console.log("Internal server error, maybe someone joined?"); return; }
      player.powerups.mute += 1;
      if (player.user.id != this.player1.user.id) await this.player1.channel.send(`You did not recieve a mute powerup`);
      if (player.user.id != this.player2.user.id) await this.player2.channel.send(`You did not recieve a mute powerup`);
      await player.channel.send(`You have recieved a mute powerup`);
      
    }, this.activity.decideTimer);
  }

  clearTimer() {
    if (!this.activity.timer.interval) return;
    clearInterval(this.activity.timer.interval);
    this.activity.timer = DefaultTimer;
  }
}