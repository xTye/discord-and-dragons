import { APIEmbedField, APIMessageComponentEmoji, APISelectMenuOption, Collection, CommandInteraction, GuildMember, ReactionUserManager, Snowflake, TextChannel } from "discord.js";
import { PLAYER_ROLE_ID } from "./lib/conts";
import { Game } from "./game";
import { GameLocation } from "./locations";
import { GameActivity } from "./activities";
import { GameHUD } from "./hud";
import { GameTimer } from "./lib/timer";
import { ConnectedRegion } from "./locations/region";
import { VoteRound } from "./rounds/vote";
import { GameItem } from "./items";
import player from "./commands/player";

const DEFAULT_TICKETS = 1;

export const DEFAULT_DESCRIPTIONS = [
  "A noble knight who protects the weak",
  "A sneaky theif who gives to the poor",
  "A righteous lord who rules over the slums",
  "A commoner who shares the likes of many",
  "A hero who saves the day",
];

class Inventory {
  private player: Player;
  private storedTickets: number;
  private spentTickets: number;
  private ui: string;
  private items: Collection<string, GameItem>;
  private select?: GameItem;
  private selections: APISelectMenuOption[];

  constructor(player: Player, tickets?: number) {
    this.player = player
    this.storedTickets = tickets ? tickets : DEFAULT_TICKETS;
    this.spentTickets = 0;
    this.items = new Collection<string, GameItem>();
    this.selections = [];

    this.ui = `<a:ticket:981815976838447115> - ${this.tickets}\n`;
  }

  get getSelect() {return this.select;}

  get getUI() {return `**Inventory:**\n${this.ui}`;}

  get getSelections() {return this.selections;}

  updateUI() {
    this.selections = [];
    this.ui = `<a:ticket:981815976838447115> - ${this.tickets}\n`;

    for (const [name, item] of this.items) {
      this.ui += `${item.getEmoji} - ${item.quantity}\n`;
      this.selections.push(item.selection);
    }

    this.player.hud.loadInventory();
  }

  getItem(id: string) {
    return this.items.get(id);
  }

  async setItem(item?: GameItem) {
    this.select = item;

    this.player.hud.loadItemSelect(this.player);
  }

  addItem(newItem: GameItem, quantity?: number) {
    const item = this.items.get(newItem.id);

    if (item) {
      item.quantity += quantity ? quantity : 1;
    } else {
      this.items.set(newItem.id, newItem);
    }

    this.updateUI();
  }

  async consumeItem(item: GameItem) {
    this.select = undefined;

    const usedItem = item.use();
    if (usedItem === undefined) return;

    item.quantity--;
    if (item.quantity <= 0)
      this.items.delete(item.id);

    this.updateUI();
  }

  refundTickets() {
    this.spentTickets = 0;
  }

  submitTickets() {
    this.storedTickets = this.tickets;
    this.spentTickets = 0;

    this.updateUI();
  }

  set spendTickets(tickets: number) {
    this.spentTickets += tickets;

    this.updateUI();
  }

  set addTickets(tickets: number) {
    this.storedTickets += tickets;

    this.updateUI();
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
  hud: GameHUD;
  inventory: Inventory;
  stats: {
    travelMult: number;
    searchMult: number;
    muted?: GameTimer;
  };
  travel: {
    destination?: ConnectedRegion;
    traveling: boolean;
    timer: GameTimer;
  };
  vote: {
    player?: Player;
    tickets?: number;
  };
  active?: {
    activity: GameActivity;
    timer?: GameTimer;
    vote?: boolean;
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
    this.field = { name: "Not ready", value: `<:${emoji.name}:${emoji.id}><@${user.id}> - ${this.description}` };
    this.location = location;
    this.hud = new GameHUD(user.id, this);
    this.ready = false;
    this.inventory = new Inventory(this, tickets);
    this.stats = {
      travelMult: travelMult ? travelMult : 0,
      searchMult: searchMult ? searchMult : 0,
    };
    this.travel = {
      traveling: false,
      timer: new GameTimer(),
    };
    this.vote = {}

    this.location.playerJoined(this);
  }

  async readyUp() {
    this.ready = !this.ready;
    this.field.name = this.ready ? "Ready" : "Not Ready";

    if (this.ready)
      this.game.readyQueue.push(true);
    else
      this.game.readyQueue.pop();

    for (const [id, player] of this.game.players) {
      player.hud.loadReady();
    }

    await this.hud.render();
  }

  async setDescription(description: string) {
    const cut = description.length > 46 ? `${description.substring(0, 46)}..` : description;
    this.description = cut;
    this.selection.description = cut;

    this.field = { name: this.ready ? "Ready" : "Not Ready", value: `<:${this.emoji.name}:${this.emoji.id}><@${this.user.id}> - ${this.description}` }
    this.location.playersFields.set(this.user.id, this.field);

    this.game.updatePlayerSelections();

    for (const [id, player] of this.game.players) {
      player.hud.loadSetDescription();
    }

    await this.hud.render();
  }

  async kill() {
    await this.game.removePlayer(this);
    this.game.updatePlayerSelections();
    await this.user.roles.remove(PLAYER_ROLE_ID);
    await this.user.voice.setSuppressed(true);
    await this.hud.loadPlayerKill();
  }

  async syncMessage(interaction: CommandInteraction) {
    await this.hud.renderPlayerUI(interaction);
  }

  async syncVoice() {
    await this.move(this.location.channel.id, true);
  }

  async move(dest: Snowflake, force?: boolean) {
    if (!force && this.location.channel.id == dest) return true;

    try {
      await this.user.voice.setChannel(dest);
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

  setActivity(active?: { activity: GameActivity, timer?: GameTimer, vote?: boolean }) {
    if (this.active?.timer)
      this.active.timer.stopTimer();
    
    this.active = active;
  }

//# =========================================
//HEAD This is the travel section
//# =========================================

  async setDestination(destination?: ConnectedRegion) {
    this.travel.destination = destination;

    await this.hud.loadSetDestination();
  }

  /**
   * Begins the travel on a player by checking possible 
   * 
   * @param interaction used for reply
   */
  async beginTravel(interaction: CommandInteraction, dest: ConnectedRegion) {
    this.travel.traveling = true;
    
    this.location.playerLeft(this);
    await this.move(dest.route.channel.id);
    this.location = dest.route;
    this.location.playerJoined(this);
    await this.hud.loadTraveling(interaction);

    this.travel.timer.startTimer(async () => {
      this.location.playerLeft(this);

      await this.move(dest.region.channel.id);
      this.location = dest.region;
      this.location.playerJoined(this);


      this.travel.destination = undefined;
      this.travel.traveling = false;
      await this.hud.loadTraveled();
    }, dest.route.getTravelTime(this.stats.travelMult));
  }

//# =========================================
//HEAD This is the vote section
//# =========================================

  async setVotePlayer(interaction: CommandInteraction, player: Player) {
    this.vote.player = player;

    await this.hud.loadVoteModal(interaction);
  }

  setVoteTickets(tickets?: number) {
    this.vote.tickets = tickets;
  }

  async voteStart(dest: GameLocation, round: VoteRound) {
    this.travel.timer.stopTimer();
    if (this.active) this.active.activity.leave(this);


    if (this.game.mutedPlayers.get(this.user.id) && this.stats.muted)
      this.stats.muted.stopTimer();


    this.location.playerLeft(this);
    if (!await this.move(dest.channel.id)) {this.kill(); return;}
    this.location = dest;
    this.location.playerJoined(this);


    this.travel.destination = undefined;
    this.travel.timer = new GameTimer();
    this.travel.traveling = false;

    this.inventory.refundTickets;
    round.initPlayer(this);
  }

  async voteEnd(tickets: number, refund?: boolean) {
    if (!refund)
      this.inventory.submitTickets;

    this.inventory.refundTickets;
    this.inventory.addTickets = tickets;

    if (this.game.mutedPlayers.get(this.user.id)) {
      this.game.mutedPlayers.delete(this.user.id);

      if (!this.stats.muted)
        await this.user.voice.setSuppressed(false);
    }

    await this.hud.loadRoundEnd();
  }

  async lastWords() {
    if (this.stats.muted) {
      this.stats.muted.stopTimer();
      this.stats.muted = undefined;
      await this.user.voice.setSuppressed(false);
    }
  }
};
