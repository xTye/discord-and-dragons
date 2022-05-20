import { GameLocation } from "../locations";

export class RegionActivity {
  region: GameLocation;

  constructor(region: GameLocation) {
    this.region = region;
  }

  newRound() {}
}