export class GameTimer {
  static fifteenMin    = 900000;
  static tenMin        = 600000;
  static fiveMin       = 300000;
  static twoMin        = 120000;
  static oneMin        = 60000;
  static fourtyFiveSec = 45000;
  static thirtySec     = 30000;
  static twentySec     = 20000;
  static fifteenSec    = 15000;
  static tenSec        = 10000;
  static fiveSec       = 5000;
  static threeSec      = 3000;
  static twoSec        = 2000;
  static oneSec        = 1000;
  static halfSec       = 500;
  private static INCREMENT_MILLIS = GameTimer.oneSec;

  private milliseconds: number;
  private minutes: number;
  private seconds: number;
  private timeout?: NodeJS.Timeout;
  private interval?: NodeJS.Timer;

  get getMillis() { return this.milliseconds; }
  
  get string() {
    return `${this.minutes}:${this.seconds < 10 ? "0" + this.seconds : this.seconds}`;
  }

  private set setMilliseconds(milliseconds: number) {
    this.milliseconds = milliseconds ? milliseconds : 0;
    this.minutes = Math.floor(milliseconds / GameTimer.oneMin);
    this.seconds = Math.ceil((milliseconds - (this.minutes * GameTimer.oneMin)) / GameTimer.oneSec);
  }

  constructor(milliseconds?: number) {
    this.milliseconds = milliseconds ? milliseconds : 0;
    this.minutes = Math.floor(this.milliseconds / GameTimer.oneMin);
    this.seconds = Math.ceil((this.milliseconds - (this.minutes * GameTimer.oneMin)) / GameTimer.oneSec);
  }

  startInterval(milliseconds: number) {
    this.milliseconds = milliseconds;

    this.interval = setInterval(() => {
      this.milliseconds = this.milliseconds - GameTimer.INCREMENT_MILLIS;
    }, GameTimer.INCREMENT_MILLIS);
  }

  stopInterval() {
    clearInterval(this.interval);
  }

  customInterval(func: () => void, milliseconds: number) {
    this.setMilliseconds = milliseconds;
    setInterval(func, milliseconds);
  }

  startTimer(func: () => void, milliseconds: number) {
    this.startInterval(milliseconds);
    setTimeout(() => {this.stopInterval()}, milliseconds);
    this.timeout = setTimeout(func, milliseconds);
  }

  stopTimer() {
    clearTimeout(this.timeout);
    clearInterval(this.interval);
    this.setMilliseconds = 0;
  }
}