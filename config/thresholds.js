export function thresholds(
  path,
  respThreshold = 3000,
  failThreshold = 0.05,
  checkThreshold = 0.95,
) {
  return {
    [`http_req_duration{ name: ${path} }`]: [
      {
        threshold: `p(95)<${respThreshold}`,
        abortOnFail: true,
        delayAbortEval: "30s",
      },
    ],
    [`http_reqs{ name: ${path} }`]: ["count>=0"], //dummy threshold to get sub-metrics
    [`http_req_failed{ name: ${path} }`]: [
      {
        threshold: `rate<=${failThreshold}`,
        abortOnFail: true,
        delayAbortEval: "30s",
      },
    ],
    [`checks{ name: ${path} }`]: [
      {
        threshold: `rate>=${checkThreshold}`,
        abortOnFail: true,
        delayAbortEval: "30s",
      },
    ],
  };
}
