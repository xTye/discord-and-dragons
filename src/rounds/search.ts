import { GameRound } from ".";
import { Game } from "../game";
import { GameTimer } from "../lib/timer";

const SEARCH_TIME = GameTimer.fiveMin;

export class SearchRound extends GameRound {
  
  constructor(game: Game, time?: number) {
    super(game, time ? time : SEARCH_TIME);
  }

  protected override async init() {
    console.log("Entering search round.");
    this.loading = true;

    for (const [id, region] of this.game.regions) {
      region.newRound();
    };

    for (const [id, player] of this.game.players) {
      await player.hud.loadRoundStart();
    };
    
    this.loading = false;
  }

  override async start() {
    await this.init();
    this.timer.startTimer(() => this.game.newRound(), SEARCH_TIME);
  }
}