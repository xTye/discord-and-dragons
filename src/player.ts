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

const DEFAULT_TICKETS = 1;

export const DEFAULT_DESCRIPTIONS = [
  "A noble knight who protects the weak",
  "A sneaky theif who gives to the poor",
  "A righteous lord who rules over the slums",
  "A commoner who shares the likes of many",
  "A hero who saves the day",
];

type Item = {
  item: GameItem,
  quantity: number,
}

class Inventory {
  private storedTickets: number;
  private spentTickets: number;
  private items: Collection<string, Item>;
  private selection?: Item;

  constructor(tickets?: number) {
    this.storedTickets = tickets ? tickets : DEFAULT_TICKETS;
    this.spentTickets = 0;
    this.items = new Collection<string, Item>();
  }

  selectItem(item: Item) {
    this.selection = item;
  }

  get getSelection() {
    return this.selection;
  }

  getItem(name: string) {
    return this.items.get(name);
  }

  addItem(newItem: GameItem, quantity?: number) {
    const item = this.items.get(newItem.name);

    if (item) {
      item.quantity += quantity ? quantity : 1;
    } else {
      this.items.set(newItem.name, { item: newItem, quantity: quantity ? quantity : 1 });
    }
  }

  async consumeItem(interaction: CommandInteraction, item: Item) {
    const usedItem = await item.item.use(interaction);

    if (usedItem) {
      item.quantity--;
      if (item.quantity <= 0)
        this.items.delete(item.item.name);
    }
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
  hud: GameHUD;
  activity?: GameActivity;
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
  votee?: Player;

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
    this.hud = new GameHUD(user.id, this);
    this.ready = false;
    this.inventory = new Inventory(tickets);
    this.stats = {
      travelMult: travelMult ? travelMult : 0,
      searchMult: searchMult ? searchMult : 0,
    };
    this.travel = {
      traveling: false,
      timer: new GameTimer(),
    };

    this.location.playerJoined(this);
  }

  readyUp(interaction: CommandInteraction) {
    this.ready = !this.ready;
    this.field.name = this.ready ? "Ready" : "Not Ready";

    if (this.ready)
      this.game.readyQueue.push(true);
    else
      this.game.readyQueue.pop();

    this.hud.loadReadyUp(interaction);
  }

  setDescription(interaction: CommandInteraction, description: string) {
    this.description = description;
    this.selection.description = description;
  }

  async selectItem(interaction: CommandInteraction, command: string) {
    const item = this.inventory.getItem(command);
    
    if (!item) {await interaction.reply({ content: "You do not currently have this item.", ephemeral: true }); return;}
    
    this.inventory.selectItem(item);
    this.hud.loadSelectItem(interaction);
  }

  async consumeItem(interaction: CommandInteraction) {
    const item = this.inventory.getSelection;
    if (!item) {interaction.reply({ content: "You must select a valid item to use.", ephemeral: true }); return;}

    this.inventory.consumeItem(interaction, item);
    this.hud.loadConsumeItem(interaction.replied ? undefined : interaction);
  }

  async kill() {
    await this.game.removePlayer(this);
    await this.user.roles.remove(PLAYER_ROLE_ID);
    await this.user.voice.setSuppressed(true);
  }

  async sync(interaction: CommandInteraction, voice: boolean, render?: boolean) {
    await this.hud.loadPlayerUI(interaction, render);
    
    if (voice)
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
   * @param interaction used for reply
   */
  beginTravel(interaction: CommandInteraction, dest: ConnectedRegion) {
    this.travel.traveling = true;
    
    this.location.playerLeft(this);
    this.move(dest.route.channel.id);
    this.location = dest.route;
    this.location.playerJoined(this);
    this.hud.loadTravel(interaction);

    this.travel.timer.startTimer(() => {
      this.location.playerLeft(this);

      this.move(dest.region.channel.id);
      this.location = dest.region;
      this.location.playerJoined(this);


      this.travel.destination = undefined;
      this.travel.traveling = false;
      this.hud.loadTravel();
    }, dest.route.getTravelTime(this.stats.travelMult));
  }

//# =========================================
//HEAD This is the vote section
//# =========================================

  setVotee(player: Player) {
    this.votee = player;
  }

  voteStart(dest: GameLocation, round: VoteRound) {
    this.travel.timer.stopTimer();
    if (this.activity) this.activity.leave(this.activity.players.get(this.user.id));


    if (this.game.mutedPlayers.get(this.user.id) && this.stats.muted)
      this.stats.muted.stopTimer();


    this.location.playerLeft(this);
    if (!this.move(dest.channel.id)) {this.kill(); return;}
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
    this.inventory.spendTickets = tickets;

    if (this.game.mutedPlayers.get(this.user.id)) {
      this.game.mutedPlayers.delete(this.user.id);

      if (!this.stats.muted)
        await this.user.voice.setSuppressed(false);
    }

    this.hud.loadVoteResults();
  }

  async lastWords() {
    if (this.stats.muted) {
      this.stats.muted.stopTimer();
      await this.user.voice.setSuppressed(false);
    }
  }
};
