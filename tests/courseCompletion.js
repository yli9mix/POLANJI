// CLI to run the test: k6 run -e ENV=staging -e WORKLOAD=baseline -e PASSWORD={setPassword} --summary-mode=full tests/courseCompletion.js

import { User } from "../requests/User.js";
import { Course } from "../requests/Course.js";
import { Topics } from "../requests/Topics.js";
import { scenarios } from "../config/scenarios.js";
import { thresholds } from "../config/thresholds.js";
import { env } from "../config/envs.js";
import { check, fail, sleep } from "k6";

if (env.name !== "staging") {
  fail("This test only runs in staging at the moment");
}

const { WORKLOAD } = __ENV;

export const options = {
  tags: {
    environment: env.name,
    testType: WORKLOAD,
  },
  scenarios: WORKLOAD
    ? { [WORKLOAD]: scenarios[WORKLOAD] }
    : { baseline: scenarios["baseline"] }, // run baseline test if no WORKLOAD env variable is passed
  thresholds: Object.assign(
    {},
    thresholds("createUser"),
    thresholds("userLogin"),
    thresholds("userInterests"),
    thresholds("getAllTopics"),
    thresholds("getRecommendations"),
    thresholds("getEnrolledCourses"),
    thresholds("enrollCourse"),
    thresholds("getCourseDetails"),
    thresholds("updateProgress"),
    thresholds("startQuiz"),
    thresholds("completeQuiz"),
    thresholds("getCompletedCourses"),
  ),
};

const { PASSWORD } = __ENV;
const BASE_URL = env.polanji;
const user = new User(BASE_URL);
const course = new Course(BASE_URL);
const topics = new Topics(BASE_URL);

export function courseCompletion() {
  let resp;
  let userId;
  let accessToken;
  let randomCourseId;
  let totalQuizzes;

  // 01. Creat User
  const userEmail = `performancetest09+${
    Math.floor(Math.random() * 9000) + 1000
  }@gmail.com`;
  console.log(`Username: ${userEmail}`);
  const userInfo = {
    first_name: "Performance",
    last_name: "Test",
    email: userEmail,
    password: PASSWORD,
  };
  resp = user.createUser(userInfo);

  // 02. User Login
  const loginInfo = {
    grant_type: "password",
    username: userEmail,
    password: PASSWORD,
    scope: "",
    client_id: "",
    client_secret: "",
  };
  resp = user.login(loginInfo);
  userId = resp.json("user.id");
  accessToken = resp.json("access_token");
  console.log(`userId is: ${userId}`);

  // 03. User Interests & Course Recommendation
  // Future work here. They fire up at the same time and should use k6 asyncRequest method
  resp = user.interests(accessToken);

  resp = course.getRecommendations(userId, accessToken);
  randomCourseId =
    resp.json()[Math.floor(Math.random() * resp.json().length)]["id"];
  console.log(`Random Course Id selected: ${randomCourseId}`);

  // 04. Get All Topics & Get Enrolled Courses
  // Future work here. They fire up at the same time and should use k6 asyncRequest method
  resp = topics.getAllTopics(accessToken);
  resp = course.getEnrolledCourses(userId, accessToken);

  // 05. Enroll A Random Course & Get Enrolled Courses & Get Course Details
  resp = course.enrollCourse(randomCourseId, userId, accessToken);
  resp = course.getEnrolledCourses(userId, accessToken);
  resp = course.getCourseDetails(randomCourseId, accessToken);
  totalQuizzes = Object.keys(resp.json("quiz_status")).length;

  // 06. Update Course Progress & Start Quiz & Complete Quiz
  // Update Course Progress is pretty complicated and here is a simplified version
  for (let i = 0; i < totalQuizzes; i++) {
    sleep(Math.random() * 2);
    resp = course.updateProgress(
      randomCourseId,
      Math.floor((100 * (i + 1)) / totalQuizzes),
      userId,
      accessToken,
    );
    resp = course.startQuiz(randomCourseId, i, accessToken);

    // The condition here is to handle some special situation
    if (resp.json().length !== 0) {
      // GET /section-quizzes?course_id=5&section_index=4 returns [] instead of quiz content, indicating no quiz for this section
      // In this case, POST /courses/5/sections/4/quiz-complete would return 404 {"detail": "Section quiz not found"}
      sleep(Math.random() * 3);
      resp = course.completeQuiz(randomCourseId, i, accessToken);
    }
  }

  //07. Verify the selected course was completed
  resp = user.getCompletedCourses(userId, accessToken);
  check(
    resp,
    {
      "course selected is completed": (r) =>
        r.json().find((item) => item.id === randomCourseId),
    },
    { name: "getCompletedCourses" },
  );
}
