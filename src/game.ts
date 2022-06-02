import { playersCategory, PLAYER_ROLE_ID, CUSTOM_PLAYER_EMOJI } from "./lib/conts";
import { APIMessageComponentEmoji, ChannelType, Collection, CommandInteraction, GuildMember, PermissionFlagsBits, Snowflake, TextChannel } from "discord.js";
import { Player } from "./player";
import { Region } from "./locations/region";
import { Route } from "./locations/route";
import { GameLocation } from "./locations";
import { GameTimer } from "./lib/timer";
import { GameRound } from "./rounds/index";
import { SearchRound } from "./rounds/search";
import { VoteRound } from "./rounds/vote";
import { ReadyRound } from "./rounds/ready";
import { game } from ".";

export const MAX_PLAYERS = 8;
const MIN_PLAYERS_LEFT = 3;
const MAX_ROUNDS = 2;


export class Game {
  timer: GameTimer;
  started: boolean;
  round: GameRound;
  rounds: number;
  locationStart?: GameLocation;
  locationVote?: GameLocation;
  regions: Collection<Snowflake, Region>;
  routes: Collection<Snowflake, Route>;
  players: Collection<Snowflake, Player>;
  mutedPlayers: Collection<Snowflake, Player>;
  immunePlayers: Collection<Snowflake, Player>;

  constructor() {
    this.timer = new GameTimer();
    this.started = false;
    this.round = new ReadyRound(this);
    this.rounds = 0;
    this.regions = new Collection<Snowflake, Region>();
    this.routes = new Collection<Snowflake, Route>();
    this.players = new Collection<Snowflake, Player>();
    this.mutedPlayers = new Collection<Snowflake, Player>();
    this.immunePlayers = new Collection<Snowflake, Player>();
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

  start() {
    this.players.forEach((player, id) => {
      player.field.name = "___";
    });

    this.round = new SearchRound(this);

    this.newRound();
  }

  async newRound() {
    if (this.players.size <= MIN_PLAYERS_LEFT) {
      for (const [id, player] of this.players) {
        await player.hud.loadGameResults();
      };
      return;
    }

    this.rounds++;

    if (this.rounds % 2 == 1) {
      this.round = new SearchRound(game);
    } else if (this.rounds % 4 == 0) {
      this.round = new VoteRound(game, false);
    } else {
      this.round = new VoteRound(game, true);
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
      channel = await playersCategory.channel.children.create(`${name}s-hud`, {
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
      const ret = await user.guild.emojis.create(user.displayAvatarURL(), emojiName);
      emoji = { id: ret.id, name: emojiName };
    } catch (err) {
      console.log("Could not create custom emoji for " + name);
      return;
    }

    const player: Player = new Player(this, user, channel, emoji, this.locationStart);

    this.players.set(player.user.id, player);
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