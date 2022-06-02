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
    STATE: {
      NAME: "state",
      DESCRIPTION: "Manage the state of the player",
      SELECT: {
        NAME: "select",
        DESCRIPTION: "Select an option",
        JOIN: "join",
        READY: "ready",
        LEAVE: "leave",
        LOAD_DESCRIPTION: "load_description",
        SET_DESCRIPTION: "set_description",
        SYNC_MESSAGE: "sync_message",
        SYNC_VOICE: "sync_voice",
        },
      },
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
      },
    },
    VOTE: {
      NAME: "vote",
      DESCRIPTION: "Vote for a player",
      SELECT: {
        NAME: "select",
        DESCRIPTION: "Select a player to vote for",
      },
      WITH: {
        NAME: "with",
        DESCRIPTION: "Vote for a player with a number of tickets",
      }
    },
    ACTIVITY: {
      NAME: "activity",
      DESCRIPTION: "Commands for an activites",
      SELECT: {
        NAME: "select",
        DESCRIPTION: "Select a command",
        JOIN: "join",
        ROCK: "rock",
        LEAVE: "leave",
        VOTE_YES: "vote_yes",
        VOTE_NO: "vote_no",
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