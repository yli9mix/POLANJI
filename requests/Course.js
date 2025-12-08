import { ApiClient } from "../clients/ApiClient.js";

/**
 * API wrapper for courses related endpoints.
 * @extends ApiClient
 */
export class Course extends ApiClient {
  /**
   * @param {string} baseUrl - Base URL for API requests.
   */
  constructor(baseUrl) {
    super(baseUrl);
    this.headers = { "Content-Type": "application/json" };
  }

  /**
   * List all available courses.
   * @param {string} accessToken - Bearer token for authentication.
   * @returns {object} k6 HTTP response.
   */
  // did not use this request in the API sequence
  listAllCourses(accessToken) {
    const authHeaders = {
      ...this.headers,
      Authorization: `Bearer ${accessToken}`,
    };
    return this.request(
      "GET",
      "/courses",
      null,
      { headers: authHeaders, tags: { name: "listAllCourses" } },
      { "list courses status is 200": (r) => r.status === 200 },
      { name: "listAllCourses" },
    );
  }

  /**
   * Get course recommendations for a user.
   * @param {string|number} userId - User Id.
   * @param {string} accessToken - Bearer token.
   * @returns {object} k6 HTTP response.
   */
  getRecommendations(userId, accessToken) {
    const authHeaders = {
      ...this.headers,
      Authorization: `Bearer ${accessToken}`,
    };
    return this.request(
      "GET",
      `/recommendations?user_id=${userId}`,
      null,
      { headers: authHeaders, tags: { name: "getRecommendations" } },
      { "recommendations status is 200": (r) => r.status === 200 },
      { name: "getRecommendations" },
    );
  }

  /**
   * Get courses a user is currently enrolled in.
   * @param {string|number} userId - User Id.
   * @param {string} accessToken - Bearer token.
   * @returns {object} k6 HTTP response.
   */
  getEnrolledCourses(userId, accessToken) {
    const authHeaders = {
      ...this.headers,
      Authorization: `Bearer ${accessToken}`,
    };
    return this.request(
      "GET",
      `/mycourses?user_id=${userId}`,
      null,
      { headers: authHeaders, tags: { name: "getEnrolledCourses" } },
      { "my courses status is 200": (r) => r.status === 200 },
      { name: "getEnrolledCourses" },
    );
  }

  /**
   * Enroll a user in a new course.
   * @param {string|number} courseId - Course Id.
   * @param {string|number} userId - User Id.
   * @param {string} accessToken - Bearer token.
   * @returns {object} k6 HTTP response.
   */
  enrollCourse(courseId, userId, accessToken) {
    const authHeaders = {
      ...this.headers,
      Authorization: `Bearer ${accessToken}`,
    };
    const body = { course_id: courseId, user_id: userId };
    return this.request(
      "POST",
      "/enroll",
      JSON.stringify(body),
      { headers: authHeaders, tags: { name: "enrollCourse" } },
      {
        "enroll course status is 200": (r) => r.status === 200,
        "enroll course response body status property is success": (r) =>
          r.json("status") === "success",
      },
      { name: "enrollCourse" },
    );
  }

  /**
   * Retrieve details for a course.
   * @param {string|number} courseId - Course Id.
   * @param {string} accessToken - Bearer token.
   * @returns {object} k6 HTTP response.
   */
  getCourseDetails(courseId, accessToken) {
    const authHeaders = {
      ...this.headers,
      Authorization: `Bearer ${accessToken}`,
    };
    return this.request(
      "GET",
      `/courses/${courseId}`,
      null,
      { headers: authHeaders, tags: { name: "getCourseDetails" } },
      { "course details status is 200": (r) => r.status === 200 },
      { name: "getCourseDetails" },
    );
  }

  /**
   * Update a user's progress for a course.
   * @param {string|number} courseId - Course Id.
   * @param {number} progress - Progress value with percentage but without %.
   * @param {string|number} userId - User Id.
   * @param {string} accessToken - Bearer token.
   * @returns {object} k6 HTTP response.
   */
  updateProgress(courseId, progress, userId, accessToken) {
    const authHeaders = {
      ...this.headers,
      Authorization: `Bearer ${accessToken}`,
    };
    const body = { course_id: courseId, progress: progress };
    return this.request(
      "PUT",
      `/courses/update_progress`,
      JSON.stringify(body),
      { headers: authHeaders, tags: { name: "updateProgress" } },
      { "update progress status is 200": (r) => r.status === 200 },
      { name: "updateProgress" },
    );
  }

  /**
   * Start a quiz for a given section. The purpose for us is to return quiz details. Empty response means no quiz for this section
   * @param {string|number} courseId - Course Id.
   * @param {number} sectionIndex - Section index.
   * @param {string} accessToken - Bearer token.
   * @returns {object} k6 HTTP response.
   */
  startQuiz(courseId, sectionIndex, accessToken) {
    const authHeaders = {
      ...this.headers,
      Authorization: `Bearer ${accessToken}`,
    };
    return this.request(
      "GET",
      `/section-quizzes?course_id=${courseId}&section_index=${sectionIndex}`,
      null,
      { headers: authHeaders, tags: { name: "startQuiz" } },
      { "start quiz status is 200": (r) => r.status === 200 },
      { name: "startQuiz" },
    );
  }

  /**
   * Mark a quiz as complete for a section.
   * @param {string|number} courseId - Course Id.
   * @param {number} sectionIndex - Section index.
   * @param {string} accessToken - Bearer token.
   * @returns {object} k6 HTTP response.
   */
  completeQuiz(courseId, sectionIndex, accessToken) {
    const authHeaders = {
      ...this.headers,
      Authorization: `Bearer ${accessToken}`,
    };
    const path = `/courses/${courseId}/sections/${sectionIndex}/quiz-complete`;
    return this.request(
      "POST",
      path,
      null,
      { headers: authHeaders, tags: { name: "completeQuiz" } },
      { "complete quiz status is 200": (r) => r.status === 200 },
      { name: "completeQuiz" },
    );
  }
}
