/**
 * Build a thresholds object to trigger individual per request sub-metrics, which k6 lacks.
 * @param {string} path - The logical name used in metric tags for this threshold (used in the `name` tag).
 * @param {number} [respThreshold=3000] - Max p95 response duration in ms for `http_req_duration`.
 * @param {number} [respWaitThreshold=2500] - Max p95 waiting time in ms for `http_req_waiting`.
 * @param {number} [respRecThreshold=1000] - Max p95 receiving time in ms for `http_req_receiving`.
 * @param {number} [failThreshold=0.05] - Maximum allowed failure rate for the request.
 * @param {number} [checkThreshold=0.95] - Minimum required pass rate for checks.
 * @returns {Object} k6 thresholds object scoped to the provided path/name/endpoint.
 */
export function thresholds(
  path,
  respThreshold = 3000,
  respWaitThreshold = 2500,
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
