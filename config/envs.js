import { fail } from "k6";

/**
 * Environment configurations for different deployment stages.
 * Add or update entries to configure base URLs for each environment.
 * @type {Object.<string, {polanji:string,domain_2:string,domain_3:string}>}
 */
const envs = {
  // This object is overbuilt to be able to run cross domain test. Most of the fields are just place holders.
  dev: {
    polanji: "",
    domain_2: "",
    domain_3: "",
  },
  qa: {
    polanji: "",
    domain_2: "",
    domain_3: "",
  },
  staging: {
    polanji: "https://api.polanji.com",
    domain_2: "",
    domain_3: "",
  },
  prod: {
    polanji: "",
    domain_2: "",
    domain_3: "",
  },
};

/**
 * Resolve and validate the current environment from `__ENV.ENV`.
 * Defaults to `staging` when the environment variable is not set.
 * @returns {{name:string,polanji:string,domain_2:string,domain_3:string}} Resolved environment config.
 */
function getEnv() {
  const envName = __ENV.ENV || "staging";
  if (!envs[envName]) {
    fail(
      `Invalid environment '${envName}'. Available envs are: ${Object.keys(
        envs,
      ).join(", ")}`,
    );
  }

  const envConfig = envs[envName];
  envConfig.name = envName;
  return envConfig;
}

/**
 * The resolved environment configuration used by the test suite.
 * @type {{name:string,polanji:string,domain_2:string,domain_3:string}}
 */
export const env = getEnv();
