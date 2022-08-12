import { GameActivity } from ".";
import { GameTimer } from "../lib/timer";
import { GameLocation } from "../locations";
import { SilenceScroll } from "../items/scrolls/silence"
import { Collection, CommandInteraction, Snowflake } from "discord.js";
import { Player } from "../player";

const HOWTO_JOIN = "You can join the activity here by idling in the room, with a random chance that you may be selected to participate.";
const HOWTO_PLAY = `You have twenty seconds to vote.\n
If both players choose to vote, then you both get muted in the voting round.\n
If either player chooses to vote and the other doesn't, then the player who selects yes gets a *silence scroll*\n
If both players don't vote, then a random person in the room gets the mute powerup`;

const NAME = "Prisoner's Dilemma";
const POP_CHANCE = 1;
const INCREMENT = GameTimer.thirtySec;
const DECIDE_TIME = GameTimer.twentySec;
const VOTE = false;
const GIF = "https://i.pinimg.com/originals/0c/4d/70/0c4d70bd5b56eaf1585d35fc09a2c44e.gif";
const EMOJI = "⚖️";
const COLOR = "#40A0BE";
const SAFE_START_TIME = GameTimer.thirtySec;

export class PrisonersDilemma extends GameActivity {
  popChance: number;
  timer: GameTimer;
  prisoner420?: Player;
  prisoner69?: Player;

  constructor(location: GameLocation) {
    super(NAME, location, HOWTO_JOIN, HOWTO_PLAY, GIF, COLOR, EMOJI, SAFE_START_TIME);

    this.popChance = POP_CHANCE;
    this.timer = new GameTimer();
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

      const locPlayers = new Collection<Snowflake, Player>(this.location.players)
      if (locPlayers.size < 2) return;

      const tempPlayer1 = locPlayers.random();
      if (!tempPlayer1) return;
      locPlayers.delete(tempPlayer1.user.id);
      const tempPlayer2 = locPlayers.random();
      if (!tempPlayer2) return;

      this.timer.stopInterval();
      this.done = true;

      this.prisoner420 = this.join(tempPlayer1, { vote: false });
      this.prisoner69 = this.join(tempPlayer2, { vote: false });

      await this.prisoner420.hud.loadActivityForce(this.prisoner420, this, "The game started, you can now vote.");
      await this.prisoner69.hud.loadActivityForce(this.prisoner69, this, "The game started, you can now vote.");
  
      this.startMiniGameTimer();
  
    }, INCREMENT);
  }

  startMiniGameTimer() {
    this.timer.startTimer(async () => {
      if (this.prisoner420 && this.prisoner69) {
        let resolved = false;

        const vote420 = this.prisoner420.active?.vote;
        const vote69 = this.prisoner69.active?.vote;

        this.leave(this.prisoner420);
        this.leave(this.prisoner69);

        if (vote420 && vote69) {
          this.location.game.mutedPlayers.set(this.prisoner420.user.id, this.prisoner420);
          this.location.game.mutedPlayers.set(this.prisoner69.user.id, this.prisoner69);
          await this.prisoner420.hud.loadActivityUpdate("Tough luck, you will be muted in the next vote round.");
          await this.prisoner69.hud.loadActivityUpdate("Tough luck, you will be muted in the next vote round.");
          resolved = true;
        }
        else if (vote420) {
          this.prisoner420.inventory.addItem(new SilenceScroll(this.prisoner420));
          await this.prisoner420.hud.loadActivityUpdate("Congrats, you have been granted a mute.");
          await this.prisoner69.hud.loadActivityUpdate(null);
          resolved = true;
        }
        else if (vote69) {
          this.prisoner69.inventory.addItem(new SilenceScroll(this.prisoner69));
          await this.prisoner69.hud.loadActivityUpdate("Congrats, you have been granted a mute.");
          await this.prisoner420.hud.loadActivityUpdate(null);
          resolved = true;
        }

        

        if (resolved) return;

        const locPlayers = [...this.location.players.values()];
        const player = locPlayers[Math.floor(Math.random() * locPlayers.length)];
        if (!player) {console.log("Internal server error, maybe someone left?"); return;}
        player.inventory.addItem(new SilenceScroll(player));
        await player.hud.loadActivityUpdate("Congrats, you have been granted a mute.");

      } else {
        if (this.prisoner420) {
          this.leave(this.prisoner420);
          await this.prisoner420.hud.loadAlert("Uh oh", "Your opponent left, nothing happens.");
        } else if (this.prisoner69) {
          this.leave(this.prisoner69);
          await this.prisoner69.hud.loadAlert("Uh oh", "Your opponent left, nothings happens.");
        }
        
        this.newRound();
      }

    }, DECIDE_TIME);
  }
}