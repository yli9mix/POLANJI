import { ApiClient } from "../clients/ApiClient.js";

/**
 * API wrapper for user related endpoints.
 * @extends ApiClient
 */
export class User extends ApiClient {
  /**
   * @param {string} baseUrl - Base URL for API requests.
   */
  constructor(baseUrl) {
    super(baseUrl);
    this.headers = { "Content-Type": "application/json" };
  }

  /**
   * Create a new user.
   * @param {object} userData - Payload required to create a new user.
   * @returns {object} k6 HTTP response.
   */
  createUser(userData) {
    return this.request(
      "POST",
      "/users/",
      JSON.stringify(userData),
      { headers: this.headers, tags: { name: "createUser" } },
      {
        "create user status is 201": (r) => r.status === 201,
      },
      { name: "createUser" },
    );
  }

  /**
   * Log in a user with form-encoded credentials.
   * @param {string} credentials - Form-encoded credentials string.
   * @returns {object} k6 HTTP response.
   */
  login(credentials) {
    return this.request(
      "POST",
      "/log_in",
      credentials,
      {
        headers: {
          ...this.headers,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        tags: { name: "userLogin" },
      },
      {
        "login status is 200": (r) => r.status === 200,
        "auth token available": (r) => r.json() && r.json("access_token"),
      },
      { name: "userLogin" },
    );
  }

  /**
   * Retrieve a user's interests.
   * @param {string} accessToken - Bearer token for authentication.
   * @returns {object} k6 HTTP response.
   */
  interests(accessToken) {
    const authHeaders = {
      ...this.headers,
      Authorization: `Bearer ${accessToken}`,
    };
    return this.request(
      "GET",
      "/users/interests",
      null,
      { headers: authHeaders, tags: { name: "userInterests" } },
      { "interests status is 200": (r) => r.status === 200 },
      { name: "userInterests" },
    );
  }

  /**
   * Get the list of all courses completed by a user.
   * @param {string|number} userId - User Id.
   * @param {string} accessToken - Bearer token.
   * @returns {object} k6 HTTP response.
   */
  getCompletedCourses(userId, accessToken) {
    const authHeaders = {
      ...this.headers,
      Authorization: `Bearer ${accessToken}`,
    };
    return this.request(
      "GET",
      `/users/${userId}/completed-courses`,
      null,
      { headers: authHeaders, tags: { name: "getCompletedCourses" } },
      {
        "getCompletedCourses status is 200": (r) => r.status === 200,
      },
      { name: "getCompletedCourses" },
    );
  }

  // might add deleteUser here
}
