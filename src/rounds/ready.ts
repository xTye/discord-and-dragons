import { Game } from "../game";
import { GameRound } from "./index";

export class ReadyRound extends GameRound {
  readyQueue: boolean[];

  constructor(game: Game, time?: number) {
    super(game, 0);

    this.readyQueue = [];
  }
}