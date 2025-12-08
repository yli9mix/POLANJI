import { ApiClient } from "../clients/ApiClient.js";

/**
 * API wrapper for topics related endpoints.
 * @extends ApiClient
 */
export class Topics extends ApiClient {
  /**
   * @param {string} baseUrl - Base URL for API requests.
   */
  constructor(baseUrl) {
    super(baseUrl);
    this.headers = { "Content-Type": "application/json" };
  }

  /**
   * Retrieve the list of all topics.
   * @param {string} accessToken - Bearer token for authentication.
   * @returns {object} k6 HTTP response.
   */
  getAllTopics(accessToken) {
    const authHeaders = {
      ...this.headers,
      Authorization: `Bearer ${accessToken}`,
    };
    return this.request(
      "GET",
      "/topics",
      null,
      { headers: authHeaders, tags: { name: "getAllTopics" } },
      { "get all topics status is 200": (r) => r.status === 200 },
      { name: "getAllTopics" },
    );
  }
}
