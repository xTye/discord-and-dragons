import { CommandInteraction, EmbedBuilder } from "discord.js";
import { GameActivity, PlayerActivityType } from ".";
import { COMMANDS } from "../lib/commands";
import { convertTimer, DefaultTimer, INCREMENT_MILLIS, time } from "../lib/conts";
import { GameLocation } from "../locations";
import { Player } from "../player";

const HOWTO_JOIN = "You can join the activity here by throwing a line or throwing a rock";
const HOWTO_PLAY = `Sit back, relax, talk to your peers and watch your line`;

const NAME = "Fish";
const CATCH_CHANCE = 0.10;
const MAX_TICKETS = 3;
const FISH_TIME = time.thirtySec;
const ROCK_TIME = time.thirtySec;
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

  async arrivedMessage(player: Player) {
    const mes = new EmbedBuilder()
      .setDescription(`You can either fish for a ticket using the /region fish command or throw a rock using the /region rock command.`);
    
    await player.channel.send({ embeds: [mes] });
  }

  async fishCaughtMessage(player: Player) {
    const mes = new EmbedBuilder()
      .setDescription("You caught a fish!");
    
    await player.channel.send({ embeds: [mes] });
  }

  async throwRockMessage(player: Player) {
    const mes = new EmbedBuilder()
      .setDescription("You threw a rock");
    
    await player.channel.send({ embeds: [mes] });
  }

  override async update(interaction: CommandInteraction, player: Player, command: string) {
    if (command === COMMANDS.ACTIVITY.SUBCOMMANDS.DO.JOIN) {
      await this.fish(interaction, this.join(player, DefaultTimer()));
    } else if (command === COMMANDS.ACTIVITY.SUBCOMMANDS.DO.ROCK) {
      await this.rock(interaction, this.join(player, DefaultTimer()));
    } else {
      await interaction.reply({ content: "Not a valid command at this location.", ephemeral: true });
    }
  }




  private async fish(interaction: CommandInteraction, x: PlayerActivityType) {
    

    x.timer = convertTimer(FISH_TIME);
    await interaction.reply("You cast your line...");


    x.timer.interval = setInterval(async () => {
      if (x.timer) x.timer = convertTimer(x.timer.milliseconds - INCREMENT_MILLIS);
    }, INCREMENT_MILLIS);
    


    x.timer.timeout = setTimeout(async () => {
      clearInterval(x.timer?.interval);

      if (this.tickets === 0 || Math.random() > this.chance + this.chanceModifier) { 
        this.chanceModifier += 0.01;
        await x.player.channel.send("You caught nothing");
        return;
      }

      this.chanceModifier = 0;
      this.tickets -= 1;


      x.player.inventory.tickets += 1;

      //!await x.player.loadAct

      this.leave(x);
    }, FISH_TIME);
  }





  private async rock(interaction: CommandInteraction, x: PlayerActivityType) {
    let curModifier: number = 0;
  
    if (this.chance - CATCH_CHANCE >= 0) this.chance -= CATCH_CHANCE;
    else { 
      if (this.chanceModifier - CATCH_CHANCE >= 0) { curModifier = CATCH_CHANCE; this.chanceModifier -= CATCH_CHANCE; }
      else { curModifier = this.chanceModifier; this.chanceModifier -= curModifier; }
    }

    x.timer = convertTimer(ROCK_TIME);
    //!await interaction.reply("You have thrown a rock...");
    // [...this.location.players].forEach(async ([key, player]) => {
    //   await x.player.channel.send("Skadoosh...");
    // });


    x.timer.interval = setInterval(async () => {
      if (x.timer) x.timer = convertTimer(x.timer.milliseconds - INCREMENT_MILLIS);
    }, INCREMENT_MILLIS);



    x.timer.timeout = setTimeout(async () => {
      clearInterval(x.timer?.interval);

      this.chanceModifier += curModifier;
      this.chance += CATCH_CHANCE;

      //!await x.player.hud.activityDone

      this.leave(x);
    }, ROCK_TIME);
  }
}