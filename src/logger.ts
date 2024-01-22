enum LEVEL {
  Error,
  Warn,
  Info,
  Debug,
}

type Msg = Record<string, any>;

class Logger {
  private readonly level: LEVEL;

  constructor(level: LEVEL) {
    this.level = level;
  }

  error(msg: Msg): void {
    this.log(LEVEL.Error, msg);
  }

  warn(msg: Msg): void {
    this.log(LEVEL.Warn, msg);
  }

  info(msg: Msg): void {
    this.log(LEVEL.Info, msg);
  }

  debug(msg: Msg): void {
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

export const logger = new Logger(
  LEVEL[process.env["LOGGER_LEVEL"] as keyof typeof LEVEL]
);
