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
    TRAVEL: {
      NAME: "travel",
      DESCRIPTION: "Parent command for all things to do with location",
      SELECT: {
        NAME: "select",
        DESCRIPTION: "Select a location to travel to",
      },
    },
    INVENTORY: {
      NAME: "inventory",
      DESCRIPTION: "Manage inventory",
      SELECT: {
        NAME: "select",
        DESCRIPTION: "Select an item to load",
        DETECTTICKETS: "Detect Tickets Scroll",
        SILENCE: "Silence Scroll",
      },
    },
    VOTE: {
      NAME: "vote",
      DESCRIPTION: "Vote for a player",
      SELECT: "select",
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
          VOTE: "vote",
        },
      },
    },
    STATE: {
      NAME: "state",
      DESCRIPTION: "Manage the state of the player",
      JOIN: "join",
      READY: "ready",
      LEAVE: "leave",
      SETDESCRIPTION: "setdescription",
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
    DESCRIPTION: "Start a game",
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