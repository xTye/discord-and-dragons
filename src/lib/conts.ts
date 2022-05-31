import "dotenv/config";
import { CategoryChannel, Collection, Snowflake, StageChannel, TextChannel } from "discord.js";
import { Region } from "../locations/region";
import { Route } from "../locations/route";
import { game } from "..";
import { SikeDilemma } from "../activities/sike-dilemma";
import { Fish } from "../activities/fish";
import { PrisonersDilemma } from "../activities/prisoners-dilemma";
import { GameTimer } from "./timer";

export const CUSTOM_PLAYER_EMOJI = "PLAYEREMOJI";

export const POWERUP_MUTE_TIME = GameTimer.oneMin;


export const CLIENT_ID = process.env.CLIENT_ID ? process.env.CLIENT_ID : "";
export const GUILD_ID = process.env.GUILD_ID ? process.env.GUILD_ID : "";
export const TOKEN = process.env.TOKEN ? process.env.TOKEN : "";
export const PLAYER_ROLE_ID = process.env.PLAYER_ROLE_ID ? process.env.PLAYER_ROLE_ID : "";
export const HELP_VOICE_CHANNEL_ID = process.env.HELP_VOICE_CHANNEL_ID ? process.env.HELP_VOICE_CHANNEL_ID : "";

export const FROG = "https://i.imgur.com/QM2VmGI.jpeg";
export const COLOSSEUM = "https://i.imgur.com/WZT2IWK.jpg";
export const COLOSSEUM_EMBED = "https://cdn.discordapp.com/attachments/967515407441346683/968675120040271892/1df4cdb8f6f57eb073015a21557c5cbd.gif";
export const MAP = "https://i.imgur.com/5wpzveP.jpg";
export const HELP_GIF = "https://i.pinimg.com/originals/0c/94/82/0c94826837dfe2747f01ccd11d6c8a48.gif"





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






//HEAD Region Post https://imgur.com/a/rJVekd0
//HEAD Route Post https://imgur.com/a/pK2koPU
//HEAD Route Gif Post https://giphy.com/channel/Tye13
export const graph = {
  lair : {
    id: "970911618085027850",
    region: Region.prototype,
    setChannel(channel: StageChannel) {
      this.region = new Region(
        game,
        channel,
        "In the ruins of an ancient citadel, a dragon stares down at you. You, standing small amongst the stones and smell of sulfur.",
        "https://i.imgur.com/lCeXqiq.png",
        "https://i.pinimg.com/originals/23/95/54/2395544bff0ddf8217c28c645cf604e5.gif",
        "#84D7FE",
        { id: "980211449710411776", name: "lair" },
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
        game,
        channel,
        "https://i.imgur.com/paANsMg.png",
        "A sweat air blows through the grasses and clumps of tree. It is a warm summer afternoon, and you look down a winding trail to sheer cliffs, the dragon’s lair at your back.",
        "https://i.pinimg.com/originals/05/bd/1a/05bd1a903a9a2d65a1825a1ed9e92f0d.gif",
        "#FDFEFE",
        { id: "970562867776602142", name: "meadow" },
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
        game,
        channel,
        "https://i.imgur.com/6aERa1U.png",
        "The rock you clamber over cuts your hands; the fire burns your skin. This is a dangerous area, but the greatest offerings can be gathered on these ashen slopes.",
        "https://giffiles.alphacoders.com/148/14826.gif",
        "#6D0C0C",
        { id: "970562943794155580", name: "volcano" },
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
        game,
        channel,
        "https://i.imgur.com/9b12WCt.jpg",
        "You scan the waters in front of you, white foam and sea spray settling on your skin. The citadel sits behind you, and a cluster of rafts to your right beckon you onward.",
        "https://data.whicdn.com/images/253126566/original.gif",
        "#FAC7AC",
        { id: "970562805126299708", name: "coast" },
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
        game,
        channel,
        "https://i.imgur.com/sAWftdn.jpg",
        "An infinite abyss beckons beneath you, a chill pierces your bones. This is a dangerous area, but imagine what great plunder can be found below the waves.",
        "https://static.wixstatic.com/media/51f4b8_bae6bd08796245dd9253bb4a9ebe8d46~mv2.gif",
        "#EAF5FB",
        { id: "970562909832876082", name: "ocean" },
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
        game,
        channel,
        "https://i.imgur.com/AVLqOGl.png",
        "You scale down to the caves which wind beneath the citadel. You have chosen to test your luck in the winding tunnels, watching for the telltale gleam of your torch on gold and jewels.",
        "https://cdna.artstation.com/p/assets/images/images/045/878/648/original/bencin-studios-pixelartbackground.gif?1643753385",
        "#724489",
        { id: "970562760096251934", name: "cavern" },
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
          game,
          channel,
          GameTimer.thirtySec,
          "https://i.imgur.com/HtLQ53o.png",
          "The dry dirt underneath your feet crunches as you walk.",
          "https://media.giphy.com/media/yFCetLvlZv9ch43iq0/giphy.gif",
          "#012E40",
          { id: "975968709329977354", name: "acorn_way" },
          new Collection<Snowflake, Region>([
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
          game,
          channel,
          GameTimer.thirtySec,
          "https://i.imgur.com/T3VmNyD.png",
          "The sound of the boat answers to the waves that challeng it.",
          "https://media.giphy.com/media/DYAbMFH733sMBkZwhL/giphy.gif",
          "#DCE775",
          { id: "975968710600847430", name: "oceanside_route" },
          new Collection<Snowflake, Region>([
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
          game,
          channel,
          GameTimer.fourtyFiveSec,
          "https://i.imgur.com/sG5l6rl.jpg",
          "Rocks crumble as you sift up and through the mountainy terrain.",
          "https://media.giphy.com/media/KjODeKrxyE1S5CRhtP/giphy.gif",
          "#7F884F",
          { id: "975968710466633728", name: "crystal_pass" },
          new Collection<Snowflake, Region>([
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
          game,
          channel,
          GameTimer.thirtySec,
          "https://i.imgur.com/pjE2iP8.png",
          "The hills grow wide while looking towards the volcano.",
          "https://media.giphy.com/media/ra4mprmEoafnitBfMs/giphy.gif",
          "#A8761D",
          { id: "975968710198186014", name: "redbrick_wind" },
          new Collection<Snowflake, Region>([
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
          game,
          channel,
          GameTimer.thirtySec,
          "https://i.imgur.com/h7qdUeL.jpg",
          "You hear the sound of waves wash on the shore as you make your way through the ruffling trees.",
          "https://media.giphy.com/media/CmLpuNa5ZlDF08Zi3U/giphy.gif",
          "#FF7F69",
          { id: "975968709627752479", name: "coral_walk" },
          new Collection<Snowflake, Region>([
            [graph.coast.region.channel.id, graph.coast.region],
            [graph.ocean.region.channel.id, graph.ocean.region]
          ]),
        )
      );
    }
  },
};