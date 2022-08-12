import { CommandInteraction } from "discord.js";
import { GameActivity } from ".";
import { DetectTicketsScroll } from "../items/scrolls/detect-tickets";
import { COMMANDS } from "../lib/commands";
import { GameTimer } from "../lib/timer";
import { GameLocation } from "../locations";
import { Player } from "../player";

const HOWTO_JOIN = "You can join the activity here by applying to participate as a helper or helpee.";
const HOWTO_PLAY = `You have twenty seconds to choose to vote.\n
If both players choose to vote, then the helpee gets a powerup to check the tickets of anyone in the game anytime during the game.\n
Otherwise, the helpee gets their tickets shown to everyone currently in the room.\n\n
**If there are no helpee and helper buttons, you must wait until next search round to play again.**`;

const NAME = "Sike Dilemma";
const DECIDE_TIME = GameTimer.twentySec;
const GIF = "https://i.pinimg.com/originals/f2/b1/31/f2b13170c4a9b0432af961694563cdb2.gif";
const EMOJI = "🙏";
const COLOR = "#166643";
const SAFE_START_TIME = DECIDE_TIME + GameTimer.fiveSec; 

export class SikeDilemma extends GameActivity {
  timer: GameTimer;
  helper?: Player;
  helpee?: Player;

  constructor (location: GameLocation) {
    super(NAME, location, HOWTO_JOIN, HOWTO_PLAY, GIF, COLOR, EMOJI, SAFE_START_TIME);

    this.timer = new GameTimer();
    this.safeTime = SAFE_START_TIME;
  }

  override newRound() {
    this.done = false;
    this.helper = undefined;
    this.helpee = undefined;
  }

  override async vote(interaction: CommandInteraction, player: Player, command: string) {
    if (!player.active) {await interaction.reply({ content: "Not currently apart of an activity.", ephemeral: true }); return;}
    if (command.toLowerCase() === "yes" || command === "y" || command === "1") {
      player.active.vote = true;
      await player.hud.loadActivityUpdate("You have voted yes.", interaction);
    } else {
      await player.hud.loadActivityUpdate("You have voted no.", interaction);
    }
  }

  override async update(interaction: CommandInteraction, player: Player, command: string) {
    if (player.game.round.timer.getMillis <= SAFE_START_TIME) {await interaction.reply({ content: "Not enough time to commence the game.", ephemeral: true }); return;}
    if (this.done) {await interaction.reply({ content: "Game already commenced this round, please wait another round to play.", ephemeral: true }); return;}
    

    if (command === COMMANDS.PLAYER.ACTIVITY.SELECT.LEAVE) {
      if (player === this.helpee) this.helpee = undefined;
      if (player === this.helper) this.helper = undefined;
      this.leave(player);
      await player.hud.loadActivityLeave(interaction);
    }
    

    if (this.players.get(player.user.id)) {await interaction.reply({ content: "You are already a player in this game.", ephemeral: true }); return;}
    if (command === COMMANDS.PLAYER.ACTIVITY.SELECT.JOIN) {
      if (this.helpee) {await interaction.reply({ content: "There is already a helpee in the game", ephemeral: true }); return;}
      this.helpee = this.join(player, { vote: false });
      await this.helpee.hud.loadActivityUpdate("You have joined as the helpee.", interaction);
    }

    if (command === COMMANDS.PLAYER.ACTIVITY.SELECT.ROCK) {
      if (this.helper) {await interaction.reply({ content: "There is already a helper in the game", ephemeral: true }); return;}
      this.helper = this.join(player, { vote: false });
      await this.helper.hud.loadActivityUpdate("You have joined as the helper.", interaction);
    }

    if (this.helpee && this.helper) {
      this.done = true;
      await this.helpee.hud.loadActivityForce(this.helpee, this, "The game started, you can now vote.");
      await this.helper.hud.loadActivityForce(this.helper, this, "The game started, you can now vote.");

      this.timer.startTimer(async () => {
        if (this.helpee && this.helper) {
          let resolved = false;

          this.leave(this.helpee);
          this.leave(this.helper);
  
          if (this.helpee?.vote && this.helper?.vote) {
            this.helpee.inventory.addItem(new DetectTicketsScroll(this.helpee));
            await this.helpee.hud.loadActivityUpdate("You have recieved a detect tickets scroll.");
            await this.helper.hud.loadActivityUpdate(null);
            resolved = true;
          }
  
          if (resolved) return;
  
          for (const [id, otherPlayer] of this.location.players) {
            if (otherPlayer != this.helpee)
              await otherPlayer.hud.loadAlert("The game was lost.", `${this.helpee.name} has ${this.helpee.inventory.tickets} tickets.`);
          }

        } else {
          if (this.helpee) {
            this.leave(this.helpee);
            await this.helpee.hud.loadAlert("Uh oh", "Your opponent left, nothing happens.");
          } else if (this.helper) {
            this.leave(this.helper);
            await this.helper.hud.loadAlert("Uh oh", "Your opponent left, nothing happens.");
          }
        }

      }, DECIDE_TIME);
    }
  }

}
