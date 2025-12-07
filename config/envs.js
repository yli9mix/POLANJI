import { fail } from "k6";

const envs = {
  // This object is overbuilt to be able to run cross domain test
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

export const env = getEnv();
