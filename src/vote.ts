import { CommandInteraction, EmbedBuilder } from "discord.js";
import { COLOSSEUM, DefaultVotes, DefaultVotesPerPlayer, FROG, general, graph, MAX_TIES, TICKET_INC_DEATH, TICKET_INC_IMMUNE } from "./lib/conts";
import { ERR_CODES } from "./game";
import { Player } from "./player";
import { GameStateType, VotesType, VoteType } from "./lib/types";
import { Region } from "./locations/region";
import { game } from ".";

// The ID is the votee and the array are voters IDS 
export const votes = new Map<string, VoteType>();



export function ResetVotes() {
  votes.clear();
}



/**
 * @todo Change this to incorporate mesasges.
 * @param interaction 
 */
export async function ListVotes(interaction: CommandInteraction) {
  const user = interaction.guild?.members.cache.get(interaction.user.id)
  if (!user) return;

  const name = user.nickname ? user.nickname : user.displayName;

  const mes = new EmbedBuilder()
      .setColor("#fcf403")
      .setTitle(`${name}`)
      .setAuthor({ name: "Game Master", iconURL: COLOSSEUM })
      .setThumbnail(COLOSSEUM)
      .setDescription(`Here are a list of people can can vote for in this voting round.`);

  [...votes].forEach(([id, player]) => {
    const votee = game.players.get(id);

    mes.addFields([{ name: `${votee?.name}`, value: `Player ID: ${votee?.playerId}`, inline: true }]);
  });

  await interaction.reply({ embeds: [mes] });
}



export function InitVotes() {
  //# iterate through all players
  ResetVotes();
  //! This kills a player if they can't be moved.
  [...game.players].forEach(async ([id, player]) => {
    await player.voteMove(graph.lair.region);
  });
  [...game.players].forEach(async ([id, player]) => {
    if (!player.vote.immunity)
      votes.set(player.user.id, { numVotes: 0, voters: DefaultVotesPerPlayer()});
    if (player.vote.muted)
      await player.user.voice.setMute(true);
    player.vote.spentTickets = 0;
  });
  
}



export async function CountVotes() {
  game.state = GameStateType.COUNT_VOTES;
  
  //# No more iterations
  if (votes.size === 0) {
    game.voteRound.err = ERR_CODES.TIE;
    return;
  }

  let numVotes: number = -1;
  let tie: VotesType = DefaultVotes();

  //# Count the votes
  [...votes].forEach(([votee, voters]) => {
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
      .setAuthor({ name: "Game Master", iconURL: COLOSSEUM })
      .setThumbnail('https://c.tenor.com/omRyJItsM9MAAAAd/fire-dragon-dragon.gif')
      .setDescription(`The dragon is displeased at a tie. '${game.voteRound.ties === MAX_TIES - 1 ? "You must vote again. REEEE" : ""}🔥'`)
      .addFields([{ name: `The tie is between:`, value: "\u200B" }]);
      [...tie].forEach(([votee, votes]) => {
        const player = game.players.get(votee);
        if (!player) return;
        mes.addFields([{ name: `Player ID: ${player.playerId}`, value: `<@${player.user.id}>: ${votes.numVotes}`, inline: true }]);
      });

    [...game.players].forEach(async ([key, player]) => {
      await player.channel.send({ embeds: [mes] });
    });

    game.voteRound.err = ERR_CODES.TIE;
    return;
  }

  const [id, player] = Array.from(tie)[0];
  game.voteRound.player = id;
  game.voteRound.err = ERR_CODES.SUCCESS;
  return;
}


//! Refactor later value->player + boolean
export async function VoteResults() {
  //# Ties and immune voting
  if (game.voteRound.err === ERR_CODES.MAX_TIES && game.voteRound.immuneRound) {
    await displayImmuneVoteResults(null);
    
    [...game.players].forEach(async ([key, value]) => {
      value.vote.spentTickets = 0;
      value.vote.tickets += TICKET_INC_IMMUNE;
      if (value.vote.muted) {
        value.vote.muted = false;
        await value.user.voice.setMute(false);
      }
    });
    return;
  }
  //# Ties and death voting
  else if (game.voteRound.err === ERR_CODES.MAX_TIES && !game.voteRound.immuneRound) {
    const [id, player] = Array.from(game.players)[Math.floor(Math.random() * votes.size)];
    await displayDeathVoteResults(player);
    player.kill();

    [...game.players].forEach(async ([key, value]) => {
      value.vote.tickets -= value.vote.spentTickets;
      value.vote.spentTickets = 0;
      value.vote.immunity = false;
      value.vote.tickets += TICKET_INC_DEATH;
      if (value.vote.muted) {
        value.vote.muted = false;
        await value.user.voice.setMute(false);
      }
    });
    return;
  } 
  //# Immune voting
  else if (game.voteRound.immuneRound) {
    const player = game.players.get(game.voteRound.player);
    if (!player) {
      general.channel.send(`Could not decipher winner, because I'm a dumb robot and I hate @Tye.`);
      return;
    }
    await displayImmuneVoteResults(player);

    player.vote.immunity = true;

    [...game.players].forEach(async ([key, value]) => {
      value.vote.tickets -= value.vote.spentTickets;
      value.vote.spentTickets = 0;
      value.vote.tickets += TICKET_INC_IMMUNE;
      if (value.vote.muted) {
        value.vote.muted = false;
        await value.user.voice.setMute(false);
      }
    });
    return;
  }
  //# Death round
  else {
    const player = game.players.get(game.voteRound.player);
    if (!player) {
      general.channel.send(`Could not decipher winner, because I'm a dumb robot and I hate @Tye.`);
      return;
    }
    await displayDeathVoteResults(player);
    player.kill();

    [...game.players].forEach(async ([key, value]) => {
      value.vote.tickets -= value.vote.spentTickets;
      value.vote.spentTickets = 0;
      value.vote.immunity = false;
      value.vote.tickets += TICKET_INC_DEATH;
      if (value.vote.muted) {
        value.vote.muted = false;
        await value.user.voice.setMute(false);
      }
    });
    return;
  }
}

async function displayDeathVoteResults(player: Player) {
  const mes = new EmbedBuilder()
    .setColor("#ec03fc")
    .setTitle(`Vote Results!`)
    .setAuthor({ name: "Game Master", iconURL: COLOSSEUM })
    .setThumbnail(COLOSSEUM)
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

  [...game.players].forEach(async ([id, player]) => {
    await player.channel.send({ embeds: [mes] });
  });
}

async function displayImmuneVoteResults(player: Player | null) {
  const mes = new EmbedBuilder()
    .setColor("#ec03fc")
    .setTitle(`Vote Results!`)
    .setAuthor({ name: "Game Master", iconURL: COLOSSEUM })
    .setThumbnail(COLOSSEUM)
    .setDescription(`The final results this round are:`);
  
  [...votes].forEach(([votee, vote]) => {
    const voteePlayer = game.players.get(votee);
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

  [...game.players].forEach(async ([id, player]) => {
    await player.channel.send({ embeds: [mes] });
  });
}