import { CommandInteraction } from "discord.js";
import { GameActivity, PlayerActivityType } from ".";
import { game } from "..";
import { COMMANDS } from "../lib/commands";
import { DefaultTimer, time } from "../lib/conts";
import { TimerType, YesString } from "../lib/types";
import { GameLocation } from "../locations";
import { Player } from "../player";

const HOWTO_JOIN = "You can join the activity here by applying to participate as a helper or helpee";
const HOWTO_PLAY = `You have twenty seconds to choose to vote.\n
If both players choose to vote, then the helpee gets a powerup to check the tickets of anyone in the game anytime during the game.\n
Otherwise, the helpee gets their tickets shown to everyone currently in the room.`;

const NAME = "Sike Dilemma";
const DECIDE_TIME = time.twentySec;
const SAFE_START_TIME = DECIDE_TIME + time.fiveSec; 
const GIF = "https://i.pinimg.com/originals/f2/b1/31/f2b13170c4a9b0432af961694563cdb2.gif";
const EMOJI = "🙏";

export class SikeDilemma extends GameActivity {
  done: boolean;
  timer: TimerType;
  helper?: PlayerActivityType;
  helpee?: PlayerActivityType;

  constructor (location: GameLocation) {
    super(NAME, location, GIF, EMOJI);

    this.done = false;
    this.timer = DefaultTimer();
  }

  override newRound() {
    this.done = false;
    this.helper = undefined;
    this.helpee = undefined;
  }

  override async vote(interaction: CommandInteraction, x: PlayerActivityType, command: string) {
    if (command.toLowerCase() === "yes" || command === "y" || command === "1") {
      x.vote = true;
      //!await x.player.hud.sdfsdf
    }
  }

  override async update(interaction: CommandInteraction, player: Player, command: string) {
    if (game.timer.milliseconds <= SAFE_START_TIME) {await interaction.reply({ content: "Not enough time to commence the game.", ephemeral: true }); return;}
    if (this.done) {await interaction.reply({ content: "Game already commenced this round, please wait another round to play.", ephemeral: true }); return;}
    if (this.players.get(player.user.id)) {await interaction.reply({ content: "You are already a player in this game.", ephemeral: true }); return;}

    

    if (command === COMMANDS.ACTIVITY.SUBCOMMANDS.DO.JOIN) {
      if (this.helpee) { await interaction.reply("There is already a helpee in the game"); return; }
      this.helpee = this.join(player);
      //!await interaction.reply("You have joined the game as a helpee");
    }

    if (command === COMMANDS.ACTIVITY.SUBCOMMANDS.DO.ROCK) {
      if (this.helper) { await interaction.reply("There is already a helper in the game"); return; }
      this.helper = this.join(player);
      //!await interaction.reply("You have joined the game as a helper");
    }

    if (this.helpee && this.helper) {
      this.done = true;
      //!this.gameMessage();

      this.timer.timeout = setTimeout(async () => {
        let resolved = false;

        if (this.helpee?.vote && this.helper?.vote) {
          this.helpee.player.powerups.checktick += 1;
          resolved = true;
        }

        this.leave(this.helpee);
        this.leave(this.helper);

        if (resolved) return;

        // [...this.region.players].forEach(async ([key, player]) => {
        //   await player.hud.loadActivity({`<@${this.helpee?.player.user.id}> has \`${this.helpee?.player.vote.tickets}\` tickets remaining.`})
        // });

      }, DECIDE_TIME);
    }
  }

}
