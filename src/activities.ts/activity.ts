import { Region } from "../region";

export class RegionActivity {
  region: Region;

  constructor(region: Region) {
    this.region = region;
  }

  newRound() {}
}