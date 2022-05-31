import { APISelectMenuOption, Collection, CommandInteraction, Snowflake } from "discord.js";
import { GameRound } from ".";
import { Game } from "../game";
import { graph } from "../lib/conts";
import { GameTimer } from "../lib/timer";
import { Player } from "../player";

enum ERR_CODES {DEFAULT, MAX_TIES, SUCCESS, TIE};

export type VoteType = {
  numVotes: number;
  voters: Map<Snowflake, number>;
};

const TICKET_INC_IMMUNE = 1;
const TICKET_INC_DEATH = 1;
const VOTE_TIME = GameTimer.twoMin;
const MAX_TIES = 2;
const LAST_WORDS_TIME = GameTimer.tenSec;

export class VoteRound extends GameRound {
  err: ERR_CODES;
  ties: number;
  player?: Player;
  immuneRound: boolean;
  counting: boolean;
  votes: Collection<Snowflake, VoteType>;
  selections: APISelectMenuOption[];

  constructor(game: Game, immuneRound: boolean, time?: number) {
    super(game, time ? time : VOTE_TIME);

    // May make another class
    this.immuneRound = immuneRound;

    this.err = ERR_CODES.DEFAULT;
    this.ties = 0;
    this.counting = false;
    this.votes = new Collection<Snowflake, VoteType>();
    this.selections = [];
  }

  async vote(interaction: CommandInteraction, player: Player) {
    if (this.counting) {await interaction.reply({ content: "Cannot submit votes when counting.", ephemeral: true }); return;}
    if (!player.vote.tickets) {await interaction.reply({ content: "You must vote with a valid form of tickets.", ephemeral: true }); return;}
    if (player.vote.tickets < player.inventory.tickets) {await interaction.reply({ content: "You cannot vote with more tickets than you have.", ephemeral: true }); return;}
    if (!player.vote.player) {await interaction.reply({ content: "Your selection for a player is not valid.", ephemeral: true }); return;}

    const vote = this.votes.get(player.vote.player.user.id);
    if (!vote) {await interaction.reply({ content: "Cannot vote for this player.", ephemeral: true }); return;}

    const playerVotedOnVotee = vote.voters.get(player.user.id);
    if (!playerVotedOnVotee)
      vote.voters.set(player.user.id, player.vote.tickets);
    else
      vote.voters.set(player.user.id, player.vote.tickets + playerVotedOnVotee);
  
    player.inventory.spendTickets = player.vote.tickets;
  
    vote.numVotes += player.vote.tickets;
    
    player.hud.loadVoted();
  }

  initPlayer(player: Player) {
    if (!this.game.immunePlayers.get(player.user.id)) {
      this.votes.set(player.user.id, { numVotes: 0, voters: new Map<Snowflake, number> } );
      this.selections.push(player.selection);
    } else {
      this.game.immunePlayers.delete(player.user.id);
    }
  }

  protected override init() {
    console.log("Entering voting round.");
    this.loading = true;

    //# Kills player if can't be moved
    this.game.players.forEach((player, id) => {
      player.voteStart(this.game.locationVote ? this.game.locationVote : graph.lair.region, this);
    });

    this.game.players.forEach((player, id) => {
      player.hud.loadVote();
    });
    this.loading = false;
  }

  override start() {
    this.init();

    this.timer.startTimer(() => {
      this.iterator();
    }, VOTE_TIME);
  }

  private iterator() {
    this.ties += 1;
    this.count();

    if (this.ties < MAX_TIES) {
      if (this.err === ERR_CODES.SUCCESS) {
        this.end();
      }
      else {
        console.log("It was a tie");

        this.game.players.forEach((player, id) => {
          player.hud.loadTie();
        });

        //# Try again
        this.start();
      }
    }
    //DESC Iterate next round
    else {
      this.err = ERR_CODES.MAX_TIES;
      this.end();
    }
  }

  private end() {
    if (this.immuneRound) {
      if (this.player) 
        this.game.immunePlayers.set(this.player.user.id, this.player);

      console.log(`${this.player ? this.player.name : "No one"} was choosen for immunity.`);

      this.game.players.forEach((player, id) => {
        player.voteEnd(
          TICKET_INC_IMMUNE,
          this.err === ERR_CODES.MAX_TIES,
        );
      });
    
      this.game.newRound();
    } else {
      if (!this.player)
        this.player = this.game.players.random();

      console.log(`${this.player ? this.player.name : "No one"} was choosen to die.`);

      if (this.player) {
        this.player.lastWords();

        this.game.players.forEach(async (player, id) => {
          if (!player.stats.muted && this.player != player) {
            await player.user.voice.setSuppressed(true);
          }
        });
      }


      this.timer.startTimer(() => {
        this.game.players.forEach((player, id) => {
          player.voteEnd(
            TICKET_INC_DEATH,
            false,
          );
        });

        this.player?.kill();
      
        this.game.newRound();
      }, LAST_WORDS_TIME)
    }
  }

  private count() {
    //# No more iterations
    if (this.votes.size === 0) {
      this.err = ERR_CODES.TIE;
      return;
    }
  
    let numVotes: number = -1;
    let tie = new Collection<Snowflake, VoteType>();
  
    //# Count the votes
    this.votes.forEach((voters, votee) => {
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
      this.err = ERR_CODES.TIE;
      return;
    }
  
    const player = tie.firstKey();
    this.player = this.game.players.get(player ? player : "");
    this.err = ERR_CODES.SUCCESS;
  }
}