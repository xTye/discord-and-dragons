import { TimerType } from "./lib/types";
import { convertTimer, DefaultTimer, graph, general, Random, time, INCREMENT_MILLIS, playersCategory, PLAYER_ROLE_ID, CUSTOM_PLAYER_EMOJI } from "./lib/conts";
import { APIMessageComponentEmoji, APISelectMenuOption, ChannelType, Collection, CommandInteraction, EmbedBuilder, GuildMember, PermissionFlagsBits, Snowflake, TextChannel } from "discord.js";
import { Player } from "./player";
import { Region } from "./locations/region";
import { Route } from "./locations/route";
import { GameLocation } from "./locations";
import { VoiceConnection } from "@discordjs/voice";

export enum GameStateType {READY, SEARCH, VOTE};

const MAX_PLAYERS = 8;
const MAX_ROUNDS = 2;
const MAX_TIES = 2;
const STARTING_ROUND = true;

const SEARCH_TIME = time.fiveMin;
const VOTE_TIME = time.twoMin;
const LAST_WORDS_TIME = time.tenSec;

const TICKET_INC_IMMUNE = 1;
const TICKET_INC_DEATH = 1;

type VoteType = {
  numVotes: number;
  voters: Map<Snowflake, number>;
};

export enum ERR_CODES {DEFAULT = 0, MAX_TIES = -1, SUCCESS = -2, CALLBACK = -3, TIE = -4};

export class Game {
  state: GameStateType;
  rounds: number;
  vote: {
    err: ERR_CODES,
    ties: number,
    player?: Player,
    immuneRound: boolean,
    mutedPlayers: Collection<Snowflake, Player>,
    immunePlayers: Collection<Snowflake, Player>,
    votes: Collection<Snowflake, VoteType>,
    selections: APISelectMenuOption[],
  };
  connection?: VoiceConnection;
  timer: TimerType;
  locationStart?: GameLocation;
  locationVote?: GameLocation;
  regions: Collection<Snowflake, Region>;
  routes: Collection<Snowflake, Route>;
  players: Collection<Snowflake, Player>;
  readyQueue: boolean[];

  constructor() {
    this.state = GameStateType.READY;
    this.rounds = 0;
    this.vote = {
      err: ERR_CODES.DEFAULT,
      ties: 0,
      immuneRound: true,
      mutedPlayers: new Collection<Snowflake, Player>(),
      immunePlayers: new Collection<Snowflake, Player>(),
      votes: new Collection<Snowflake, VoteType>(),
      selections: [],
    },
    this.timer = DefaultTimer();
    this.regions = new Collection<Snowflake, Region>();
    this.routes = new Collection<Snowflake, Route>();
    this.players = new Collection<Snowflake, Player>();
    this.readyQueue = [];
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

  async setPlayerVote(player: Player) {
    if (!this.vote.immunePlayers.get(player.user.id)) {
      this.vote.votes.set(player.user.id, { numVotes: 0, voters: new Map<Snowflake, number> } );
      
    } else {
      this.vote.immunePlayers.delete(player.user.id);
    }

    if (this.vote.mutedPlayers.get(player.user.id))
      await player.user.voice.setSuppressed(true);
  }

  async start() {
    this.players.forEach((player, id) => {
      player.field.name = "___";
    });

    try{
      STARTING_ROUND ? this.searchRound() : this.voteRound();
    } catch (err) {
      console.log(err);
    }
  }

  private async initSearch() {
    console.log("Entering search round.");
    this.timer = convertTimer(SEARCH_TIME);

    this.regions.forEach((region, id) => {
        region.newRound();
    });

    this.players.forEach(async (player, id) => {
      await player.hud.searchRound();
    });

    this.state = GameStateType.SEARCH;
  }

  private async initVotes() {
    this.vote.err = ERR_CODES.DEFAULT;
    this.vote.player = undefined;
    this.vote.ties = 0;
    this.vote.immuneRound = !this.vote.immuneRound;
    this.vote.selections = [];
    this.vote.votes.clear();
    
    this.players.forEach(async (player, id) => {
      await player.voteStart(graph.lair.region);
    });

    //Has to update last to be able to load the player menu selections in case if one dies.
    this.players.forEach(async (player, id) => {
      //!await player.hud.update();
    });
  }

  private async searchRound() {
    await this.initSearch();
  
    //DESC Updates searching time left
    const interval = setInterval(async () => {
      this.timer = convertTimer(this.timer.milliseconds - INCREMENT_MILLIS);
    }, INCREMENT_MILLIS);
  
    //DESC Fires when searching is done
    setTimeout(async () => {
      clearInterval(interval);
      await this.voteRound();
    }, SEARCH_TIME);
  }

  private async voteRound() {
    console.log("Entering voting round");
    this.initVotes();
    this.timer = convertTimer(VOTE_TIME);
  
    const mes: EmbedBuilder = new EmbedBuilder()
      .setColor("#f54284")
      .setTitle("Vote Round")
      .setDescription(`The walls rumble around you. 'You have ${this.timer.minutes} minutes and ${this.timer.seconds} remaining for vote time👩‍🚒'`)
      .addFields([{ name: "**Directions**", value: "Use the `/vote player <PLAYER ID> <TICKETS>` command to vote for a player with a certain number of tickets." }]);
      this.vote.votes.forEach((voters, votee) => {
        const player = this.players.get(votee);
        if (!player) { return; }
        mes.addFields([{ name: `Player ID: ${player.playerId}`, value: `<@${votee}>`, inline: true }]);
      });
      
    this.players.forEach(async (player, id) => {
      await player.channel.send({ embeds: [mes] });
    });
  
    this.state = GameStateType.VOTE;
  
    //DESC Updates voting time left
    this.timer.interval = setInterval(async () => {
      this.timer = convertTimer(this.timer.milliseconds - INCREMENT_MILLIS);
    }, INCREMENT_MILLIS);
  
    //DESC Fires when voting is done
    this.timer.timeout = setTimeout(async () => {
      clearInterval(this.timer.interval);
  
      this.vote.ties += 1;
      await this.countVotes();
      if (this.vote.ties < MAX_TIES) {
        if (this.vote.err === ERR_CODES.SUCCESS) {
          await this.iterateNextHalfRound();
        }
        else {
          console.log("It was a tie");
  
          //# Recursion on itself
          await this.voteRound();
        }
      }
      //DESC Iterate next round
      else {
        this.vote.err = ERR_CODES.MAX_TIES;
        await this.iterateNextHalfRound();
      }
    }, VOTE_TIME);
  }

  private async iterateNextHalfRound() {
    await this.voteResults();
  
    const immuneRound = this.vote.immuneRound;
    if (!immuneRound) this.rounds++;
    if (this.rounds >= MAX_ROUNDS) {
      this.constructFinalResults();
      return;
    }
  
    //! Maybe delete later for checking votes.
    //resetVotes();
    
    await this.searchRound();
  }
  
  private async constructFinalResults() {
  
    const mes = new EmbedBuilder()
      .setColor("#ec03fc")
      .setTitle(`Congratulations!`)
      .setThumbnail("https://media.giphy.com/media/wcjtdRkYDK0sU/giphy.gif")
      .setDescription(`Here are the winners of tonight's squid game 👿`)
      .setImage("https://media.giphy.com/media/W29GyCAWS46qv1tG7Y/giphy.gif");
    
    this.players.forEach((player, id) => {
      mes.addFields([{ name: `Player ID: ${player.playerId}` , value: `<@${id}> with ${player.inventory.tickets - TICKET_INC_DEATH} tickets remaining.\u200B` }]);
    });
  
    this.players.forEach((player, id) => {
      player.channel.send({ embeds: [mes] });
    });
  
    general.channel.send({ embeds: [mes] });
  }
  
  private async countVotes() {
    //# No more iterations
    if (this.vote.votes.size === 0) {
      this.vote.err = ERR_CODES.TIE;
      return;
    }
  
    let numVotes: number = -1;
    let tie = new Collection<Snowflake, VoteType>();
  
    //# Count the votes
    this.vote.votes.forEach((voters, votee) => {
      if (voters.numVotes > numVotes){
        numVotes = voters.numVotes;
        tie.clear();
        tie.set(votee, voters);
      }; 
      if (voters.numVotes == numVotes)
        tie.set(votee, voters);
    });
  
    //# Handle a tie
    if (tie.size > 1) {
      const mes = new EmbedBuilder()
        .setTitle(`SHREEK!`)
        .setColor("#f54284")
        .setThumbnail('https://c.tenor.com/omRyJItsM9MAAAAd/fire-dragon-dragon.gif')
        .setDescription(`The dragon is displeased at a tie. '${this.vote.ties === MAX_TIES - 1 ? "You must vote again. REEEE" : ""}🔥'`)
        .addFields([{ name: `The tie is between:`, value: "\u200B" }]);
        tie.forEach((votes, votee) => {
          const player = this.players.get(votee);
          if (!player) return;
          mes.addFields([{ name: `Player ID: ${player.playerId}`, value: `<@${player.user.id}>: ${votes.numVotes}`, inline: true }]);
        });
  
      this.players.forEach(async (player, id) => {
        await player.channel.send({ embeds: [mes] });
      });
  
      this.vote.err = ERR_CODES.TIE;
      return;
    }
  
    const player = tie.firstKey();
    this.vote.player = this.players.get(player ? player : "");
    this.vote.err = ERR_CODES.SUCCESS;
  }
  
  
  //! Refactor later value->player + boolean
  private async voteResults() {
    if (!this.vote.immuneRound) {
      if (!this.vote.player)
        this.vote.player = this.players.random();
      
        await this.vote.player?.kill();
    } else {
      this.players.forEach(async (player, id) => {
        player.voteEnd(
          this.vote.immuneRound ? TICKET_INC_IMMUNE : TICKET_INC_DEATH,
          this.vote.immuneRound ? this.vote.err === ERR_CODES.MAX_TIES : false
        );
      });
    }
  }
  
  private async displayDeathVoteResults(player: Player) {
    const mes = new EmbedBuilder()
      .setColor("#ec03fc")
      .setTitle(`Vote Results!`)
      .setDescription(`I'm sorry to say but <@${player.user.id}> has been selected to die.`)
      .addFields([{
        name: "\u200B",
        value: "\u200B"
      },
      {
        name: "Bye Bye:",
        value: `<@${player.user.id}>`
      }
      ],)
      .setImage(player.user.displayAvatarURL());
  
    this.players.forEach(async (player, id) => {
      await player.channel.send({ embeds: [mes] });
    });
  }
  
  private async displayImmuneVoteResults(player: Player | null) {
    const mes = new EmbedBuilder()
      .setColor("#ec03fc")
      .setTitle(`Vote Results!`)
      .setDescription(`The final results this round are:`);
    
    this.vote.votes.forEach((vote, votee) => {
      const voteePlayer = this.players.get(votee);
      if (!voteePlayer) return;
      let s: string = "";
      [...vote.voters].forEach(([voter, numVotes]) => {
        s += `<@${voter}> voted with ${numVotes}\n`;
      });
      mes.addFields([{ name: `Player ID: ${voteePlayer.playerId} - ${voteePlayer.name}` , value: `${s === "" ? "No one voted for this person." : s}`, inline: true }]);
    });
  
    mes.addFields([{ name: "\u200B", value: "\u200B" }]);
  
    if (player) {
      mes.addFields([{ name: "Winner:", value: `<@${player.user.id}>` }]);
      mes.setImage(player.user.displayAvatarURL());
    }
  
    this.players.forEach(async (player, id) => {
      await player.channel.send({ embeds: [mes] });
    });
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


