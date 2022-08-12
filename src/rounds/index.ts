import { Game } from "../game";
import { GameTimer } from "../lib/timer";

export class GameRound {
  started: boolean;
  loading: boolean;
  nameRound: string = "Undefined";
  game: Game;
  time: number;
  timer: GameTimer;

  constructor (game: Game, time: number) {
    this.started = false;
    this.loading = false;
    this.game = game;
    this.time = time;
    this.timer = new GameTimer(time);
  }

  protected init() {}

  async start() {
    this.timer.startTimer(() => {}, this.time);
  }

  get name() {return this.nameRound}
}