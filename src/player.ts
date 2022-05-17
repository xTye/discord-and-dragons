import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, CommandInteraction, EmbedBuilder, GuildMember, Interaction, InteractionCollector, Message, MessageActionRowComponentBuilder, ModalActionRowComponentBuilder, PermissionFlagsBits, Snowflake, StageChannel, TextChannel, VoiceChannel } from "discord.js";
import { Fish } from "./activities/fish";
import { PrisonersDilemma } from "./activities/prisoners-dilemma";
import { JOIN, SikeDilemma } from "./activities/sike-dilemma";
import { COMMANDS } from "./lib/commands";
import { COLOSSEUM, convertTimer, DefaultTimer, FROG, graph, INCREMENT_MILLIS, inQueue, MAP, playersCategory, PLAYER_ROLE_ID, POWERUP_MUTE_TIME, REGION_NUM, time } from "./lib/conts";
import { game, Game } from "./game";
import { Region, Route } from "./region";
import { HUDType, TimerType } from "./lib/types";
import { votes } from "./vote";

export class Player {
  game: Game;
  playerId: number;
  name: string;
  user: GuildMember;
  channel: TextChannel;
  region: Region;
  route: Route | undefined;
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
    location: VoiceChannel | StageChannel;
    destination: VoiceChannel | StageChannel;
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

  constructor(game: Game, user: GuildMember, channel: TextChannel, tickets: number, travelMult: number, searchMult: number) {
    this.game = game;
    this.playerId = this.game.players.size + 1;
    this.name = user.nickname ? user.nickname : user.displayName;
    this.user = user;
    this.channel = channel;
    this.region = graph.dragonsLair.region;
    this.route = undefined;
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
      location: graph.dragonsLair.region.channel,
      destination: graph.dragonsLair.region.channel,
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

    this.region.regPlayers.set(this.user.id, this);
  }

  async kill() {
    game.players.delete(this.user.id);
    await this.user.roles.remove(PLAYER_ROLE_ID);
  }

  async findRoom(interaction: CommandInteraction) {
    await interaction.reply(`You are currently at ${this.travel.location.name}`);
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
      .setColor("#00ff44")
      .setTitle(`${this.region.channel.name}`)
      .setAuthor({ name: "Game Master", iconURL: COLOSSEUM })
      .setThumbnail(this.region.picture)
      .setDescription(`Here is a list of people in your current region.`);
    [...this.region.regPlayers].forEach(([id, player]) => {
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

  async move(channel: VoiceChannel | StageChannel) {
    if (this.travel.location == channel) return true;

    //DESC Check if can move, kill it can't
    try {
      await this.user.voice.setChannel(channel.id);
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

  async voteMove(channel: StageChannel) {
    if (!(await this.move(channel))) return;

    this.region.regPlayers.delete(this.user.id);
    this.route?.routPlayers.delete(this.user.id);
    this.route = undefined;

    if (this.travel.timer.timeout) clearTimeout(this.travel.timer.timeout);
    if (this.travel.timer.interval) clearInterval(this.travel.timer.interval);
    if (this.activity.timer.timeout) clearTimeout(this.activity.timer.timeout);
    if (this.activity.timer.interval) clearInterval(this.activity.timer.interval);
    this.travel.location = channel;
    this.travel.destination = channel;
    this.travel.timer = DefaultTimer;
    this.travel.traveling = false;
    this.activity.prisonDilemma = false;
    this.activity.timer = DefaultTimer;
    this.activity.active = false;

    this.region = graph.dragonsLair.region;
    this.region.regPlayers.set(this.user.id, this);
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
      .setColor("#00ff44")
      .setTitle(`${route.channel.name}`)
      .setAuthor({ name: "Game Master", iconURL: COLOSSEUM })
      .setThumbnail(route.picture)
      .setDescription(`You are on your way to ${this.travel.destination}`)
      .addFields([{ name: "Time Left:", value: `${this.travel.timer.minutes}:${this.travel.timer.seconds < 10 ? "0" + this.travel.timer.seconds : this.travel.timer.seconds}` }])
      .addFields([{ name: "Players in route", value: `\u200B` }]);
    [...route.routPlayers].forEach(([id, player]) => {
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
  async beginTravel(destination: Snowflake, interaction: CommandInteraction) {
    let route;
    let dest;

    //DESC lair to rt1
    if (destination === graph.tier1Red.id && this.travel.location.id === graph.dragonsLair.id) {
      route = graph.lairToRed;
      dest = graph.tier1Red;
    }
  
    //DESC rt1 to rt3
    else if (destination === graph.tier3Red.id && this.travel.location.id === graph.tier1Red.id) {
      route = graph.redToRed;
      dest = graph.tier3Red;
    }

    //DESC rt3 to rt1
    else if (destination === graph.tier1Red.id && this.travel.location.id === graph.tier3Red.id) {
      route = graph.redToRed;
      dest = graph.tier1Red;
    }

    //DESC rt1 to lair
    else if (destination === graph.dragonsLair.id && this.travel.location.id === graph.tier1Red.id) {
      route = graph.lairToRed;
      dest = graph.dragonsLair;
    }

    //DESC lair to bt1
    else if (destination === graph.tier1Blue.id && this.travel.location.id === graph.dragonsLair.id) {
      route = graph.lairToBlue;
      dest = graph.tier1Blue;
    }
  
    //DESC bt1 to bt3
    else if (destination === graph.tier3Blue.id && this.travel.location.id === graph.tier1Blue.id) {
      route = graph.blueToBlue;
      dest = graph.tier3Blue;
    }
    
    //DESC bt3 to bt1
    else if (destination === graph.tier1Blue.id && this.travel.location.id === graph.tier3Blue.id) {
      route = graph.blueToBlue;
      dest = graph.tier1Blue;
    }

    //DESC bt1 to lair
    else if (destination === graph.dragonsLair.id && this.travel.location.id === graph.tier1Blue.id) {
      route = graph.lairToBlue;
      dest = graph.dragonsLair;
    }

    //DESC lair to yt2
    else if (destination === graph.tier2Yellow.id && this.travel.location.id === graph.dragonsLair.id) {
      route = graph.lairToYellow;
      dest = graph.tier2Yellow;
    }

    //DESC yt2 to lair
    else if (destination === graph.dragonsLair.id && this.travel.location.id === graph.tier2Yellow.id) {
      route = graph.lairToYellow;
      dest = graph.dragonsLair;
    }
  
    //DESC Throw error
    else {
      await interaction.reply(`Can not travel to *that location* from ${this.travel.location.name}.`);
      return;
    }

    if (!await this.move(route.route.channel)) return;

    this.region.regPlayers.delete(this.user.id);
    this.travel.location = route.route.channel;
    this.travel.timer.milliseconds = route.route.travelTime;
    this.travel.destination = dest.region.channel;
    this.travel.timer = convertTimer(this.travel.timer.milliseconds);
    this.region = dest.region;
    this.route = route.route;
    this.route.routPlayers.set(this.user.id, this);
  
    //DESC Simulate travel
    const TRAVEL_TIME = this.travel.timer.milliseconds;
    this.travel.traveling = true;

    await this.travelMessage(interaction, route.route);

    const interval = setInterval(async () => {
      this.travel.timer = convertTimer(this.travel.timer.milliseconds - INCREMENT_MILLIS);
    }, INCREMENT_MILLIS);
  
    const timeout = setTimeout(async () => {
      clearInterval(interval);

      if (!(await this.move(this.travel.destination))) return;

      //await this.region.arrivedMessage(this);
      this.region.regPlayers.set(this.user.id, this);
      this.route?.routPlayers.delete(this.user.id);
      this.route = undefined;
      this.travel.location = this.travel.destination;
      this.travel.timer = DefaultTimer;
      this.travel.traveling = false;
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

    if (this.region.activity instanceof SikeDilemma) { await this.region.activity.joinGame(interaction, code, this); return; }

    await interaction.reply("Cannot join the game for whatever reason.");
  }

  async activityVote(interaction: CommandInteraction, vote: boolean) {
    if (!this.activity.active) { await interaction.reply("Cannot vote if not in a game"); return; }

    if (this.region instanceof SikeDilemma) {
      if (!this.region.activity.done) { await interaction.reply("Game hasn't started yet"); return; }
      
      this.activity.teamDilemma = vote;
      await interaction.reply(`You have voted ${vote ? "Yes" : "No"}`);
      return;
    }

    if (this.region instanceof PrisonersDilemma) {
      this.activity.prisonDilemma = vote;
      await interaction.reply(`You have voted ${vote ? "Yes" : "No"}`);
      return;
    }

    await interaction.reply("Cannot vote for a game that you are not apart of");
  }

  async activityFish(interaction: CommandInteraction) {
    if (this.activity.active) { await interaction.reply("You are already doing something"); return; }

    if (this.region instanceof Fish) {
      await this.region.fish(interaction, this);
      return;
    }

    await interaction.reply("Cannot fish here.");
  }

  async activityRock(interaction: CommandInteraction) {
    if (this.activity.active) { await interaction.reply("You are already doing something"); return; }

    if (this.region instanceof Fish) {
      await this.region.throwRock(interaction, this);
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
 * the current players Map.
 * 
 * @param interaction command
 * @param user user in guild
 */
export async function JoinGame(interaction: CommandInteraction, user: GuildMember) {
  
  inQueue.push(true);

  try{
    await user.voice.setChannel(graph.dragonsLair.id);
    await user.voice.setSuppressed(false);
  } catch (err) {
    await interaction.reply({ content: "Must be in a voice channel to play the game.", ephemeral: true });
    inQueue.pop();
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
    inQueue.pop();
    console.log(err);
    console.log("Could not setup player chanel correctly");
    return;
  }
[]
  const player: Player = new Player(game, user, channel, 1, 0, 0);

  game.players.set(player.user.id, player);
  await user.roles.add(PLAYER_ROLE_ID);
  inQueue.pop();
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