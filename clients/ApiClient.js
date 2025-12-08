import http from "k6/http";
import { check } from "k6";
import { Counter } from "k6/metrics";

// ref: https://grafana.com/docs/k6/latest/javascript-api/k6-metrics/counter/
const errors = new Counter("errors");

// ref: https://grafana.com/docs/k6/latest/examples/error-handler/
/**
 * Simple error handling helper used by API client wrappers.
 * @private
 */
class ErrorHandler {
  /**
   * Log an API error and record a k6 Counter custom metric when a check fails.
   * @param {boolean} isError - True when the response should be treated as an error.
   * @param {object} res - The raw response object returned by `k6/http`.
   * @param {object} [tags={}] - Additional metadata to include with the error metric.
   * @returns {void}
   */
  logError(isError, res, tags = {}) {
    if (!isError) return;

    const errorData = Object.assign(
      {
        url: res.url,
        status: res.status,
        error_code: res.error_code,
        method: res.request.method,
        response_body: res.body,
      },
      tags,
    );

    console.error(`API Error detected: ${JSON.stringify(errorData)}`);
    errors.add(1, errorData);
  }
}

const errorHandler = new ErrorHandler();

/**
 * Base API client used by request wrappers.
 * Provides a thin wrapper around `k6/http` that performs requests and runs basic checks.
 */
export class ApiClient {
  /**
   * Create a new ApiClient.
   * @param {string} baseUrl - The base URL to prefix to request paths.
   */
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.errorHandler = errorHandler;
  }

  /**
   * Perform an HTTP request using `k6/http` and validate the response with checks.
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.).
   * @param {string} path - Path appended to the baseUrl for the request.
   * @param {string|Object|null} body - Request body.
   * @param {object} params - Request params passed to `k6/http` (headers, tags, etc.).
   * @param {object} checks - A mapping of check names to functions used by k6 check() function.
   * @param {object} checkTag - Optional tag object passed to k6 check() for tagging.
   * @returns {object} The raw response object returned by `k6/http`.
   */
  request(method, path, body, params, checks, checkTag) {
    const url = `${this.baseUrl}${path}`;
    const res = http.request(method, url, body ? body : null, params);

    const checkStatus = check(res, checks, checkTag);

    this.errorHandler.logError(!checkStatus, res);

    return res;
  }
}
