import { CommandInteraction, StageChannel, EmbedBuilder } from "discord.js";
import { RegionActivity } from "./activity";
import { COLOSSEUM, convertTimer, DefaultTimer, INCREMENT_MILLIS, time } from "../lib/conts";
import { Player } from "../player";
import { Region } from "../region";

const ACTIVITY_CHANCE = 0.10;
const MAX_TICKETS = 3;

export class Fish extends RegionActivity {
  tickets: number;
  activity = {
    chance: ACTIVITY_CHANCE,
    chanceModifier: 0,
    doneTimer: time.thirtySec,
  }

  constructor(region: Region) {
    super(region)

    this.tickets = this.generateRandomTickets(MAX_TICKETS);
  }

  generateRandomTickets(tickets: number) {
    return Math.ceil(Math.random() * tickets);
  }

  override newRound() {
    this.activity.chance = ACTIVITY_CHANCE;
    this.activity.chanceModifier = 0;
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

  async fish(interaction: CommandInteraction, player: Player) {
    player.activity.active = true;
    player.activity.timer = convertTimer(this.activity.doneTimer);
    await interaction.reply("You cast your line...");

    player.activity.timer.interval = setInterval(async () => {
      player.activity.timer = convertTimer(player.activity.timer.milliseconds - INCREMENT_MILLIS);
    }, INCREMENT_MILLIS);
    
    player.activity.timer.timeout = setTimeout(async () => {
      if (player.activity.timer.interval) clearInterval(player.activity.timer.interval);

      player.activity.active = false;
      player.activity.timer = DefaultTimer;

      if (this.tickets === 0 || Math.random() > this.activity.chance + this.activity.chanceModifier) { 
        this.activity.chanceModifier += 0.01;
        await player.channel.send("You caught nothing");
        return;
      }

      this.activity.chanceModifier = 0;
      this.tickets -= 1;
      player.vote.tickets += 1;
      await this.fishCaughtMessage(player);
      
    }, this.activity.doneTimer);
  }

  async throwRock(interaction: CommandInteraction, player: Player) {
    let curModifier: number = 0;
    if (this.activity.chance - ACTIVITY_CHANCE >= 0) this.activity.chance -= ACTIVITY_CHANCE;
    else { 
      if (this.activity.chanceModifier - ACTIVITY_CHANCE >= 0) { curModifier = ACTIVITY_CHANCE; this.activity.chanceModifier -= ACTIVITY_CHANCE; }
      else { curModifier = this.activity.chanceModifier; this.activity.chanceModifier -= curModifier; }
    }
    player.activity.active = true;
    player.activity.timer = convertTimer(this.activity.doneTimer);
    await interaction.reply("You have thrown a rock...");

    [...this.region.regPlayers].forEach(async ([key, player]) => {
      await player.channel.send("Skadoosh...");
    });

    player.activity.timer.interval = setInterval(async () => {
      player.activity.timer = convertTimer(player.activity.timer.milliseconds - INCREMENT_MILLIS);
    }, INCREMENT_MILLIS);

    player.activity.timer.timeout = setTimeout(async () => {
      if (player.activity.timer.interval) clearInterval(player.activity.timer.interval);

      this.activity.chanceModifier += curModifier;
      this.activity.chance += ACTIVITY_CHANCE;
      player.activity.active = false;
      player.activity.timer = DefaultTimer;

    }, this.activity.doneTimer);
  }
}