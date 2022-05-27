export const COMMANDS = {
  HELP: {
    NAME: "help",
    DESCRIPTION: "Lists all of the commands",
    SUBCOMMANDS: {
      TRAVEL: {
        NAME: "travel",
        DESCRIPTION: "Displays all travel commands"
      },
      VOTE: {
        NAME: "vote",
        DESCRIPTION: "Displays all vote commands"
      },
      POWERUP: {
        NAME: "pop",
        DESCRIPTION: "Displays all powerup commands"
      },
    },
  },
  PLAYER: {
    NAME: "player",
    DESCRIPTION: "All commands related to being a game player",
    SUBCOMMANDS: {
      NAME: "state",
      DESCRIPTION: "Manage the state of the player",
      JOIN: {
        NAME: "join",
        DESCRIPTION: "Join a game"
      },
      READY: {
        NAME: "ready",
        DESCRIPTION: "Ready up in game"
      },
      LEAVE: {
        NAME: "leave",
        DESCRIPTION: "Leave a game"
      },
      SYNC: {
        NAME: "sync",
        DESCRIPTION: "Sync player state with game",
        SUBCOMMANDS: {
          NAME: "voice",
          DESCRIPTION: "Sync with voice?",
          YES: "yes",
          NO: "no",
        },
      },
    },
  },
  START: {
    NAME: "start",
    DESCRIPTION: "Used to join a game"
  },
  TIME: {
    NAME: "time",
    DESCRIPTION: "Returns the time left in the round"
  },
  TRAVEL: {
    NAME: "travel",
    DESCRIPTION: "Parent command for all things to do with location",
    SUBCOMMANDS: {
      MEADOW: {
        NAME: "meadow",
        DESCRIPTION: "Travel to meadow.",
      },
      VOLCANO: {
        NAME: "volcano",
        DESCRIPTION: "Travel to volcano.",
      },
      COAST: {
        NAME: "coast",
        DESCRIPTION: "Travel to coast.",
      },
      OCEAN: {
        NAME: "ocean",
        DESCRIPTION: "Travel to ocean.",
      },
      CAVERN: {
        NAME: "cavern",
        DESCRIPTION: "Travel to cavern.",
      },
      LAIR: {
        NAME: "lair",
        DESCRIPTION: "Travel to the dragon's lair"
      },
      TIME: {
        NAME: "time",
        DESCRIPTION: "Displays current travel time"
      },
    },
  },
  VOTE: {
    NAME: "vote",
    DESCRIPTION: "Parent command for all things to do with voting.",
    SUBCOMMANDS: {
      TICKETS: {
        NAME: "tickets",
        DESCRIPTION: "Displays tickets left on you",
      },
      LIST: {
        NAME: "list",
        DESCRIPTION: "Displays all valid players one can vote for",
      },
      PLAYER: {
        NAME: "player",
        DESCRIPTION: "Vote for a player with your tickets",
      },
    },
  },
  POWERUP: {
    NAME: "pop",
    DESCRIPTION: "Parent command for power ups",
    SUBCOMMANDS: {
      CHECK_TICK: {
        NAME: "ct",
        DESCRIPTION: "Displays tickets on a player",
      },
      MUTE: {
        NAME: "mute",
        DESCRIPTION: "Mutes a player for a minute"
      },
      PRIO_SPK: {
        NAME: "prio",
        DESCRIPTION: "Grants yourself priority speaking"
      },
    },
  },
  REGION: {
    NAME: "region",
    DESCRIPTION: "Parent command for region",
    SUBCOMMANDS: {
      ROOM: {
        NAME: "room",
        DESCRIPTION: "Returns the current discord room your in"
      },
      PLAY: {
        NAME: "play",
        DESCRIPTION: "Play as the helpee or helper",
      },
      VOTE: {
        NAME: "vote",
        DESCRIPTION: "Vote for minigame for a specific region",
      },
      FISH: {
        NAME: "fish",
        DESCRIPTION: "Fish for a ticket",
      },
      ROCK: {
        NAME: "rock",
        DESCRIPTION: "Throw a rock",
      },
      PLAYERS: {
        NAME: "players",
        DESCRIPTION: "Get the players currently in the region",
      },
    },
  },
  MAP: {
    NAME: "map",
    DESCRIPTION: "Show the map hud",
    SUBCOMMANDS: {
      DEFAULT: {
        NAME: "default",
        DESCRIPTION: "Loads the default map hud",
      },
      NEXT: {
        NAME: "next",
        DESCRIPTION: "Loads the the next page on the map hud",
      },
      PREV: {
        NAME: "prev",
        DESCRIPTION: "Loads the the previous page on the map hud",
      },
    }
  }
}