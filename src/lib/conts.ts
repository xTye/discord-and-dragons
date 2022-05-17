import { CategoryChannel, Message, StageChannel, TextChannel } from "discord.js";
import { ERR_CODES } from "../game";
import { Player } from "../player";
import { PowerUpsType, TimerType, VoteRoundType, VoteType } from "./types";
import "dotenv/config";
import { Region, Route } from "../region";
export const time = {
  fifteenMin    : 900000,
  tenMin        : 600000,
  fiveMin       : 300000,
  twoMin        : 120000,
  oneMin        : 60000,
  fourtyFiveSec : 45000,
  thirtySec     : 30000,
  twentySec     : 20000,
  fifteenSec    : 15000,
  tenSec        : 10000,
};

export const MAX_PLAYERS = 8;
export const MAX_ROUNDS = 2;
export const MAX_TIES = 2;
export const STARTING_ROUND = true;
export const INCREMENT_MILLIS = 5000;


export const SEARCH_TIME = time.fiveMin;
//! These aren't actually used at this current moment.
export const TEIR3_SEARCH_PROB = 0.1;
export const TIER2_PROB = 0.01;
export const TIER1_SEARCH_PROB = 0.1;
export const POWERUP_MUTE_TIME = time.oneMin;


export const TRAVEL_TIME = time.thirtySec;
//DESC This isn't used at the current moment
export const LOST_CHANCE = 0.01


export const VOTE_TIME = time.twoMin;
export const TICKET_INC_IMMUNE = 1;
export const TICKET_INC_DEATH = 1;
export const LAST_WORDS = time.tenSec;


export const CLIENT_ID = process.env.CLIENT_ID ? process.env.CLIENT_ID : "";
export const GUILD_ID = process.env.GUILD_ID ? process.env.GUILD_ID : "";
export const TOKEN = process.env.TOKEN ? process.env.TOKEN : "";
export const PLAYER_ROLE_ID = process.env.PLAYER_ROLE_ID ? process.env.PLAYER_ROLE_ID : "";


export const FROG = "https://i.imgur.com/QM2VmGI.jpeg";
export const COLOSSEUM = "https://i.imgur.com/WZT2IWK.jpg";
export const MAP = "https://i.imgur.com/5wpzveP.jpg";

export const REGION_NUM = 6;

//HEAD Region Post https://imgur.com/a/rJVekd0
export const CAVERN = "https://i.imgur.com/AVLqOGl.png";
export const COAST = "https://i.imgur.com/9b12WCt.jpg";
export const LAIR = "https://i.imgur.com/lCeXqiq.png";
export const MEADOW = "https://i.imgur.com/paANsMg.png";
export const OCEAN = "https://i.imgur.com/sAWftdn.jpg";
export const VOLCANO = "https://i.imgur.com/6aERa1U.png";

export const LAIR_DESC = "In the ruins of an ancient citadel, a dragon stares down at you. You, standing small amongst the stones and smell of sulfur.";
export const MEADOW_DESC = "A sweat air blows through the grasses and clumps of tree. It is a warm summer afternoon, and you look down a winding trail to sheer cliffs, the dragon’s lair at your back.";
export const VOLCANO_DESC = "The rock you clamber over cuts your hands; the fire burns your skin. This is a dangerous area, but the greatest offerings can be gathered on these ashen slopes.";
export const COAST_DESC = "You scan the waters in front of you, white foam and sea spray settling on your skin. The citadel sits behind you, and a cluster of rafts to your right beckon you onward.";
export const OCEAN_DESC = "An infinite abyss beckons beneath you, a chill pierces your bones. This is a dangerous area, but imagine what great plunder can be found below the waves.";
export const CAVERN_DESC = "You scale down to the caves which wind beneath the citadel. You have chosen to test your luck in the winding tunnels, watching for the telltale gleam of your torch on gold and jewels.";

//HEAD Route Post https://imgur.com/a/pK2koPU
export const ACORN_WAY = "https://i.imgur.com/HtLQ53o.png";
export const CORAL_WALK = "https://i.imgur.com/h7qdUeL.jpg";
export const CRYSTAL_PASS = "https://i.imgur.com/sG5l6rl.jpg";
export const OCEANSIDE_ROUTE = "https://i.imgur.com/T3VmNyD.png";
export const REDBRICK_WIND = "https://i.imgur.com/pjE2iP8.png";




export const playersCategory = {
  id: "967517776593965087",
  channel: CategoryChannel.prototype,
  set setChannel(channel: CategoryChannel) {
    this.channel = channel;
  },
};

export const general = {
  id: "967515407441346683",
  channel: TextChannel.prototype,
  set setChannel(channel: TextChannel) {
    this.channel = channel;
  },
  message: Message.prototype,
  set setMessage(message: Message) {
    this.message = message;
  }
};



export const graph = {
  dragonsLair : {
    id: "970911618085027850",
    name: "🐉Lair",
    region: Region.prototype,
    set setChannel(channel: StageChannel) {
      this.region = new Region(channel, LAIR, LAIR_DESC)
    }
  },
  tier1Red : {
    id: "971606879568543804",
    name: "🥦Meadow",
    region: Region.prototype,
    set setChannel(channel: StageChannel) {
      this.region = new Region(channel, MEADOW, MEADOW_DESC)
    }
  },
  tier3Red : {
    id: "970912709086425098",
    name: "🌋Volcano",
    region: Region.prototype,
    set setChannel(channel: StageChannel) {
      this.region = new Region(channel, VOLCANO, VOLCANO_DESC)
    }
  },
  tier1Blue : {
    id: "971606769115725864",
    name: "🌴Coast",
    region: Region.prototype,
    set setChannel(channel: StageChannel) {
      this.region = new Region(channel, COAST, COAST_DESC)
    }
  },
  tier3Blue : {
    id: "971606690053103646",
    name: "🌊Ocean",
    region: Region.prototype,
    set setChannel(channel: StageChannel) {
      this.region = new Region(channel, OCEAN, OCEAN_DESC)
    }
  },
  tier2Yellow : {
    id: "971608131685724242",
    name: "🪨Cavern",
    region: Region.prototype,
    set setChannel(channel: StageChannel) {
      this.region = new Region(channel, CAVERN, CAVERN_DESC)
    }
  },

  lairToRed : {
    id: "971608976208846949",
    name: "🌍Acorn Way",
    route: Route.prototype,
    set setChannel(channel: StageChannel) {
      this.route = new Route(channel, LOST_CHANCE, TRAVEL_TIME, ACORN_WAY)
    }
  },
  lairToBlue : {
    id: "971609334276554852",
    name: "🌍Oceanside Route",
    route: Route.prototype,
    set setChannel(channel: StageChannel) {
      this.route = new Route(channel, LOST_CHANCE, TRAVEL_TIME, OCEANSIDE_ROUTE)
    }
  },
  lairToYellow : {
    id: "971609833214210118",
    name: "🌍Crystal Pass",
    route: Route.prototype,
    set setChannel(channel: StageChannel) {
      this.route = new Route(channel, LOST_CHANCE, time.tenSec, CRYSTAL_PASS)
    }
  },
  redToRed : {
    id: "971609607581601802",
    name: "🌍Redbrick Wind",
    route: Route.prototype,
    set setChannel(channel: StageChannel) {
      this.route = new Route(channel, LOST_CHANCE, TRAVEL_TIME, REDBRICK_WIND)
    }
  },
  blueToBlue : {
    id: "971609385061199902",
    name: "🌍Coral Walk",
    embed: {
      field: {
        name: "Lair",
        value: "In the ruins of an ancient citadel, a dragon stares down at you. You, standing small amongst the stones and smell of sulfur.",
      },
    },
    route: Route.prototype,
    set setChannel(channel: StageChannel) {
      this.route = new Route(channel, LOST_CHANCE, TRAVEL_TIME, CORAL_WALK)
    }
  },
};

export const inQueue: boolean[] = [];

export function convertTimer(milliseconds: number): TimerType {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.ceil((milliseconds - (minutes * 60000)) / 1000);
  
  return {
    milliseconds,
    minutes,
    seconds,
  }
};

export const DefaultPowerUps: PowerUpsType = {
  checkTickets: 0,
  mute: 0,
  prioritySpeak: 0,
};

export const DefaultTimer: TimerType = {
  milliseconds: 0,
  minutes: 0,
  seconds: 0,
  timeout: undefined,
  interval: undefined,
};

export const DefaultVoteRound: VoteRoundType = { 
  err: ERR_CODES.DEFAULT,
  ties: 0,
  player: "",
  immuneRound: true,
};

export function DefaultVotes() {
  return new Map<string, VoteType>();
};


export function DefaultVotesPerPlayer() {
  return new Map<string, number>();
};

export function Shuffle(array: any[]) {
  let r = [];

  while (array.length != 0)
    r.push(array.splice(Math.floor(Math.random() * array.length), 1)[0]);

  return r;
}