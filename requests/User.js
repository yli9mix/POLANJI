import { ApiClient } from "../clients/ApiClient.js";

export class User extends ApiClient {
  constructor(baseUrl) {
    super(baseUrl);
    this.headers = { "Content-Type": "application/json" };
  }

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
