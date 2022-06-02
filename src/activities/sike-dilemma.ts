import { CommandInteraction } from "discord.js";
import { GameActivity } from ".";
import { DetectTicketsScroll } from "../items/scrolls/detect-tickets";
import { COMMANDS } from "../lib/commands";
import { PLAYER_ROLE_ID } from "../lib/conts";
import { GameTimer } from "../lib/timer";
import { GameLocation } from "../locations";
import { Player } from "../player";

const HOWTO_JOIN = "You can join the activity here by applying to participate as a helper or helpee.";
const HOWTO_PLAY = `You have twenty seconds to choose to vote.\n
If both players choose to vote, then the helpee gets a powerup to check the tickets of anyone in the game anytime during the game.\n
Otherwise, the helpee gets their tickets shown to everyone currently in the room.`;

const NAME = "Sike Dilemma";
const DECIDE_TIME = GameTimer.twentySec;
const SAFE_START_TIME = DECIDE_TIME + GameTimer.fiveSec; 
const GIF = "https://i.pinimg.com/originals/f2/b1/31/f2b13170c4a9b0432af961694563cdb2.gif";
const EMOJI = "🙏";

export class SikeDilemma extends GameActivity {
  done: boolean;
  timer: GameTimer;
  helper?: Player;
  helpee?: Player;

  constructor (location: GameLocation) {
    super(NAME, location, GIF, EMOJI);

    this.done = false;
    this.timer = new GameTimer();
  }

  override newRound() {
    this.done = false;
    this.helper = undefined;
    this.helpee = undefined;
  }

  override async vote(interaction: CommandInteraction, x: PlayerActivityType, command: string) {
    if (command.toLowerCase() === "yes" || command === "y" || command === "1")
      x.vote = true;
    
      await x.player.hud.loadActivityUpdate(interaction);
  }

  override async update(interaction: CommandInteraction, player: Player, command: string) {
    if (player.game.round.timer.getMillis <= SAFE_START_TIME) {await interaction.reply({ content: "Not enough time to commence the game.", ephemeral: true }); return;}
    if (this.done) {await interaction.reply({ content: "Game already commenced this round, please wait another round to play.", ephemeral: true }); return;}
    

    if (command === COMMANDS.PLAYER.ACTIVITY.SELECT.LEAVE) {
      if (!this.players.get(player.user.id)) {await interaction.reply({ content: "You are already a player in this game.", ephemeral: true }); return;}
      this.leave(player);
      player.hud.loadActivity(interaction);
    }
    

    if (this.players.get(player.user.id)) {await interaction.reply({ content: "You are already a player in this game.", ephemeral: true }); return;}
    if (command === COMMANDS.PLAYER.ACTIVITY.SELECT.JOIN) {
      if (this.helpee) { await interaction.reply("There is already a helpee in the game"); return; }
      this.helpee = this.join(player, { vote: false });
      this.helpee.hud.loadActivityJoin(interaction);
    }

    if (command === COMMANDS.PLAYER.ACTIVITY.SELECT.ROCK) {
      if (this.helper) { await interaction.reply("There is already a helper in the game"); return; }
      this.helper = this.join(player, { vote: false });
      this.helper.hud.loadActivityJoin(interaction);
    }

    if (this.helpee && this.helper) {
      this.done = true;
      this.helpee.hud.loadActivityStart();
      this.helper.hud.loadActivityStart();

      this.timer.startTimer(() => {
        if (this.helpee && this.helper) {
          let resolved = false;
  
          if (this.helpee?.vote && this.helper?.vote) {
            this.helpee.inventory.addItem(new DetectTicketsScroll(this.helpee.player));
            this.helpee.hud.loadActivityEnd();
            resolved = true;
          }
  
          this.leave(this.helpee);
          this.leave(this.helper);
  
          if (resolved) return;
  
          this.location.players.forEach((otherPlayer, id) => {
            if (otherPlayer != this.helpee)
              otherPlayer.hud.loadActivityNotify();
          });
        } else {
          if (this.helpee) {
            this.leave(this.helpee);
            this.helpee.hud.loadActivityError();
          } else if (this.helper) {
            this.leave(this.helper);
            this.helper.hud.loadActivityError();
          }
        }

      }, DECIDE_TIME);
    }
  }

}
