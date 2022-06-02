import { GameRound } from ".";
import { Game } from "../game";
import { GameTimer } from "../lib/timer";

const SEARCH_TIME = GameTimer.fiveMin;

export class SearchRound extends GameRound {
  
  constructor(game: Game, time?: number) {
    super(game, time ? time : SEARCH_TIME);
  }

  protected override init() {
    console.log("Entering search round.");
    this.loading = true;

    this.game.regions.forEach((region, id) => {
      region.newRound();
    });

    this.game.players.forEach((player, id) => {
      player.hud.loadSearchStart();
    });
    this.loading = false;
  }

  override start() {
    this.init();
    this.timer.startTimer(() => this.game.newRound(), SEARCH_TIME);
  }
}