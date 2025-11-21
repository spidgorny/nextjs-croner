import { Cron, CronOptions } from 'croner';

export interface CronJob {
  name?: string;
  pattern: string;
  handler: () => void | Promise<void>;
  options?: CronOptions;
}

export interface CronJobInstance {
  name?: string;
  job: ReturnType<typeof Cron>;
}

export { CronOptions };
