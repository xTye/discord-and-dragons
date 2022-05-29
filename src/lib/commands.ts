export const COMMANDS = {
  HELP: {
    NAME: "help",
    DESCRIPTION: "Lists all of the commands",
    SUBCOMMANDS: {
      NAME: "state",
      READY: "ready",
      VOTE: "vote",
      SEARCH: "search",
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
        DESCRIPTION: "Join a game",
      },
      READY: {
        NAME: "ready",
        DESCRIPTION: "Ready up in game",
      },
      LEAVE: {
        NAME: "leave",
        DESCRIPTION: "Leave a game",
      },
      SETDESCRIPTION: {
        NAME: "setdescription",
        DESCRIPTION: "Leave a game",
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
    DESCRIPTION: "Used to join a game",
  },
  TIME: {
    NAME: "time",
    DESCRIPTION: "Returns the time left in the round",
  },
  TRAVEL: {
    NAME: "travel",
    DESCRIPTION: "Parent command for all things to do with location",
    SELECT: {
      NAME: "select",
      DESCRIPTION: "Select a location to travel to",
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
  ACTIVITY: {
    NAME: "activity",
    DESCRIPTION: "Commands for an activites",
    SUBCOMMANDS: {
      DO: {
        NAME: "do",
        DESCRIPTION: "Do a command",
        JOIN: "join",
        ROCK: "rock",
        YES: "yes",
        NO: "no",
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