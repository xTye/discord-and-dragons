import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, CommandInteraction, EmbedBuilder, GuildMember, Interaction, InteractionCollector, Message, MessageActionRowComponentBuilder, ModalActionRowComponentBuilder, PermissionFlagsBits, Snowflake, StageChannel, TextChannel, VoiceChannel } from "discord.js";
import { Fish } from "./activities/fish";
import { PrisonersDilemma } from "./activities/prisoners-dilemma";
import { JOIN, SikeDilemma } from "./activities/sike-dilemma";
import { COMMANDS } from "./lib/commands";
import { COLOSSEUM, convertTimer, DefaultTimer, FROG, graph, INCREMENT_MILLIS, MAP, playersCategory, PLAYER_ROLE_ID, POWERUP_MUTE_TIME, REGION_NUM, time } from "./lib/conts";
import { game, Game } from "./game";
import { HUDType, TimerType } from "./lib/types";
import { votes } from "./vote";
import { Region } from "./locations/region";
import { GameLocation } from "./locations";
import { Route } from "./locations/route";

export class Player {
  game: Game;
  playerId: number;
  name: string;
  user: GuildMember;
  channel: TextChannel;
  location: GameLocation;
  hud: {
    type: HUDType;
    mapNum: number;
    message: Message,
    embed: EmbedBuilder,
    actionrows: ActionRowBuilder<MessageActionRowComponentBuilder>[],
  }
  stats: {
    travelMult: number,
    searchMult: number,
  };
  activity: {
    active: boolean,
    timer: TimerType,
    prisonDilemma: boolean,
    teamDilemmaParticipate: boolean,
    teamDilemma: boolean,
  };
  travel: {
    destination?: Region;
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
    location: GameLocation,
    tickets?: number = 1,
    travelMult?: number = 0,
    searchMult?: number = 0,
    ) {
    this.game = game;
    this.playerId = this.game.players.size + 1;
    this.name = user.nickname ? user.nickname : user.displayName;
    this.user = user;
    this.channel = channel;
    this.location = location,
    this.hud = {
      type: HUDType.MAP,
      mapNum: -1,
      message: Message.prototype,
      embed: new EmbedBuilder(),
      actionrows: [],
    }
    this.stats = {
      travelMult,
      searchMult,
    };
    this.activity = {
      active: false,
      timer: DefaultTimer,
      prisonDilemma: false,
      teamDilemmaParticipate: false,
      teamDilemma: false,
    };
    this.travel = {
      traveling: false,
      timer: DefaultTimer,
    };
    this.vote = {
      immunity: false,
      muted: false,
      tickets,
      spentTickets: 0,
    };
    this.powerups = {
      mute: 0,
      checktick: 0,
    };

    this.location.players.set(this.user.id, this);
  }

  async kill() {
    game.players.delete(this.user.id);
    await this.user.roles.remove(PLAYER_ROLE_ID);
  }

  async findRoom(interaction: CommandInteraction) {
    await interaction.reply(`You are currently at ${this.location.channel.name}`);
  }

  async tickets(interaction: CommandInteraction) {
    await interaction.reply(`You have \`${this.vote.tickets - this.vote.spentTickets}\` tickets remaining.`);
  }

  initPlayerHUD() {
    this.hud.embed = new EmbedBuilder()
      .setTitle(`\`\`\`Time: ${this.travel.timer.minutes}:${this.travel.timer.seconds < 10 ? "0" + this.travel.timer.seconds : this.travel.timer.seconds}\`\`\``)
      .setAuthor({ name: `Tickets: ${this.vote.tickets}`, iconURL: this.user.displayAvatarURL()})
      .setThumbnail(MAP)
      .setTimestamp(new Date());

    const mapButton = new ButtonBuilder()
      .setCustomId("map")
      .setStyle(ButtonStyle.Primary)
      .setLabel("Map")
      .setEmoji("975969511020822528")

    const noteButton = new ButtonBuilder()
      .setCustomId("note")
      .setStyle(ButtonStyle.Primary)
      .setLabel("Leave Note")

    this.hud.actionrows.push(new ActionRowBuilder({ components: [mapButton, noteButton]}));
  }

  async joinedMessage() {
    this.initPlayerHUD();
    this.hud.embed.setDescription(`Welcome to the game! Here is a list of people who are also in the lobby.`);
    [...game.players].forEach(([id, player]) => {
      this.hud.embed.addFields([{ name: `Player ID: ${player.playerId}`, value: `<@${player.user.id}>`, inline: true }]);
    });

    await this.channel.send({ content: `<@${this.user.id}>` });
    this.hud.message = await this.channel.send({ embeds: [this.hud.embed], components: [...this.hud.actionrows] });
  }

  async regionPlayersMessage(interaction: CommandInteraction) {
    const mes = new EmbedBuilder()
      .setDescription(`Here is a list of people in your current region.`);
    [...this.location.players].forEach(([id, player]) => {
      mes.addFields([{ name: `Player ID: ${player.playerId}`, value: `<@${player.user.id}>`, inline: true }]);
    });

    await interaction.reply({ embeds: [mes] });
  }

  async mapHUD(interaction: CommandInteraction, page: string) {

    if (page === COMMANDS.MAP.SUBCOMMANDS.DEFAULT.NAME) this.hud.mapNum = Math.floor(Math.random() * REGION_NUM);
    else if (page === COMMANDS.MAP.SUBCOMMANDS.NEXT.NAME) this.hud.mapNum = (this.hud.mapNum + 1) % REGION_NUM;
    else this.hud.mapNum = (this.hud.mapNum - 1) % REGION_NUM;

    interaction.editReply("Loaded map");

    const region = this.game.regions[this.hud.mapNum]
    this.game.players.at


    this.hud.embed
      .setTitle("Map")
      //.setFields([{ name:  }])
  }

  gameStartedMessage() {


  }

  async move(dest: GameLocation) {
    if (this.location == dest) return true;

    //DESC Check if can move, kill it can't
    try {
      await this.user.voice.setChannel(dest.channel.id);
      await this.user.voice.setSuppressed(false);
    } catch (err) {
      try {
        await this.user.voice.setSuppressed(false);
        return true;
      } catch (err) {}
      await this.channel.send({ content: "Not in a voice channel, you have been removed from the game." })
      await this.kill();
      console.log(err);
      console.log("Could not move player");
      return false;
    }

    return true;
  }

  async voteMove(dest: GameLocation) {
    if (!(await this.move(dest))) return;

    this.location.players.delete(this.user.id);

    if (this.travel.timer.timeout) clearTimeout(this.travel.timer.timeout);
    if (this.travel.timer.interval) clearInterval(this.travel.timer.interval);
    if (this.activity.timer.timeout) clearTimeout(this.activity.timer.timeout);
    if (this.activity.timer.interval) clearInterval(this.activity.timer.interval);
    this.travel.destination = undefined;
    this.travel.timer = DefaultTimer;
    this.travel.traveling = false;
    this.activity.prisonDilemma = false;
    this.activity.timer = DefaultTimer;
    this.activity.active = false;

    this.location = dest;
    this.location.players.set(this.user.id, this);
  }

//# =========================================
//HEAD This is the travel section
//# =========================================

  /**
   * Sends an embedded message to indicate the time left between
   * travel distances.
   * 
   * @param interaction 
   */
  async travelMessage(interaction: CommandInteraction, route: Route) {
    const mes = new EmbedBuilder()
      .setDescription(`You are on your way to ${this.travel.destination}`)
      .setFields([{ name: "Time Left:", value: `${this.travel.timer.minutes}:${this.travel.timer.seconds < 10 ? "0" + this.travel.timer.seconds : this.travel.timer.seconds}` }])
      .addFields([{ name: "Players in route", value: `\u200B` }]);
    [...route.players].forEach(([id, player]) => {
      mes.addFields([{ name: `Player ID: ${player.playerId}`, value: `<@${player.user.id}>`, inline: true }]);
    });

    await interaction.reply({ embeds: [mes] });
  }

  /**
   * Begins the travel on a player by checking possible 
   * 
   * @param destination id of channel
   * @param interaction used for reply
   */
  async beginTravel(destination: Region, interaction: CommandInteraction) {
    let route: Route | undefined = undefined;
    
    if (this.location instanceof Region) {
      route = this.location.findPath(destination);
    }

    if (!route) {
      await interaction.reply(`Can not travel to ${destination.channel.name} from ${this.location.channel.name}.`);
      return;
    }

    if (!await this.move(this.location)) return;

    this.location.players.delete(this.user.id);
    this.location = route;
    this.travel.timer.milliseconds = route.travelTime;
    this.travel.destination = destination;
    this.travel.timer = convertTimer(this.travel.timer.milliseconds);
    this.location.players.set(this.user.id, this);
  
    //DESC Simulate travel
    const TRAVEL_TIME = this.travel.timer.milliseconds;
    this.travel.traveling = true;

    await this.travelMessage(interaction, route);

    const interval = setInterval(async () => {
      this.travel.timer = convertTimer(this.travel.timer.milliseconds - INCREMENT_MILLIS);
    }, INCREMENT_MILLIS);
  
    const timeout = setTimeout(async () => {
      clearInterval(interval);

      if (!this.travel.destination || !(await this.move(this.travel.destination))) return;

      sdfsdawait this.location.arrivedMessage(this);
      this.location.players.delete(this.user.id);
      this.location = this.travel.destination;
      this.travel.timer = DefaultTimer;
      this.travel.traveling = false;
      this.location.players.set(this.user.id, this);
    }, TRAVEL_TIME);
  
    this.travel.timer.timeout = timeout;
    this.travel.timer.interval = interval;
  }

  async travelTime(interaction: Message | CommandInteraction) {
    await interaction.reply(`You have ${this.travel.timer.minutes} minutes and ${this.travel.timer.seconds} seconds left of travel.`);
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
//HEAD This is the activity section
//# =========================================

  async activityTime(interaction: Message | CommandInteraction) {
    await interaction.reply(`You have ${this.activity.timer.minutes} minutes and ${this.activity.timer.seconds} seconds left of travel.`);
  }

  async activityPlay(interaction: CommandInteraction, code: JOIN) {
    if (this.activity.active) { await interaction.reply("Already apart of the game"); return; }

    if (this.location instanceof Region && this.location.activity instanceof SikeDilemma) { await this.location.activity.joinGame(interaction, code, this); return; }

    await interaction.reply("Cannot join the game for whatever reason.");
  }

  async activityVote(interaction: CommandInteraction, vote: boolean) {
    if (!this.activity.active) { await interaction.reply("Cannot vote if not in a game"); return; }

    if (this.location instanceof SikeDilemma) {
      if (!this.location.activity.done) { await interaction.reply("Game hasn't started yet"); return; }
      
      this.activity.teamDilemma = vote;
      await interaction.reply(`You have voted ${vote ? "Yes" : "No"}`);
      return;
    }

    if (this.location instanceof PrisonersDilemma) {
      this.activity.prisonDilemma = vote;
      await interaction.reply(`You have voted ${vote ? "Yes" : "No"}`);
      return;
    }

    await interaction.reply("Cannot vote for a game that you are not apart of");
  }

  async activityFish(interaction: CommandInteraction) {
    if (this.activity.active) { await interaction.reply("You are already doing something"); return; }

    if (this.location instanceof Fish) {
      await this.location.fish(interaction, this);
      return;
    }

    await interaction.reply("Cannot fish here.");
  }

  async activityRock(interaction: CommandInteraction) {
    if (this.activity.active) { await interaction.reply("You are already doing something"); return; }

    if (this.location instanceof Fish) {
      await this.location.throwRock(interaction, this);
      return;
    }

    await interaction.reply("You throw a rock.");
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
 * @param interaction command
 * @param user user in guild
 */
export async function JoinGame(interaction: CommandInteraction, user: GuildMember) {
  
  if (!game.locationStart) { await interaction.reply({ content: "Set the game starting room.", ephemeral: true }); return; }

  game.playerJoinQueue.push(true);

  try{
    await user.voice.setChannel(game.locationStart.channel.id);
    await user.voice.setSuppressed(false);
  } catch (err) {
    await interaction.reply({ content: "Must be in a voice channel to play the game.", ephemeral: true });
    game.playerJoinQueue.pop();
    console.log(err);
    console.log("User not in a voice channel");
    return;
  }

  
  const name = user.nickname ? user.nickname : user.displayName;
  let channel: TextChannel;

  try {
    channel = await playersCategory.channel.children.create(`${name}s-commands`, {
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
    game.playerJoinQueue.pop();
    console.log(err);
    console.log("Could not setup player chanel correctly");
    return;
  }

  const player: Player = new Player(game, user, channel, game.locationStart);

  game.players.set(player.user.id, player);
  await user.roles.add(PLAYER_ROLE_ID);
  game.playerJoinQueue.pop();
  await player.joinedMessage();
  await interaction.reply({ content: "A new channel has been created for you, please use this channel for all things command related.", ephemeral: true });

  console.log(`${player.name} has joined the game.`);
}

export async function GetPlayers(interaction: CommandInteraction) {
  const mes = new EmbedBuilder()
    .setColor("#00ff44")
    .setTitle(`${interaction.member?.user.username}`)
    .setAuthor({ name: "Frog", iconURL: FROG })
    .setThumbnail(COLOSSEUM)
    .setDescription("Here are a list of the active lobby / game. This will probably stay like this until the game is actually finished.");
  [...game.players].forEach(([id, player]) => {
    mes.addFields([{ name: `Player ID: ${player.playerId}`, value: `<@${player.user.id}>`, inline: true }]);
  });



  await interaction.reply({ embeds: [mes] });
}

export function GetPlayer(id: string) {
  return game.players.get(id);
}

export function isPlayer(player: any): player is Player {
  return player !== undefined;
}