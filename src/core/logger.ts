import { Injectable } from "./decorators";

enum LEVEL {
  Error,
  Warn,
  Info,
  Debug,
}

type Msg = Record<string, any>;

@Injectable()
export class Logger {
  private readonly level =
    LEVEL[process.env["LOGGER_LEVEL"] as keyof typeof LEVEL];

  public error(msg: Msg): void {
    this.log(LEVEL.Error, msg);
  }

  public warn(msg: Msg): void {
    this.log(LEVEL.Warn, msg);
  }

  public info(msg: Msg): void {
    this.log(LEVEL.Info, msg);
  }

  public debug(msg: Msg): void {
    this.log(LEVEL.Debug, msg);
  }

  private log(level: LEVEL, msg: Msg): void {
    if (level <= this.level) {
      console.log({
        level: LEVEL[level],
        timestamp: this.currentTime(),
        ...msg,
      });
    }
  }

  private currentTime(): string {
    return new Date()
      .toISOString()
      .replace(/-/g, "/")
      .replace("T", " ")
      .split(".")[0]!;
  }
}
