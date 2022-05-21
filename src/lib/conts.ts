import { CategoryChannel, Message, Snowflake, StageChannel, TextChannel } from "discord.js";
import { ERR_CODES, game } from "../game";
import { PowerUpsType, TimerType, VoteRoundType, VoteType } from "./types";
import "dotenv/config";
import { Region } from "../locations/region";
import { Route } from "../locations/route";
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
export const CAVERN_PIC = "https://i.imgur.com/AVLqOGl.png";
export const COAST_PIC = "https://i.imgur.com/9b12WCt.jpg";
export const LAIR_PIC = "https://i.imgur.com/lCeXqiq.png";
export const MEADOW_PIC = "https://i.imgur.com/paANsMg.png";
export const OCEAN_PIC = "https://i.imgur.com/sAWftdn.jpg";
export const VOLCANO_PIC = "https://i.imgur.com/6aERa1U.png";

export const LAIR_DESC = "In the ruins of an ancient citadel, a dragon stares down at you. You, standing small amongst the stones and smell of sulfur.";
export const MEADOW_DESC = "A sweat air blows through the grasses and clumps of tree. It is a warm summer afternoon, and you look down a winding trail to sheer cliffs, the dragon’s lair at your back.";
export const VOLCANO_DESC = "The rock you clamber over cuts your hands; the fire burns your skin. This is a dangerous area, but the greatest offerings can be gathered on these ashen slopes.";
export const COAST_DESC = "You scan the waters in front of you, white foam and sea spray settling on your skin. The citadel sits behind you, and a cluster of rafts to your right beckon you onward.";
export const OCEAN_DESC = "An infinite abyss beckons beneath you, a chill pierces your bones. This is a dangerous area, but imagine what great plunder can be found below the waves.";
export const CAVERN_DESC = "You scale down to the caves which wind beneath the citadel. You have chosen to test your luck in the winding tunnels, watching for the telltale gleam of your torch on gold and jewels.";

//HEAD Route Post https://imgur.com/a/pK2koPU
export const ACORN_WAY_PIC = "https://i.imgur.com/HtLQ53o.png";
export const ACORN_WAY_DESC = "The dry dirt underneath your feet crunches as you walk.";
export const ACORN_WAY_GIF = "https://64.media.tumblr.com/6f975693e2cca0aff043b40cec175302/147a3f82059bc008-06/s540x810/c8ab1b2ccb8a1482ec1ae71ed66d93f52b9276ea.gifv";

export const CORAL_WALK_PIC = "https://i.imgur.com/h7qdUeL.jpg";
export const CORAL_WALK_DESC = "You hear the sound of waves wash on the shore as you make your way through the ruffling trees.";
export const CORAL_WALK_GIF = "https://cdnb.artstation.com/p/assets/images/images/037/263/051/original/karina-formanova-rainforest-animation.gif";

export const CRYSTAL_PASS_PIC = "https://i.imgur.com/sG5l6rl.jpg";
export const CRYSTAL_PASS_DESC = "Rocks crumble as you sift up and through the mountainy terrain.";
export const CRYSTAL_PASS_GIF = "https://64.media.tumblr.com/tumblr_m5e4ioVQsj1qbzzgco1_1280.gifv";

export const OCEANSIDE_ROUTE_PIC = "https://i.imgur.com/T3VmNyD.png";
export const OCEANSIDE_ROUTE_GIF = "https://media0.giphy.com/media/l4FGxh9oeMtEeSFJ6/giphy.gif";
export const OCEANSIDE_ROUTE_DESC = "The sound of the boat answers to the waves that challeng it.";

export const REDBRICK_WIND_PIC = "https://i.imgur.com/pjE2iP8.png";
export const REDBRICK_WIND_DESC = "The hills grow wide while looking towards the volcano.";
export const REDBRICK_WIND_GIF = "https://64.media.tumblr.com/255799370c3933b0f11a7a8e3fb0c238/tumblr_o2w5ji11ES1uqr9h0o1_1280.gifv";


export const FISHING_GIF = "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/0ab4b036812305.572a1cada9fdc.gif";


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
};




export const graph = {
  lair : {
    id: "970911618085027850",
    region: Region.prototype,
    set setChannel(channel: StageChannel) {
      this.region = new Region(
        channel,
        LAIR_PIC,
        LAIR_DESC,
      );

      game.addRegion(
        this.region,
        this.region,
        this.region,
      );
    }
  },
  meadow : {
    id: "971606879568543804",
    region: Region.prototype,
    set setChannel(channel: StageChannel) {
      this.region = new Region(
        channel,
        MEADOW_PIC,
        MEADOW_DESC,
      );

      game.addRegion(this.region);
    }
  },
  volcano : {
    id: "970912709086425098",
    region: Region.prototype,
    set setChannel(channel: StageChannel) {
      this.region = new Region(
        channel,
        VOLCANO_PIC,
        VOLCANO_DESC,
      );

      game.addRegion(this.region);
    }
  },
  coast : {
    id: "971606769115725864",
    region: Region.prototype,
    set setChannel(channel: StageChannel) {
      this.region = new Region(
        channel,
        COAST_PIC,
        COAST_DESC,
      );

      game.addRegion(this.region);
    }
  },
  ocean : {
    id: "971606690053103646",
    region: Region.prototype,
    set setChannel(channel: StageChannel) {
      this.region = new Region(
        channel,
        OCEAN_PIC,
        OCEAN_DESC,
      );

      game.addRegion(this.region);
    }
  },
  cavern : {
    id: "971608131685724242",
    region: Region.prototype,
    set setChannel(channel: StageChannel) {
      this.region = new Region(
        channel,
        CAVERN_PIC,
        CAVERN_DESC,
      );

      game.addRegion(this.region);
    }
  },

  acorn : {
    id: "971608976208846949",
    set setChannel(channel: StageChannel) {
      game.routes.set(
        this.id,
        new Route(
          channel,
          LOST_CHANCE,
          TRAVEL_TIME,
          ACORN_WAY_PIC,
          ACORN_WAY_DESC,
          new Map<Snowflake, Region>([
            [graph.lair.region.channel.id, graph.lair.region],
            [graph.meadow.region.channel.id, graph.meadow.region]
          ]),
        )
      );
    }
  },
  oceanside : {
    id: "971609334276554852",
    set setChannel(channel: StageChannel) {
      game.routes.set(
        this.id,
        new Route(
          channel,
          LOST_CHANCE,
          TRAVEL_TIME,
          OCEANSIDE_ROUTE_PIC,
          OCEANSIDE_ROUTE_DESC,
          new Map<Snowflake, Region>([
            [graph.lair.region.channel.id, graph.lair.region],
            [graph.coast.region.channel.id, graph.coast.region]
          ]),
        )
      );
    }
  },
  crystal : {
    id: "971609833214210118",
    set setChannel(channel: StageChannel) {
      game.routes.set(
        this.id,
        new Route(
          channel,
          LOST_CHANCE,
          TRAVEL_TIME,
          CRYSTAL_PASS_PIC,
          OCEANSIDE_ROUTE_DESC,
          new Map<Snowflake, Region>([
            [graph.lair.region.channel.id, graph.lair.region],
            [graph.cavern.region.channel.id, graph.cavern.region]
          ]),
        )
      );
    }
  },
  redbrick : {
    id: "971609607581601802",
    set setChannel(channel: StageChannel) {
      game.routes.set(
        this.id,
        new Route(
          channel,
          LOST_CHANCE,
          TRAVEL_TIME,
          REDBRICK_WIND_PIC,
          REDBRICK_WIND_DESC,
          new Map<Snowflake, Region>([
            [graph.meadow.region.channel.id, graph.meadow.region],
            [graph.volcano.region.channel.id, graph.volcano.region]
          ]),
        )
      );
    }
  },
  coral : {
    id: "971609385061199902",
    set setChannel(channel: StageChannel) {
      game.routes.set(
        this.id,
        new Route(
          channel,
          LOST_CHANCE,
          TRAVEL_TIME,
          CORAL_WALK_PIC,
          COAST_DESC,
          new Map<Snowflake, Region>([
            [graph.coast.region.channel.id, graph.coast.region],
            [graph.ocean.region.channel.id, graph.ocean.region]
          ]),
        )
      );
    }
  },
};

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