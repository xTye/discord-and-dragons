import { APIEmbedField, APIMessageComponentEmoji, APISelectMenuOption, CommandInteraction, GuildMember, Message, TextChannel } from "discord.js";
import { convertTimer, DefaultTimer, DEFAULT_DESCRIPTIONS, INCREMENT_MILLIS, PLAYER_ROLE_ID, POWERUP_MUTE_TIME } from "./lib/conts";
import { Game, GameStateType } from "./game";
import { ConnectedRegion, TimerType } from "./lib/types";
import { votes } from "./vote";
import { GameLocation } from "./locations";
import { game } from ".";
import { HUD } from "./hud";
import { GameActivity } from "./activities";

const DEFAULT_TICKETS = 1;

class Inventory {
  private storedTickets: number;
  private spentTickets: number;

  constructor(tickets?: number) {
    this.storedTickets = tickets ? tickets : DEFAULT_TICKETS;
    this.spentTickets = 0;
  }

  refundTickets() {
    this.spentTickets = 0;
  }

  submitTickets() {
    this.storedTickets = this.tickets;
    this.spentTickets = 0;
  }

  set spendTickets(tickets: number) {
    this.spendTickets += tickets;
  }

  set addTickets(tickets: number) {
    this.storedTickets += tickets;
  }

  get tickets() {
    return this.storedTickets - this.spentTickets;
  }
}

export class Player {
  game: Game;
  playerId: number;
  name: string;
  picture: string;
  user: GuildMember;
  channel: TextChannel;
  description: string;
  emoji: APIMessageComponentEmoji;
  selection: APISelectMenuOption;
  field: APIEmbedField;
  location: GameLocation;
  ready: boolean;
  hud: HUD;
  activity?: GameActivity;
  inventory: Inventory;
  stats: {
    travelMult: number,
    searchMult: number,
    muted: boolean,
  };
  travel: {
    destination?: ConnectedRegion;
    traveling: boolean;
    timer: TimerType;
  };

  constructor(
    game: Game,
    user: GuildMember,
    channel: TextChannel,
    emoji: APIMessageComponentEmoji,
    location: GameLocation,
    tickets?: number,
    travelMult?: number,
    searchMult?: number,
    ) {
    this.game = game;
    this.playerId = this.game.players.size + 1;
    this.name = user.nickname ? user.nickname : user.displayName;
    this.picture = user.displayAvatarURL();
    this.user = user;
    this.channel = channel;
    this.description = DEFAULT_DESCRIPTIONS[Math.floor(Math.random() * DEFAULT_DESCRIPTIONS.length)];
    this.emoji = emoji;
    this.selection = {
      value: user.id,
      label: this.name,
      description: this.description,
      emoji,
    }
    this.field = { name: "Not ready", value: `<:${emoji.name}:${emoji.id}><@${user.id}>` };
    this.location = location;
    this.hud = new HUD(user.id, this);
    this.ready = false;
    this.inventory = new Inventory(tickets);
    this.stats = {
      travelMult: travelMult ? travelMult : 0,
      searchMult: searchMult ? searchMult : 0,
      muted: false,
    };
    this.travel = {
      traveling: false,
      timer: DefaultTimer(),
    };

    this.location.playerJoined(this);
  }

  async readyUp(interaction: CommandInteraction) {
    this.ready = !this.ready;
    this.field.name = this.ready ? "Ready" : "Not Ready";

    if (this.ready)
      game.readyQueue.push(true);
    else
      game.readyQueue.pop();

    await this.hud.loadPlayerUI(interaction);
  }

  async kill() {
    game.players.delete(this.user.id);
    await this.user.roles.remove(PLAYER_ROLE_ID);
    await this.user.voice.setSuppressed(true);

    if (this.game.state === GameStateType.READY)
      await this.channel.delete();
  }

  async sync(interaction: CommandInteraction, voice: boolean, render?: boolean) {
    await this.hud.loadPlayerUI(interaction, render);
    
    if (voice)
      await this.move(this.location, true);
  }

  async move(dest: GameLocation, force?: boolean) {
    if (!force && this.location == dest) return true;

    try {
      await this.user.voice.setChannel(dest.channel.id);
    } catch (err) {
      console.log(this.name + " could not be moved.");
      await this.hud.loadMoveError();
      return false;
    }

    try {
      if (!this.stats.muted)
        await this.user.voice.setSuppressed(false);
    } catch (err) {
      console.log(this.name + " could not unsupressed.");
      await this.hud.loadMoveError();
      return true;
    }

    return true;
  }

  setActivity(activity?: GameActivity) {
    this.activity = activity;
  }

//# =========================================
//HEAD This is the travel section
//# =========================================

  setDestination(destination?: ConnectedRegion) {
    this.travel.destination = destination;
  }

  /**
   * Begins the travel on a player by checking possible 
   * 
   * @param destination id of channel
   * @param interaction used for reply
   */
  async beginTravel(interaction: CommandInteraction) {
    if (!this.travel.destination) {await interaction.reply({ content: "Select a place to travel to.", ephemeral: true }); return;}

    this.travel.traveling = true;
    
    this.location.playerLeft(this);
    await this.move(this.travel.destination.route);
    this.location = this.travel.destination.route;
    this.travel.timer = convertTimer(this.travel.timer.milliseconds = this.travel.destination.route.travelTime);
    this.location.playerJoined(this);

    await this.hud.loadPlayerUI(interaction);

    this.travel.timer.interval = setInterval(async () => {
      this.travel.timer = convertTimer(this.travel.timer.milliseconds - INCREMENT_MILLIS);
    }, INCREMENT_MILLIS);
  
    this.travel.timer.timeout = setTimeout(async () => {
      clearInterval(this.travel.timer.interval);

      if (!this.travel.destination) {await ; return;}-----

      this.location.playerLeft(this);
      await this.move(this.travel.destination.region);
      this.location = this.travel.destination.region;
      this.travel.timer = DefaultTimer();
      this.location.playerJoined(this);

      this.travel.destination = undefined;
      this.travel.traveling = false;
      await this.hud.loadTravel();
    }, this.travel.timer.milliseconds);
  }

//# =========================================
//HEAD This is the vote section
//# =========================================

  async voteStart(dest: GameLocation) {
    if (this.travel.timer.timeout) clearTimeout(this.travel.timer.timeout);
    if (this.travel.timer.interval) clearInterval(this.travel.timer.interval);
    if (this.activity) this.activity.leave(this.activity.players.get(this.user.id));


    this.location.playerLeft(this);
    if (!await this.move(dest)) {this.kill(); return;}
    this.location = dest;
    this.location.playerJoined(this);


    this.travel.destination = undefined;
    this.travel.timer = DefaultTimer();
    this.travel.traveling = false;

    this.inventory.refundTickets;
    await this.game.setPlayerVote(this);
  }

  async voteEnd(tickets: number, refund?: boolean) {

    if (!refund)
      this.inventory.submitTickets;
    this.inventory.refundTickets;
    this.inventory.spendTickets = tickets;

    if (this.game.vote.mutedPlayers.get(this.user.id)) {
      this.game.vote.mutedPlayers.delete(this.user.id);

      await this.user.voice.setSuppressed(false);
    }
  }

  async execVote(interaction: Message | CommandInteraction, votee: Player, numVotes: number) {
    
    const vote = votes.get(votee.user.id);
    if (!vote) {
      await interaction.reply("Not a valid id, please use `/vote list` command to list the users with ids");
      return;
    }

    const playerVotedOnVotee = vote.voters.get(this.user.id);
    if (!playerVotedOnVotee)
      vote.voters.set(this.user.id, numVotes);
    else
      vote.voters.set(this.user.id, numVotes + playerVotedOnVotee);
  
    this.inventory.spendTickets = numVotes;
  
    vote.numVotes += numVotes;
    
    await interaction.reply(`You have voted for <@${votee.user.id}> with ${numVotes} ticket(s).`);
  }

//# =========================================
//HEAD This is the powerup section
//# =========================================

  async popCheckTick(interaction: CommandInteraction, victim: Player) {
    if (this.powerups.checktick <= 0) { await interaction.reply("You do not have a check tickets powerup"); return; }

    this.powerups.checktick--;
    await interaction.reply(`<@${victim.user.id}> has **${victim.inventory.tickets}**`);
  }

  async popMute(interaction: CommandInteraction, victim: Player) {
    if (this.powerups.mute <= 0) { await interaction.reply("You do not have a mute powerup"); return; }

    this.powerups.mute--;
    await victim.user.voice.setSuppressed(true);

    setTimeout(async () => {
      await victim.user.voice.setSuppressed(false);
    }, POWERUP_MUTE_TIME);
  }
};
