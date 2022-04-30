import { Message } from "discord.js";
import { DefaultVotes, DefaultVotesPerPlayer, general, MAX_PLAYERS, MAX_TIES, players, playersById, TICKET_INC_DEATH, TICKET_INC_IMMUNE } from "./conts";
import { ERR_CODES, game } from "./game";
import { Kill, Name, Tickets } from "./player";
import { DragonMove } from "./travel";
import { GameStateType, VotesType } from "./types";

// The ID is the votee and the array are voters IDS 
export const votes: VotesType = DefaultVotes();



export function HandleVote(message: Message) {
  if (message.content === "!vote list") {
    ListVotes(message);
    return;
  }

  if (message.content === "!vote tickets") {
    Tickets(message);
    return;
  }
  
  vote(message);
}



async function vote(message: Message) {
  const user = message.guild?.members.cache.get(message.author.id);
  if (!user) return;

  const player = players.get(user.id)
  if (!player){
    const name = user.nickname ? user.nickname : user.displayName;
    general.channel.send(`@${name}, you are not a valid player`);
    return;
  }

  if (game.state !== GameStateType.VOTE) {
    player.channel.send("Game not in vote phase.");
    return;
  } 

  if (game.voteRound.immuneRound == true && message.channelId === player.channel.id) {
    player.channel.send("Must submit your vote publically.");
    return;
  }
  if (game.voteRound.immuneRound == false && general.channel.id === player.channel.id) {
    message.delete();
    player.channel.send("Must submit your vote in your text channel.");
    return;
  }

  const mes = message.content.split(" ");

  const playerId = +mes[1];
  if (!playerId || playerId === 0 || playerId <= 0 || playerId > MAX_PLAYERS) {
    player.channel.send("Not a valid id, please use `!lobby` command to list the users with ids");
    return;
  }

  const numVotes = +mes[2];
  if (!numVotes || !(numVotes > 0)) {
    player.channel.send("Not a valid number of tickets");
    return;
  }

  if (numVotes > player.vote.tickets - player.vote.spentTickets) {
    player.channel.send("You cannot vote with more tickets than you have");
    return;
  }

  const isId = playersById.get(playerId);
  if (!isId) return;
  const votee = players.get(isId);
  if (!votee) {
    player.channel.send("Not a valid id, please use `!lobby` command to list the users with ids");
    return;
  }

  //# Add votes to votee
  const vote = votes.get(votee.user.id);
  if (!vote) return;
  const playerVotedOnVotee = vote.voters.get(player.user.id);
  if (!playerVotedOnVotee)
    vote.voters.set(player.user.id, numVotes);
  else
    vote.voters.set(player.user.id, numVotes + playerVotedOnVotee);

  player.vote.spentTickets += numVotes;

  vote.numVotes += numVotes;
  
  await player.channel.send(`You have voted for ${Name(votee)} with ${numVotes} ticket(s).`);

  return;
}



export function ResetVotes() {
  votes.clear();
}



export function ListVotes(mes: Message) {
  let message = "```\nID\t\tPlayer\n";
  
  //# Iterate through each player and list them
  [...votes].forEach(([votee, voters]) => {
    const player = players.get(votee);
    if (!player) return;
    message += `${player.playerId}\t\t${Name(player)}\n`;
  });

  message += "```";

  mes.channel.send(message);
}



export function InitVotes() {
  //# iterate through all players
  ResetVotes();
  [...players].forEach(([id, player]) => {
    DragonMove(player);
    if (!player.vote.immunity)
      votes.set(player.user.id, { numVotes: 0, voters: DefaultVotesPerPlayer()});
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
    let tieString = "";

    [...tie].forEach(([votee, voters]) => {
      const player = players.get(votee);
      if (!player) return;
      tieString += `\`${Name(player)}\`\n`;
    });
    await general.channel.send(`It seems we have a tie between \`\`\`${tieString} at ${numVotes}\n\`\`\` votes. Please vote again.`);
    game.voteRound.err = ERR_CODES.TIE;
    return;
  }

  const [id, player] = Array.from(tie)[0];
  game.voteRound.player = id;
  game.voteRound.err = ERR_CODES.SUCCESS;
  return;
}



export async function VoteResults() {
  //# Ties and immune voting
  if (game.voteRound.err === ERR_CODES.MAX_TIES && game.voteRound.immuneRound) {
    await general.channel.send(`The dragon is displeased by another tie. No one gets immunity.`);
    
    [...players].forEach(([key, value]) => {
      value.vote.spentTickets = 0;
      value.vote.tickets += TICKET_INC_IMMUNE;
    });
    return;
  }
  //# Ties and death voting
  else if (game.voteRound.err === ERR_CODES.MAX_TIES && !game.voteRound.immuneRound) {
    const [id, player] = Array.from(players)[Math.floor(Math.random() * votes.size)];
    await general.channel.send(`I'm sorry to say ${Name(player)}. You have been **randomly** selected to die this round.`);
    Kill(player.user.id, player.playerId);

    [...players].forEach(([key, value]) => {
      value.vote.tickets -= value.vote.spentTickets;
      value.vote.spentTickets = 0;
      value.vote.tickets += TICKET_INC_DEATH;
    });
    return;
  } 
  //# Immune voting
  else if (game.voteRound.immuneRound) {
    const player = players.get(game.voteRound.player);
    if (!player) {
      general.channel.send(`Could not decipher winner, because I'm a dumb robot and I hate @Tye.`);
      return;
    }
    const message = constructVoteResults();
    await general.channel.send(`The final results this round are:\n${message}`);
    await general.channel.send(`Congratualations ${Name(player)}. You have recieved immunity for this round.`);
    player.vote.immunity = true;

    [...players].forEach(([key, value]) => {
      value.vote.tickets -= value.vote.spentTickets;
      value.vote.spentTickets = 0;
      value.vote.tickets += TICKET_INC_IMMUNE;
    });
    return;
  }
  //# Death round
  else {
    const player = players.get(game.voteRound.player);
    if (!player) {
      general.channel.send(`Could not decipher winner, because I'm a dumb robot and I hate @Tye.`);
      return;
    }
    await general.channel.send(`I'm sorry to say ${Name(player)}. You have been selected to die this round.`);
    Kill(player.user.id, player.playerId);

    [...players].forEach(([key, value]) => {
      value.vote.tickets -= value.vote.spentTickets;
      value.vote.spentTickets = 0;
      value.vote.tickets += TICKET_INC_DEATH;
    });
    return;
  }
}



export function constructVoteResults() {
  let message = "```ID\t\tPlayer\t\tVotes\n";

  //# Iterate through votee's
  [...votes].forEach(([voteeKey, voteeValue]) => {
    const player = players.get(voteeKey);
    if (!player) return;
    message += `${player.playerId}\t\t${Name(player)}\t\t${voteeValue.numVotes}\n\t\tVoters:\n`;

    //# Iterate through voter's in votee
    [...voteeValue.voters].forEach(([voterKey, voterValue]) => {
      const listPlayer = players.get(voterKey);
      if (!listPlayer) return;

      message += `\t\t${Name(listPlayer)} with ${voterValue} tickets\n`;
    });
  });

  message += "```";

  return message;
}