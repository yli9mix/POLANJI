import http from "k6/http";
import { check } from "k6";
import { Counter } from "k6/metrics";

// ref: https://grafana.com/docs/k6/latest/javascript-api/k6-metrics/counter/
const errors = new Counter("errors");

// ref: https://grafana.com/docs/k6/latest/examples/error-handler/
class ErrorHandler {
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

export class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.errorHandler = errorHandler;
  }

  request(method, path, body, params, checks, checkTag) {
    const url = `${this.baseUrl}${path}`;
    const res = http.request(method, url, body ? body : null, params);

    const checkStatus = check(res, checks, checkTag);

    this.errorHandler.logError(!checkStatus, res);

    return res;
  }
}
