/**
 * Predefined k6 scenarios used by the test runs.
 * Adjust executors, stages and targets as needed for different test loadProfiles/workLoads/testType.
 * @type {Object<string, object>}
 */
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
