export const scenarios = {
  baseline: {
    executor: "ramping-vus",
    exec: "courseCompletion",
    stages: [
      { duration: "30s", target: 2 },
      { duration: "1m", target: 5 },
      { duration: "30s", target: 0 },
    ],
    gracefulRampDown: "15s",
  },
  stress: {
    executor: "ramping-vus",
    exec: "courseCompletion",
    stages: [
      {
        duration: "3m",
        target: 20,
      },
    ],
    gracefulStop: "35s",
  },
};
