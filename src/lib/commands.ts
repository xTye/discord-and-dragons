export const COMMANDS = {
  HELP: {
    NAME: "help",
    COMMAND: "!help",
    DESCRIPTION: "Lists all of the commands",
    SUBCOMMANDS: {
      TRAVEL: {
        NAME: "travel",
        COMMAND: "!help travel",
        DESCRIPTION: "Displays all travel commands"
      },
      VOTE: {
        NAME: "vote",
        COMMAND: "!help vote",
        DESCRIPTION: "Displays all vote commands"
      },
      POWERUP: {
        NAME: "pop",
        COMMAND: "!help pop",
        DESCRIPTION: "Displays all powerup commands"
      },
    },
  },
  JOIN: {
    NAME: "join",
    COMMAND: "!join",
    DESCRIPTION: "Used to join a game"
  },
  LOBBY: {
    NAME: "lobby",
    COMMAND: "!lobby",
    DESCRIPTION: "Lists all players in a lobby"
  },
  START: {
    NAME: "start",
    COMMAND: "!start",
    DESCRIPTION: "Used to join a game"
  },
  TIME: {
    NAME: "time",
    COMMAND: "!time",
    DESCRIPTION: "Returns the time left in the round"
  },
  TRAVEL: {
    NAME: "travel",
    COMMAND: "!travel",
    DESCRIPTION: "Parent command for all things to do with location",
    SUBCOMMANDS: {
      MEADOW: {
        NAME: "meadow",
        COMMAND: "!travel meadow",
        DESCRIPTION: "Travel to meadow.",
      },
      VOLCANO: {
        NAME: "volcano",
        COMMAND: "!travel volcano",
        DESCRIPTION: "Travel to volcano.",
      },
      COAST: {
        NAME: "coast",
        COMMAND: "!travel coast",
        DESCRIPTION: "Travel to coast.",
      },
      OCEAN: {
        NAME: "ocean",
        COMMAND: "!travel ocean",
        DESCRIPTION: "Travel to ocean.",
      },
      CAVERN: {
        NAME: "cavern",
        COMMAND: "!travel cavern",
        DESCRIPTION: "Travel to cavern.",
      },
      LAIR: {
        NAME: "lair",
        COMMAND: "!travel lair",
        DESCRIPTION: "Travel to the dragon's lair"
      },
      TIME: {
        NAME: "time",
        COMMAND: "!travel time",
        DESCRIPTION: "Displays current travel time"
      },
    },
  },
  VOTE: {
    NAME: "vote",
    COMMAND: "!vote",
    DESCRIPTION: "Parent command for all things to do with voting.",
    SUBCOMMANDS: {
      TICKETS: {
        NAME: "tickets",
        COMMAND: "!vote tickets",
        DESCRIPTION: "Displays tickets left on you",
      },
      LIST: {
        NAME: "list",
        COMMAND: "!vote list",
        DESCRIPTION: "Displays all valid players one can vote for",
      },
      PLAYER: {
        NAME: "player",
        COMMAND: "!vote <PLAYER ID> <TICKETS>",
        DESCRIPTION: "Vote for a player with your tickets",
      },
    },
  },
  POWERUP: {
    NAME: "pop",
    COMMAND: "!pop",
    DESCRIPTION: "Parent command for power ups",
    SUBCOMMANDS: {
      CHECK_TICK: {
        NAME: "ct",
        COMMAND: "!pop ct <PLAYER ID>",
        DESCRIPTION: "Displays tickets on a player",
      },
      MUTE: {
        NAME: "mute",
        COMMAND: "!pop mute <PLAYER ID>",
        DESCRIPTION: "Mutes a player for a minute"
      },
      PRIO_SPK: {
        NAME: "prio",
        COMMAND: "!pop prio",
        DESCRIPTION: "Grants yourself priority speaking"
      },
    },
  },
  REGION: {
    NAME: "region",
    COMMAND: "!region",
    DESCRIPTION: "Parent command for region",
    SUBCOMMANDS: {
      ROOM: {
        NAME: "room",
        COMMAND: "!region room",
        DESCRIPTION: "Returns the current discord room your in"
      },
      PLAY: {
        NAME: "play",
        COMMAND: "!region play <HELPEE or HELPER>",
        DESCRIPTION: "Play as the helpee or helper",
      },
      VOTE: {
        NAME: "vote",
        COMMAND: "!region vote",
        DESCRIPTION: "Vote for minigame for a specific region",
      },
      FISH: {
        NAME: "fish",
        COMMAND: "!region fish",
        DESCRIPTION: "Fish for a ticket",
      },
      ROCK: {
        NAME: "rock",
        COMMAND: "!region rock",
        DESCRIPTION: "Throw a rock",
      },
      PLAYERS: {
        NAME: "players",
        COMMAND: "!region players",
        DESCRIPTION: "Get the players currently in the region",
      },
    },
  },
  MAP: {
    NAME: "map",
    COMMAND: "!map",
    DESCRIPTION: "Show the map hud",
    SUBCOMMANDS: {
      DEFAULT: {
        NAME: "default",
        COMMAND: "!default",
        DESCRIPTION: "Loads the default map hud",
      },
      NEXT: {
        NAME: "next",
        COMMAND: "!next",
        DESCRIPTION: "Loads the the next page on the map hud",
      },
      PREV: {
        NAME: "prev",
        COMMAND: "!prev",
        DESCRIPTION: "Loads the the previous page on the map hud",
      },
    }
  }
}