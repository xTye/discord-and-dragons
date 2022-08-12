import { playersCategory, PLAYER_ROLE_ID, CUSTOM_PLAYER_EMOJI } from "./lib/conts";
import { APIMessageComponentEmoji, APISelectMenuOption, ChannelType, Collection, CommandInteraction, GuildMember, PermissionFlagsBits, Snowflake, TextChannel } from "discord.js";
import { Player } from "./player";
import { Region } from "./locations/region";
import { Route } from "./locations/route";
import { GameLocation } from "./locations";
import { GameTimer } from "./lib/timer";
import { GameRound } from "./rounds/index";
import { SearchRound } from "./rounds/search";
import { VoteRound } from "./rounds/vote";
import { ReadyRound } from "./rounds/ready";


export const MAX_PLAYERS = 8;
const MIN_PLAYERS_LEFT = 0;
const MAX_ROUNDS = 4;

type GameEvent = {
  func: () => {};
  interaction?: CommandInteraction;
}


export class Game {
  loop?: NodeJS.Timer;
  looping: boolean;
  events: GameEvent[];
  timer: GameTimer;
  started: boolean;
  round: GameRound;
  rounds: number;
  locationStart?: GameLocation;
  locationVote?: GameLocation;
  readyQueue: Array<boolean>;
  regions: Collection<Snowflake, Region>;
  routes: Collection<Snowflake, Route>;
  players: Collection<Snowflake, Player>;
  mutedPlayers: Collection<Snowflake, Player>;
  immunePlayers: Collection<Snowflake, Player>;
  selections: APISelectMenuOption[];

  constructor() {
    this.looping = false;
    this.events = [];
    this.timer = new GameTimer();
    this.started = false;
    this.round = new ReadyRound(this);
    this.rounds = 0;
    this.readyQueue = new Array<boolean>();
    this.regions = new Collection<Snowflake, Region>();
    this.routes = new Collection<Snowflake, Route>();
    this.players = new Collection<Snowflake, Player>();
    this.mutedPlayers = new Collection<Snowflake, Player>();
    this.immunePlayers = new Collection<Snowflake, Player>();
    this.selections = [];
  }

  addRegion(region: Region, locationStart?: GameLocation, locationVote?: GameLocation) {
    this.regions.set(region.channel.id, region);

    if (locationStart) this.locationStart = locationStart;
    if (locationVote) this.locationVote = locationVote;
  }

  setLocationStart(locationsStart: GameLocation) {
    this.locationStart = locationsStart;
  }

  setLocationVote(locationVote: GameLocation) {
    this.locationVote = locationVote;
  }

  updatePlayerSelections() {
    this.selections = [];

    for (const [id, player] of this.players) {
      this.selections.push(player.selection);
    }
  }

  async removePlayer(player: Player) {
    this.players.delete(player.user.id);

    if (!this.started)
      await player.channel.delete();

    if (this.round instanceof VoteRound) {
      for (const [id, player] of this.players) {
       player.hud.loadVoteUpdate();
      }
    }
  }

  async start() {
    for (const [id, player] of this.players) {
      player.field.name = "___";
      player.hud.loadStart();
    }

    await this.newRound();

    this.started = true;
  }

  async newRound() {
    if (this.players.size <= MIN_PLAYERS_LEFT || this.rounds >= MAX_ROUNDS) {
      for (const [id, player] of this.players) {
        await player.hud.loadGameResults();
      };
      return;
    }

    this.rounds++;

    if (this.rounds % 2 == 1) {
      this.round = new SearchRound(this);
    } else if (this.rounds % 4 == 0) {
      this.round = new VoteRound(this, false);
    } else {
      this.round = new VoteRound(this, true);
    }

    await this.round.start();
    this.round.started = true;
  }


  /**
 * # ==========================================
 * HEAD Player joins a game.
 * # ==========================================
 * Function for joining a game. Create a new player object, and adds the instance to 
 * the current players in the game.
 * 
 * @param interaction interaction from command map
 * @param user user in guild
 */
  async joinGame(interaction: CommandInteraction, user: GuildMember) {
  
    if (!this.locationStart) { await interaction.reply({ content: "Set the game starting room.", ephemeral: true }); return; }
    const name = user.nickname ? user.nickname : user.displayName;

    try{
      await user.voice.setChannel(this.locationStart.channel.id);
    } catch (err) {
      console.log(name + " could not be moved.");
      await interaction.reply({ content: "Must be in a voice channel to play the game.", ephemeral: true });
      return;
    }

    let channel: TextChannel;

    try {
      channel = await playersCategory.channel.children.create({
        name: `${name}s-hud`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.CreateInstantInvite],
          },
          {
            id: user.guild.roles.everyone,
            deny: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.CreateInstantInvite],
          },
          {
            id: PLAYER_ROLE_ID,
            deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.CreateInstantInvite, PermissionFlagsBits.CreateInstantInvite], 
          },
        ],
    });
    } catch (err) {
      console.log("Could not setup player chanel correctly for " + name);
      return;
    }

    let emoji: APIMessageComponentEmoji;

    try {
      const emojiName = CUSTOM_PLAYER_EMOJI + '_' + user.id;
      const ret = await user.guild.emojis.create({ attachment: user.displayAvatarURL(), name: emojiName });
      emoji = { id: ret.id, name: emojiName };
    } catch (err) {
      console.log("Could not create custom emoji for " + name);
      return;
    }

    const player: Player = new Player(this, user, channel, emoji, this.locationStart);

    this.players.set(player.user.id, player);
    this.updatePlayerSelections();
    await player.user.roles.add(PLAYER_ROLE_ID);
    await player.hud.init();

    try{
      await player.user.voice.setSuppressed(false);
    } catch (err) {
      console.log(player.name + " could not unsupressed.");
      await player.hud.loadMoveError();
    }

    await interaction.reply({ content: "A new channel has been created for you, please use this channel for all things command related.", ephemeral: true });
    console.log(`${player.name} has joined the game.`);
  }
}