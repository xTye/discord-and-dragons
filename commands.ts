import { Message } from "discord.js";
import { players } from "./conts";
import { game, Start } from "./game";
import { FindRoom, GetPlayers, JoinGame } from "./player";
import { HandlePop } from "./powerUps";
import { HandleTravel } from "./travel";
import { GameStateType } from "./types";
import { HandleVote } from "./vote";

export const COMMANDS = {
  HELP: {
    COMMAND: "!help",
    DESCRIPTION: "Lists all of the commands",
    SUBCOMMANDS: {
      TRAVEL: {
        COMMAND: "!help travel",
        DESCRIPTION: "Displays all travel commands"
      },
      VOTE: {
        COMMAND: "!help vote",
        DESCRIPTION: "Displays all vote commands"
      },
      POWERUP: {
        COMMAND: "!help pop",
        DESCRIPTION: "Displays all powerup commands"
      },
    },
  },
  JOIN: {
    COMMAND: "!join",
    DESCRIPTION: "Used to join a game"
  },
  LOBBY: {
    COMMAND: "!lobby",
    DESCRIPTION: "Lists all players in a lobby"
  },
  START: {
    COMMAND: "!start",
    DESCRIPTION: "Used to join a game"
  },
  ROOM: {
    COMMAND: "!room",
    DESCRIPTION: "Returns the current discord room your in"
  },
  TIME: {
    COMMAND: "!time",
    DESCRIPTION: "Returns the time left in the round"
  },
  TRAVEL: {
    COMMAND: "!travel",
    DESCRIPTION: "Parent command for all things to do with location",
    SUBCOMMANDS: {
      MEADOW: {
        COMMAND: "!travel meadow",
        DESCRIPTION: "Travel to meadow.",
      },
      VOLCANO: {
        COMMAND: "!travel volcano",
        DESCRIPTION: "Travel to volcano.",
      },
      COASTAL: {
        COMMAND: "!travel coastal",
        DESCRIPTION: "Travel to coastal.",
      },
      OCEAN: {
        COMMAND: "!travel ocean",
        DESCRIPTION: "Travel to ocean.",
      },
      CAVERN: {
        COMMAND: "!travel cavern",
        DESCRIPTION: "Travel to cavern.",
      },
      LAIR: {
        COMMAND: "!travel lair",
        DESCRIPTION: "Travel to the dragon's lair"
      },
      TIME: {
        COMMAND: "!travel time",
        DESCRIPTION: "Displays current travel time"
      },
    },
  },
  VOTE: {
    COMMAND: "!vote",
    DESCRIPTION: "Parent command for all things to do with voting.",
    SUBCOMMANDS: {
      TICKETS: {
        COMMAND: "!vote tickets",
        DESCRIPTION: "Displays tickets left on you",
      },
      LIST: {
        COMMAND: "!vote list",
        DESCRIPTION: "Displays all valid players one can vote for",
      },
      PLAYER: {
        COMMAND: "!vote <PLAYER ID> <TICKETS>",
        DESCRIPTION: "Vote for a player with your tickets",
      },
    },
  },
  POWERUP: {
    COMMAND: "!pop",
    DESCRIPTION: "Parent command for power ups",
    SUBCOMMANDS: {
      CHECK_TICK: {
        COMMAND: "!pop checktick <PLAYER ID>",
        DESCRIPTION: "Displays tickets on a player",
      },
      MUTE: {
        COMMAND: "!pop mute <PLAYER ID>",
        DESCRIPTION: "Mutes a player for a minute"
      },
      PRIO_SPK: {
        COMMAND: "!pop prio",
        DESCRIPTION: "Grants yourself priority speaking"
      },
    },
  },
}

export function HandleCommand(message: Message) {
  if (MessageToCommand(message) === COMMANDS.HELP.COMMAND) {
    handleCommands(message);
  }

  if (MessageToCommand(message) ===  COMMANDS.JOIN.COMMAND) {
    JoinGame(message);
  }

  if (MessageToCommand(message) === COMMANDS.LOBBY.COMMAND) {
    GetPlayers(message);
  }

  if (MessageToCommand(message) === COMMANDS.START.COMMAND) {
    Start(message);
  }

  if (MessageToCommand(message) === COMMANDS.ROOM.COMMAND) {
    FindRoom(message);
  }

  if (MessageToCommand(message) === COMMANDS.TRAVEL.COMMAND) {
    HandleTravel(message);
  }

  if (MessageToCommand(message) === COMMANDS.VOTE.COMMAND) {
    HandleVote(message);
  }

  if (MessageToCommand(message) === COMMANDS.POWERUP.COMMAND) {
    HandlePop(message);
  }
}

export function MessageToCommand(message: Message) {
  return message.content.split(" ")[0];
};

export function MessageLength(message: Message) {
  return message.content.split(" ").length;
};

function handleCommands(message: Message) {
  switch (message.content) {
    case COMMANDS.HELP.SUBCOMMANDS.TRAVEL.COMMAND:
      help(message, COMMANDS.TRAVEL.SUBCOMMANDS);
      break;
    case COMMANDS.HELP.SUBCOMMANDS.VOTE.COMMAND:
      help(message, COMMANDS.VOTE.SUBCOMMANDS);
      break;
    case COMMANDS.HELP.SUBCOMMANDS.POWERUP.COMMAND:
      help(message, COMMANDS.POWERUP.SUBCOMMANDS);
      break;
    case COMMANDS.HELP.COMMAND:
      help(message, COMMANDS);
      break;
  }
}

function help(message: Message, obj: Object) {
  let s = "```\n"
  Object.entries(obj).forEach(([key, value]) => {
    s += `${value.COMMAND} === ${value.DESCRIPTION}\n`

    if (value.COMMAND === COMMANDS.HELP.COMMAND) {
      Object.entries(COMMANDS.HELP.SUBCOMMANDS).forEach(([subkey, subvalue]) => {
        s += `\t${subvalue.COMMAND} === ${subvalue.DESCRIPTION}\n`
      });
    }
  });

  s += "```"
  message.reply(s);
}
