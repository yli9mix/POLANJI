export function thresholds(
  path,
  respThreshold = 3000,
  respWaitThreshold = 2500,
  respConnectThreshold = 1500,
  respTLSThreshold = 1000,
  respRecThreshold = 1000,
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
    [`http_req_waiting{ name: ${path} }`]: [
      {
        threshold: `p(95)<${respWaitThreshold}`,
        abortOnFail: true,
        delayAbortEval: "30s",
      },
    ],
    [`http_req_connecting{ name: ${path} }`]: [
      {
        threshold: `p(95)<${respConnectThreshold}`,
        abortOnFail: true,
        delayAbortEval: "30s",
      },
    ],
    [`http_req_tls_handshaking{ name: ${path} }`]: [
      {
        threshold: `p(95)<${respTLSThreshold}`,
        abortOnFail: true,
        delayAbortEval: "30s",
      },
    ],
    [`http_req_receiving{ name: ${path} }`]: [
      {
        threshold: `p(95)<${respRecThreshold}`,
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
