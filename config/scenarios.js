export const scenarios = {
  load: {
    executor: "ramping-vus",
    exec: "courseCompletion",
    stages: [
      { duration: "1m", target: 2 },
      { duration: "1m", target: 5 },
      { duration: "1m", target: 0 },
    ],
    gracefulRampDown: "15s",
  },

  stress: {
    executor: "ramping-arrival-rate",
    exec: "courseCompletion",
    stages: [
      {
        duration: "3m",
        target: 20,
      },
    ],
  },

  smoke: {
    executor: "per-vu-iterations",
    exec: "courseCompletion",
    vus: 1,
    iterations: 1,
  },
};
