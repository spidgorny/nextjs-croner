import { CronOptions } from 'croner';

export interface CronJob {
  name?: string;
  pattern: string;
  handler: () => void | Promise<void>;
  options?: CronOptions;
}

export type { CronOptions };
