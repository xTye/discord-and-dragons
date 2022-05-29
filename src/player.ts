import { APIEmbedField, APIMessageComponentEmoji, APISelectMenuOption, ChannelType, CommandInteraction, Emoji, GuildEmoji, GuildMember, Message, PermissionFlagsBits, TextChannel } from "discord.js";
import { convertTimer, CUSTOM_PLAYER_EMOJI, DefaultTimer, DEFAULT_DESCRIPTIONS, INCREMENT_MILLIS, playersCategory, PLAYER_ROLE_ID, POWERUP_MUTE_TIME } from "./lib/conts";
import { Game } from "./game";
import { ConnectedRegion, GameStateType, TimerType } from "./lib/types";
import { votes } from "./vote";
import { GameLocation } from "./locations";
import { game } from ".";
import { HUD } from "./hud";
import { GameActivity } from "./activities";
import { SelectMenuOptionBuilder } from "@discordjs/builders";

export class Player {
  game: Game;
  playerId: number;
  name: string;
  picture: string;
  user: GuildMember;
  channel: TextChannel;
  description: string;
  emoji: APIMessageComponentEmoji;
  selection: SelectMenuOptionBuilder;
  field: APIEmbedField;
  location: GameLocation;
  ready: boolean;
  hud: HUD;
  activity?: GameActivity;
  stats: {
    travelMult: number,
    searchMult: number,
  };
  travel: {
    destination?: ConnectedRegion;
    traveling: boolean;
    timer: TimerType;
  };
  vote: {
    tickets: number;
    spentTickets: number;
    immunity: boolean;
    muted: boolean;
  };
  powerups: {
    mute: number,
    checktick: number;
  }

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
    this.selection = new SelectMenuOptionBuilder()
      .setValue(user.id)
      .setLabel(this.name)
      .setDescription(this.description)
      .setEmoji(emoji);
    this.field = { name: "Not ready", value: `<:${emoji.name}:${emoji.id}><@${user.id}>` };
    this.location = location;
    this.hud = new HUD(user.id, this);
    this.ready = false;
    this.stats = {
      travelMult: travelMult ? travelMult : 0,
      searchMult: searchMult ? searchMult : 0,
    };
    this.travel = {
      traveling: false,
      timer: DefaultTimer(),
    };
    this.vote = {
      immunity: false,
      muted: false,
      tickets: tickets ? tickets : 1,
      spentTickets: 0,
    };
    this.powerups = {
      mute: 0,
      checktick: 0,
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

    if (game.state === GameStateType.READY)
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
      await this.user.voice.setSuppressed(false);
    } catch (err) {
      console.log(this.name + " could not unsupressed.");
      await this.hud.loadMoveError();
      return true;
    }

    return true;
  }

  async voteMove(dest: GameLocation) {
    this.location.playerLeft(this);

    if (!await this.move(dest)) {this.kill(); return;}

    if (this.travel.timer.timeout) clearTimeout(this.travel.timer.timeout);
    if (this.travel.timer.interval) clearInterval(this.travel.timer.interval);
    if (this.activity) this.activity.leave(this.activity.players.get(this.user.id));
    this.travel.destination = undefined;
    this.travel.timer = DefaultTimer();
    this.travel.traveling = false;

    this.location = dest;
    this.location.playerJoined(this);
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

    await this.move(this.travel.destination.route);

    this.location.playerLeft(this);
    this.location = this.travel.destination.route;
    this.travel.timer.milliseconds = this.travel.destination.route.travelTime;
    this.travel.timer = convertTimer(this.travel.timer.milliseconds);
    this.travel.traveling = true;
    this.location.playerJoined(this);

    await this.hud.loadPlayerUI(interaction);

    this.travel.timer.interval = setInterval(async () => {
      this.travel.timer = convertTimer(this.travel.timer.milliseconds - INCREMENT_MILLIS);
    }, INCREMENT_MILLIS);
  
    this.travel.timer.timeout = setTimeout(async () => {
      clearInterval(this.travel.timer.interval);

      if (!this.travel.destination) {await interaction.reply({ content: "Internal game error, try joining the help voice channel and clicking sync in the help channel.", ephemeral: true }); return;}

      this.location.playerLeft(this);
      this.location = this.travel.destination.region;
      this.travel.timer = DefaultTimer();
      this.travel.traveling = false;
      this.travel.destination = undefined;
      this.location.playerJoined(this);

      await this.hud.loadTravel();
    }, this.travel.timer.milliseconds);
  }

//# =========================================
//HEAD This is the vote section
//# =========================================

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
  
    this.vote.spentTickets += numVotes;
  
    vote.numVotes += numVotes;
    
    await interaction.reply(`You have voted for <@${votee.user.id}> with ${numVotes} ticket(s).`);
  }

//# =========================================
//HEAD This is the powerup section
//# =========================================

  async popCheckTick(interaction: CommandInteraction, victim: Player) {
    if (this.powerups.checktick <= 0) { await interaction.reply("You do not have a check tickets powerup"); return; }

    this.powerups.checktick--;
    await interaction.reply(`<@${victim.user.id}> has **${victim.vote.tickets}**`);
  }

  async popMute(interaction: CommandInteraction, victim: Player) {
    if (this.powerups.mute <= 0) { await interaction.reply("You do not have a mute powerup"); return; }

    this.powerups.mute--;
    await victim.user.voice.setMute(true);

    setTimeout(async () => {
      await victim.user.voice.setMute(false);
    }, POWERUP_MUTE_TIME);
  }
};


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
export async function JoinGame(interaction: CommandInteraction, user: GuildMember) {
  
  if (!game.locationStart) { await interaction.reply({ content: "Set the game starting room.", ephemeral: true }); return; }
  const name = user.nickname ? user.nickname : user.displayName;

  try{
    await user.voice.setChannel(game.locationStart.channel.id);
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

  const player: Player = new Player(game, user, channel, emoji, game.locationStart);

  game.players.set(player.user.id, player);
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
