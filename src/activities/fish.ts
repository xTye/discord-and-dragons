import { CommandInteraction, EmbedBuilder } from "discord.js";
import { GameActivity } from ".";
import { COMMANDS } from "../lib/commands";
import { GameTimer } from "../lib/timer";
import { GameLocation } from "../locations";
import { Player } from "../player";

const HOWTO_JOIN = "You can join the activity here by throwing a line or throwing a rock.";
const HOWTO_PLAY = "Sit back, relax, talk to your peers and watch your line.";

const NAME = "Fish or Rock";
const CATCH_CHANCE = 0.10;
const MAX_TICKETS = 3;
const FISH_TIME = GameTimer.thirtySec;
const ROCK_TIME = GameTimer.thirtySec;
const GIF = "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/0ab4b036812305.572a1cada9fdc.gif";
const COLOR = "#793F98";
const EMOJI = "🎣";
const SAFE_START_TIME = GameTimer.thirtySec;

export class Fish extends GameActivity {
  tickets: number;
  chance: number;
  chanceModifier: number;

  constructor(location: GameLocation) {
    super(NAME, location, HOWTO_JOIN, HOWTO_PLAY, GIF, COLOR, EMOJI, SAFE_START_TIME);

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
    this.tickets = this.generateRandomTickets(MAX_TICKETS);
  }

  override async update(interaction: CommandInteraction, player: Player, command: string) {
    if (command === COMMANDS.PLAYER.ACTIVITY.SELECT.JOIN) {
      await this.fish(interaction, this.join(player));
    } else if (command === COMMANDS.PLAYER.ACTIVITY.SELECT.ROCK) {
      await this.rock(interaction, this.join(player));
    } else {
      await interaction.reply({ content: "Not a valid command at this location.", ephemeral: true });
      return;
    }
  }




  private async fish(interaction: CommandInteraction, player: Player) {
    const timer = new GameTimer(FISH_TIME);
    this.join(player, { timer });

    await player.hud.loadActivityUpdate("You cast your line...", interaction);

    timer.startTimer(() => {
      let caught = false;

      if (this.tickets === 0 || Math.random() > this.chance + this.chanceModifier) { 
        this.chanceModifier += 0.05;
      } else {
        this.chanceModifier = 0;
        this.tickets -= 1;
        player.inventory.addTickets = 1;
        caught = true;
      }

      this.leave(player);
      player.hud.loadActivityUpdate(caught ? "Congrats, you catch a fish!" : "Not so lucky this time... Recast your line?");
    }, FISH_TIME);
  }





  private async rock(interaction: CommandInteraction, player: Player) {
    const timer = new GameTimer(ROCK_TIME);
    this.join(player, { timer });
    
    let curModifier: number = 0;
  
    if (this.chance - CATCH_CHANCE >= 0) this.chance -= CATCH_CHANCE;
    else { 
      if (this.chanceModifier - CATCH_CHANCE >= 0) { curModifier = CATCH_CHANCE; this.chanceModifier -= CATCH_CHANCE; }
      else { curModifier = this.chanceModifier; this.chanceModifier -= curModifier; }
    }

    await player.hud.loadActivityUpdate("You threw a rock...", interaction);

    for (const [id, otherPlayer] of this.location.players) {
      if (player != otherPlayer)
        otherPlayer.hud.loadAlert("Skadoosh", "You hear a rock skip across the water...\nThis fish scour in fear.");
    }


    timer.startTimer(() => {
      this.chanceModifier += curModifier;
      this.chance += CATCH_CHANCE;

      this.leave(player);
      player.hud.loadActivityUpdate(null);
    }, ROCK_TIME);
  }
}