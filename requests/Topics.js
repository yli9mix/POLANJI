import { ApiClient } from "../clients/ApiClient.js";

export class Topics extends ApiClient {
  constructor(baseUrl) {
    super(baseUrl);
    this.headers = { "Content-Type": "application/json" };
  }

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
