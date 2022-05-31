import { CommandInteraction } from "discord.js";
import { GameActivity, PlayerActivityType } from ".";
import { COMMANDS } from "../lib/commands";
import { GameTimer } from "../lib/timer";
import { GameLocation } from "../locations";
import { Player } from "../player";

const HOWTO_JOIN = "You can join the activity here by throwing a line or throwing a rock.";
const HOWTO_PLAY = `Sit back, relax, talk to your peers and watch your line.`;

const NAME = "Fish";
const CATCH_CHANCE = 0.10;
const MAX_TICKETS = 3;
const FISH_TIME = GameTimer.thirtySec;
const ROCK_TIME = GameTimer.thirtySec;
const GIF = "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/0ab4b036812305.572a1cada9fdc.gif";
const EMOJI = "🎣";

export class Fish extends GameActivity {
  tickets: number;
  chance: number;
  chanceModifier: number;

  constructor(region: GameLocation) {
    super(NAME, region, GIF, EMOJI);

    this.tickets = this.generateRandomTickets(MAX_TICKETS);
    this.chance = CATCH_CHANCE;
    this.chanceModifier = 0;
  }

  generateRandomTickets(tickets: number) {
    return Math.ceil(Math.random() * tickets);
  }

  override newRound() {
    this.chance = CATCH_CHANCE;
    this.chanceModifier = 0;
  }



  override async update(interaction: CommandInteraction, player: Player, command: string) {
    if (command === COMMANDS.PLAYER.ACTIVITY.SELECT.JOIN) {
      this.fish(interaction, this.join(player));
    } else if (command === COMMANDS.PLAYER.ACTIVITY.SELECT.ROCK) {
      this.rock(interaction, this.join(player));
    } else {
      await interaction.reply({ content: "Not a valid command at this location.", ephemeral: true });
    }
  }




  private fish(interaction: CommandInteraction, x: PlayerActivityType) {
    x.player.hud.loadActivity(interaction);
    
    x.timer.startTimer(() => {
      if (this.tickets === 0 || Math.random() > this.chance + this.chanceModifier) { 
        this.chanceModifier += 0.01;
      } else {
        this.chanceModifier = 0;
        this.tickets -= 1;
        x.player.inventory.addTickets = 1;
      }

      x.player.hud.loadActivityDone();

      this.leave(x);
    }, FISH_TIME);
  }





  private rock(interaction: CommandInteraction, x: PlayerActivityType) {
    let curModifier: number = 0;
  
    if (this.chance - CATCH_CHANCE >= 0) this.chance -= CATCH_CHANCE;
    else { 
      if (this.chanceModifier - CATCH_CHANCE >= 0) { curModifier = CATCH_CHANCE; this.chanceModifier -= CATCH_CHANCE; }
      else { curModifier = this.chanceModifier; this.chanceModifier -= curModifier; }
    }

    x.player.hud.loadActivity(interaction);
    this.location.players.forEach((player, id) => {
      x.player.hud.loadActivity();
    });


    x.timer.startTimer(() => {
      this.chanceModifier += curModifier;
      this.chance += CATCH_CHANCE;

      x.player.hud.loadActivityDone();

      this.leave(x);
    }, ROCK_TIME);
  }
}