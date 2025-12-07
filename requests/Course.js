import { ApiClient } from "../clients/ApiClient.js";

export class Course extends ApiClient {
  constructor(baseUrl) {
    super(baseUrl);
    this.headers = { "Content-Type": "application/json" };
  }

  // might not use this request
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
