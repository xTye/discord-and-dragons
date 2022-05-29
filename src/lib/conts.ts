import "dotenv/config";
import { CategoryChannel, Snowflake, StageChannel, TextChannel } from "discord.js";
import { PowerUpsType, TimerType } from "./types";
import { Region } from "../locations/region";
import { Route } from "../locations/route";
import { game } from "..";
import { SikeDilemma } from "../activities/sike-dilemma";
import { Fish } from "../activities/fish";
import { PrisonersDilemma } from "../activities/prisoners-dilemma";

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
  fiveSec       : 5000,
  threeSec      : 3000,
  oneSec        : 1000,
  halfSec       : 500,
};
export const INCREMENT_MILLIS = time.oneSec;

export const CUSTOM_PLAYER_EMOJI = "PLAYEREMOJI";

export const POWERUP_MUTE_TIME = time.oneMin;

//DESC This isn't used at the current moment
export const LOST_CHANCE = 0.01;


export const CLIENT_ID = process.env.CLIENT_ID ? process.env.CLIENT_ID : "";
export const GUILD_ID = process.env.GUILD_ID ? process.env.GUILD_ID : "";
export const TOKEN = process.env.TOKEN ? process.env.TOKEN : "";
export const PLAYER_ROLE_ID = process.env.PLAYER_ROLE_ID ? process.env.PLAYER_ROLE_ID : "";


export const FROG = "https://i.imgur.com/QM2VmGI.jpeg";
export const COLOSSEUM = "https://i.imgur.com/WZT2IWK.jpg";
export const COLOSSEUM_EMBED = "https://cdn.discordapp.com/attachments/967515407441346683/968675120040271892/1df4cdb8f6f57eb073015a21557c5cbd.gif";
export const MAP = "https://i.imgur.com/5wpzveP.jpg";
export const HELP_GIF = "https://i.pinimg.com/originals/0c/94/82/0c94826837dfe2747f01ccd11d6c8a48.gif"

export const REGION_NUM = 6;

export const KILL_MESSAGES = [
  "Well played ",
  "Better luck next time ",
  "Almost ",
  "Killer work ",
  "This game sucked anyway ",
]

export const DEFAULT_DESCRIPTIONS = [
  "A noble knight who protects the weak",
  "A sneaky theif who gives to the poor",
  "A righteous lord who rules over the slums",
  "A commoner who shares the likes of many",
  "A hero who saves the day",
]

//HEAD Region Post https://imgur.com/a/rJVekd0
export const LAIR_PIC = "https://i.imgur.com/lCeXqiq.png";
export const LAIR_DESC = "In the ruins of an ancient citadel, a dragon stares down at you. You, standing small amongst the stones and smell of sulfur.";
export const LAIR_GIF = "https://i.pinimg.com/originals/23/95/54/2395544bff0ddf8217c28c645cf604e5.gif";
export const LAIR_EMOJI = { id: "980211449710411776", name: "lair" };
export const LAIR_COLOR = "#84D7FE";

export const MEADOW_PIC = "https://i.imgur.com/paANsMg.png";
export const MEADOW_DESC = "A sweat air blows through the grasses and clumps of tree. It is a warm summer afternoon, and you look down a winding trail to sheer cliffs, the dragon’s lair at your back.";
export const MEADOW_GIF = "https://i.pinimg.com/originals/05/bd/1a/05bd1a903a9a2d65a1825a1ed9e92f0d.gif";
export const MEADOW_EMOJI = { id: "970562867776602142", name: "meadow" };
export const MEADOW_COLOR = "#FDFEFE";

export const VOLCANO_PIC = "https://i.imgur.com/6aERa1U.png";
export const VOLCANO_DESC = "The rock you clamber over cuts your hands; the fire burns your skin. This is a dangerous area, but the greatest offerings can be gathered on these ashen slopes.";
export const VOLCANO_GIF = "https://giffiles.alphacoders.com/148/14826.gif";
export const VOLCANO_EMOJI = { id: "970562943794155580", name: "volcano" };
export const VOLCANO_COLOR = "#6D0C0C";

export const COAST_PIC = "https://i.imgur.com/9b12WCt.jpg";
export const COAST_DESC = "You scan the waters in front of you, white foam and sea spray settling on your skin. The citadel sits behind you, and a cluster of rafts to your right beckon you onward.";
export const COAST_GIF = "https://data.whicdn.com/images/253126566/original.gif";
export const COAST_EMOJI = { id: "970562805126299708", name: "coast" };
export const COAST_COLOR = "#FAC7AC";

export const OCEAN_PIC = "https://i.imgur.com/sAWftdn.jpg";
export const OCEAN_DESC = "An infinite abyss beckons beneath you, a chill pierces your bones. This is a dangerous area, but imagine what great plunder can be found below the waves.";
export const OCEAN_GIF = "https://static.wixstatic.com/media/51f4b8_bae6bd08796245dd9253bb4a9ebe8d46~mv2.gif";
export const OCEAN_EMOJI = { id: "970562909832876082", name: "ocean" };
export const OCEAN_COLOR = "#EAF5FB";

export const CAVERN_PIC = "https://i.imgur.com/AVLqOGl.png";
export const CAVERN_DESC = "You scale down to the caves which wind beneath the citadel. You have chosen to test your luck in the winding tunnels, watching for the telltale gleam of your torch on gold and jewels.";
export const CAVERN_GIF = "https://cdna.artstation.com/p/assets/images/images/045/878/648/original/bencin-studios-pixelartbackground.gif?1643753385";
export const CAVERN_EMOJI = { id: "970562760096251934", name: "cavern" };
export const CAVERN_COLOR = "#724489";

//HEAD Route Post https://imgur.com/a/pK2koPU
//HEAD Route Gif Post https://giphy.com/channel/Tye13
export const ACORN_WAY_PIC = "https://i.imgur.com/HtLQ53o.png";
export const ACORN_WAY_DESC = "The dry dirt underneath your feet crunches as you walk.";
export const ACORN_WAY_GIF = "https://media.giphy.com/media/yFCetLvlZv9ch43iq0/giphy.gif";
export const ACORN_WAY_EMOJI = { id: "975968709329977354", name: "acorn_way" };
export const ACORN_WAY_COLOR = "#012E40";


export const OCEANSIDE_ROUTE_PIC = "https://i.imgur.com/T3VmNyD.png";
export const OCEANSIDE_ROUTE_DESC = "The sound of the boat answers to the waves that challeng it.";
export const OCEANSIDE_ROUTE_GIF = "https://media.giphy.com/media/DYAbMFH733sMBkZwhL/giphy.gif";
export const OCEANSIDE_ROUTE_EMOJI = { id: "975968710600847430", name: "oceanside_route" };
export const OCEANSIDE_ROUTE_COLOR = "#DCE775";

export const CRYSTAL_PASS_PIC = "https://i.imgur.com/sG5l6rl.jpg";
export const CRYSTAL_PASS_DESC = "Rocks crumble as you sift up and through the mountainy terrain.";
export const CRYSTAL_PASS_GIF = "https://media.giphy.com/media/KjODeKrxyE1S5CRhtP/giphy.gif";
export const CRYSTAL_PASS_EMOJI = { id: "975968710466633728", name: "crystal_pass" };
export const CRYSTAL_PASS_COLOR = "#7F884F";

export const REDBRICK_WIND_PIC = "https://i.imgur.com/pjE2iP8.png";
export const REDBRICK_WIND_DESC = "The hills grow wide while looking towards the volcano.";
export const REDBRICK_WIND_GIF = "https://media.giphy.com/media/ra4mprmEoafnitBfMs/giphy.gif";
export const REDBRICK_WIND_EMOJI = { id: "975968710198186014", name: "redbrick_wind" };
export const REDBRICK_WIND_COLOR = "#A8761D";

export const CORAL_WALK_PIC = "https://i.imgur.com/h7qdUeL.jpg";
export const CORAL_WALK_DESC = "You hear the sound of waves wash on the shore as you make your way through the ruffling trees.";
export const CORAL_WALK_GIF = "https://media.giphy.com/media/CmLpuNa5ZlDF08Zi3U/giphy.gif";
export const CORAL_WALK_EMOJI = { id: "975968709627752479", name: "coral_walk" };
export const CORAL_WALK_COLOR = "#FF7F69";

export const playersCategory = {
  id: "967517776593965087",
  channel: CategoryChannel.prototype,
};

export const general = {
  id: "967515407441346683",
  channel: TextChannel.prototype,
};

export const help = {
  load: false,
  id: "979865270296379432",
};


export const graph = {
  lair : {
    id: "970911618085027850",
    region: Region.prototype,
    setChannel(channel: StageChannel) {
      this.region = new Region(
        channel,
        LAIR_PIC,
        LAIR_DESC,
        LAIR_GIF,
        LAIR_COLOR,
        LAIR_EMOJI,
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
    setChannel(channel: StageChannel) {
      this.region = new Region(
        channel,
        MEADOW_PIC,
        MEADOW_DESC,
        MEADOW_GIF,
        MEADOW_COLOR,
        MEADOW_EMOJI,
      );

      this.region.addActivity(new SikeDilemma(this.region));

      game.addRegion(this.region);
    }
  },
  volcano : {
    id: "970912709086425098",
    region: Region.prototype,
    setChannel(channel: StageChannel) {
      this.region = new Region(
        channel,
        VOLCANO_PIC,
        VOLCANO_DESC,
        VOLCANO_GIF,
        VOLCANO_COLOR,
        VOLCANO_EMOJI,
      );

      this.region.addActivity(new Fish(this.region));

      game.addRegion(this.region);
    }
  },
  coast : {
    id: "971606769115725864",
    region: Region.prototype,
    setChannel(channel: StageChannel) {
      this.region = new Region(
        channel,
        COAST_PIC,
        COAST_DESC,
        COAST_GIF,
        COAST_COLOR,
        COAST_EMOJI,
      );

      this.region.addActivity(new SikeDilemma(this.region));

      game.addRegion(this.region);
    }
  },
  ocean : {
    id: "971606690053103646",
    region: Region.prototype,
    setChannel(channel: StageChannel) {
      this.region = new Region(
        channel,
        OCEAN_PIC,
        OCEAN_DESC,
        OCEAN_GIF,
        OCEAN_COLOR,
        OCEAN_EMOJI,
      );

      this.region.addActivity(new Fish(this.region));

      game.addRegion(this.region);
    }
  },
  cavern : {
    id: "971608131685724242",
    region: Region.prototype,
    setChannel(channel: StageChannel) {
      this.region = new Region(
        channel,
        CAVERN_PIC,
        CAVERN_DESC,
        CAVERN_GIF,
        CAVERN_COLOR,
        CAVERN_EMOJI,
      );

      this.region.addActivity(new PrisonersDilemma(this.region));

      game.addRegion(this.region);
    }
  },

  acorn : {
    id: "971608976208846949",
    setChannel(channel: StageChannel) {
      game.routes.set(
        this.id,
        new Route(
          channel,
          LOST_CHANCE,
          time.thirtySec,
          ACORN_WAY_PIC,
          ACORN_WAY_DESC,
          ACORN_WAY_GIF,
          ACORN_WAY_COLOR,
          ACORN_WAY_EMOJI,
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
    setChannel(channel: StageChannel) {
      game.routes.set(
        this.id,
        new Route(
          channel,
          LOST_CHANCE,
          time.thirtySec,
          OCEANSIDE_ROUTE_PIC,
          OCEANSIDE_ROUTE_DESC,
          OCEANSIDE_ROUTE_GIF,
          OCEANSIDE_ROUTE_COLOR,
          OCEANSIDE_ROUTE_EMOJI,
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
    setChannel(channel: StageChannel) {
      game.routes.set(
        this.id,
        new Route(
          channel,
          LOST_CHANCE,
          time.fourtyFiveSec,
          CRYSTAL_PASS_PIC,
          CRYSTAL_PASS_DESC,
          CRYSTAL_PASS_GIF,
          CRYSTAL_PASS_COLOR,
          CRYSTAL_PASS_EMOJI,
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
    setChannel(channel: StageChannel) {
      game.routes.set(
        this.id,
        new Route(
          channel,
          LOST_CHANCE,
          time.thirtySec,
          REDBRICK_WIND_PIC,
          REDBRICK_WIND_DESC,
          REDBRICK_WIND_GIF,
          REDBRICK_WIND_COLOR,
          REDBRICK_WIND_EMOJI,
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
    setChannel(channel: StageChannel) {
      game.routes.set(
        this.id,
        new Route(
          channel,
          LOST_CHANCE,
          time.thirtySec,
          CORAL_WALK_PIC,
          CORAL_WALK_DESC,
          CORAL_WALK_GIF,
          CORAL_WALK_COLOR,
          CORAL_WALK_EMOJI,
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

export const DefaultTimer = () => ({
  milliseconds: 0,
  minutes: 0,
  seconds: 0,
  timeout: undefined,
  interval: undefined,
});

export const Random = (x: number) => Math.floor(Math.random() * x); 