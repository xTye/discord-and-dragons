import { CommandInteraction, EmbedBuilder } from "discord.js";
import { RegionActivity } from ".";
import { game } from "..";
import { time } from "../lib/conts";
import { Region } from "../locations/region";
import { Player } from "../player";

export enum JOIN { HELPEE, HELPER };
export const GIF = "https://i.pinimg.com/originals/f2/b1/31/f2b13170c4a9b0432af961694563cdb2.gif";
export const EMOJI = "🙏";

export class SikeDilemma extends RegionActivity {
  activity = {
    done: false,
    decideTimer: time.twentySec,
  }
  player1: Player | undefined = undefined;
  player2: Player | undefined = undefined;
  arrivedMessageString: string = `You can join the activity here by using the /region join <HELPEE or HELPER> command to participate in the activity.`;
  gameMessageString: string = `You have twenty seconds to choose to help <@${this.player1?.user.id}>. Submit your vote by using the command /region vote.\n
                              If both players choose to vote, then <@${this.player1?.user.id}> gets a powerup to check the tickets of anyone in the game anytime during the game.\n
                              Otherwise, <@${this.player1?.user.id}> gets their tickets shown to everyone currently in the room.`;

  constructor (region: Region) {
    super(region, GIF, EMOJI);
  }

  override newRound() {
    this.activity.done = false;
    this.player1 = undefined;
    this.player2 = undefined;
  }

  async joinGame(interaction: CommandInteraction, code: JOIN, player: Player) {
    if (game.timer.milliseconds <= time.thirtySec) { await interaction.reply("Not enough time to commence the game"); return; }
    if (this.activity.done) { await interaction.reply("Game already commenced this round, please wait another round to play"); return; }

    if (code === JOIN.HELPEE) {
      if (this.player1) { await interaction.reply("There is already a helpee in the game"); return; }

      this.player1 = player;
      this.player1.activity.active = true;

      await interaction.reply("You have joined the game as a helpee");
    }

    if (code === JOIN.HELPER) {
      if (this.player2) { await interaction.reply("There is already a helper in the game"); return; }

      this.player2 = player;
      this.player2.activity.active = true;
      
      await interaction.reply("You have joined the game as a helper");
    }

    if (this.player1 && this.player2) {
      this.startMiniGameTimer();
    }
  }

  async startMiniGameTimer() {
    if (!this.player1 || !this.player2) return;

    this.activity.done = true;
    
    this.player1.activity.active = true;
    this.player2.activity.active = true;
    await this.player1.user.voice.setMute(true);
    await this.player2.user.voice.setMute(true);
    //! DEPRECATED FIX LATER
    //this.gameMessage();

    setTimeout(async () => {
      if (!this.player1 || !this.player2) return;
      
      this.player1.activity.active = false;
      this.player2.activity.active = false;
      await this.player1.user.voice.setMute(false);
      await this.player2.user.voice.setMute(false);

      let resolved = false;

      if (this.player1.activity.teamDilemma && this.player2.activity.teamDilemma) {
        this.player1.powerups.checktick += 1;
        await this.player1.channel.send(`<@${this.player1.user.id}> recieved a check tickets powerup`);
        await this.player2.channel.send(`<@${this.player1.user.id}> recieved a check tickets powerup`);
        resolved = true;
      }

      this.player1.activity.teamDilemma = false;
      this.player2.activity.teamDilemma = false;

      if (resolved) return;

      [...this.region.players].forEach(async ([key, player]) => {
        await player.channel.send(`<@${this.player1?.user.id}> has \`${this.player1?.vote.tickets}\` tickets remaining.`)
      });

    }, this.activity.decideTimer);
  }
}
