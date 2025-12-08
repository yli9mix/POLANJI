# DEMO PROJECT

## Directory Structure

```bash
├── .github
│   └── workflows
│       └── simple.yml
├── clients
│   └── ApiClient.js
├── config
│   ├── envs.js
│   ├── scenarios.js
│   └── thresholds.js
├── requests
│   ├── Course.js
│   ├── Topics.js
│   └── User.js
├── screenshots
│   ├── Demo Baseline Test Summary 1.png
│   ├── Demo Baseline Test Summary 2.png
│   ├── Demo Stress Test Summary 1.png
│   └── Demo Stress Test Summary 2.png
├── tests
│   └── courseCompletion.js
├── .gitignore
└── README.md
```

## User Journey

Note: some steps have multiple requests because browser indicates some actions always have these requests go together

1. Creat User
2. User Login
3. User Interests & Course Recommendation
4. Get All Topics & Get Enrolled Courses
5. Enroll A Random Course & Get Enrolled Courses & Get Course Details
6. (loop) Update Course Progress & Start Quiz & Complete Quiz
7. Verify the selected course was completed

## Root Cause Analysis (RCA) Report

Black box performance testing is really old school and modern performance tests nowadays rely heavily on server side observability, metrics, logging and traces.

Assuming our hands are tight and let's simulate a situation that we only have `k6` client side metrics available. We also need to assume we keep an close eye on load generator health and everything is normal with regular resource utilization on the test runner side, ruling out client side issue. Let's focus on the p(95) of [k6 HTTP-specific built-in metrics](https://grafana.com/docs/k6/latest/using-k6/metrics/reference/#http), for both overall and individual API requests (test in this repo has individual per request sub-metrics triggered).

Say during our stress/breakpoint test:

- Case 1:

  - case 1 symptoms : one or only few endpoints became significant slower than others in terms of `http_req_duration`, compared to their basline; `http_req_waiting`/TTFB sees most of the slowdown for these few endpoints; other http breakdown metrics are relatively low across the board
  - case 1 analysis: high `http_req_waiting` and `http_req_duration` only to 1 or a few endpoints could indicate we are facing isolated backend issue, which could be inefficient code. Database is likely a shared service across the board so connection pool is probably fine; other http metrics like `http_req_receiving` and `http_req_connecting` remain low could mean network isn't the issue here. Therefore, we are more than likely be dealing with inefficient code for the specific API(s), since the system globally is not affected

- Case 2:

  - case 2 symptoms: `http_req_duration` and `http_req_waiting`/TTFB is through the roof for multiple seemingly not so closely related endpoints and `http_req_failed` rate increases for many endpoints;
  - case 2 analysis: if multiple endpoints are all impacted with symptoms described above, it is likely database issue, indicating database connection pool running out or so

- Case 3:
  - case 3 symptoms: `http_req_connecting`, `http_req_tls_handshaking`, and `http_req_receiving` are extremely high; `k6` starts throwing 1000 to 1399 code (see k6 specific error codes [here](https://grafana.com/docs/k6/latest/javascript-api/error-codes/)); `k6` starts throwing `read: connection reset by peer` or `dial tcp xx.xx.xx.xx:xx: i/o timeout`
  - case 3 analysis: `http_req_receiving` could mean high return packet loss and along with slow `http_req_connecting` and `http_req_tls_handshaking`, pretty much guarantee we are facing firewall misconfig, overwhelmed network circuit or other network issue. Also many of the `k6` specific error codes within that range are DNS, TCP and TLS related network code. `read: connection reset by peer` in `k6` means system under test has been resetting TCP connection, which could be load balancer issue. `dial tcp xx.xx.xx.xx:xx: i/o timeout` means `k6` couldn't even establish a TCP connection with the system under test. These all indicate infra/network related problems

The demo [stress](https://github.com/yli9mix/POLANJI/actions/runs/20016778064/job/57395927606#step:4:461) and [baseline](https://github.com/yli9mix/POLANJI/actions/runs/20016585368/job/57395413804#step:4:299) test run comparison (also check out directory `screenshots` for some after test summary metrics) show:

- `http_req_duration` almost doubled in 'stress' demo test across all endpoints;
- `http_req_waiting` almost doubled in 'stress' demo test across all endpoints;
- `http_req_receiving`, `http_req_tls_handshaking` metrics are around the same for both demo tests;
- `http_req_sending` is actually a bit faster with 'stress' demo
- both with zero failures
  Conclusion: so obviously we were not able to reach breakpoint with the demo 'stress' test. What we have seen here is probably the sample application's MongoDb database and/or application server pods being undersized with normal slowdown. This is close to our Case 2 discussed above.

## Architectural & Operational Documentation

In general, API performance tests should only be running from local as quick script verification. Actual tests should pretty much always be running from and against controlled environments, meaning no matter if tests are kicked off from Ci agents (better to be self-hosted) or dedicated EC2 instance, or k8s clusters and etc as runners or load generators, we would want them to be as consistent as possible performance-wise, and meanwhile monitor runner agents closely; also in most cases, tests should be running against stable and controlled environments that are as production like as possible, especially for large scale stress and breakpoint tests. There is nothing wrong testing early even in dev or qa environements to catch regressions as soon as possible on the other hand.

Results and metrics tagging is a broad topic. In general:

- Client side metrics collected need to be able to correlate with server side metrics. Tagging and sending over metrics like `trace_id` from traceparent request header would help establish full stack tracing tremendously
- Client side metrics tagging should follow the same naming convention as for server side
- Test execution info should be set globally in `k6 options`, where I included 2 examples sending over `testType/workLoad/loadProfile`(e.g. `smoke`, `baseline`, `stress` and etc), and target `environment`(e.g. `dev`, `qa`, `demo`, `staging`, `prod` and so on). There are other tags like `test_name`, `test_run_id`(can be passed by Ci), application under test version info like `git_commit`(can be passed by Ci)
- `k6` already set many tags by default. I added tags for each endpoint with endpoint path/name in every single request and checks in this repo, triggering individual per request sub-metrics.
- When building customized solutions, it is worth looking at commercial `Grafana cloud/k6 cloud` to understand how `Grafana/k6` implements industry best practice. All custom metrics, along with all `k6` built-in http metrics and other standard metrics are automatically included by default by any `k6` test, and can be filtered or grouped by tags like `status`, `scenario`, `url`, `proto`, `method`, `group`, `status`, `job_name`, `project_name`, `error_code` , `instance_id` and etc and aggregated by various statistical methods, natively. One of the many important goals here is to be able to compare the same test script runs over time to track test regression trends, if any

## How to Run This Test

The test runs automatically from github hosted runner whenever any change is made to any branch of this repo. Also a demo CRON job kicks off baseline test every 12 hrs from github hosted runner, which I will turn off soon.

- Manual Option 1 (local run):
  - Pull down repo
  - CLI: `k6 run -e ENV=staging -e WORKLOAD=baseline(or stress) -e PASSWORD={setPassword} --summary-mode=full tests/courseCompletion.js`
- Manual Option 2 (github workflow run):
  - Go to 'Actions' tab of the repo
  - Click 'All Workflows' -> 'Performance Tests' workflow on the left
  - Click 'Run workflow' on the right

## Future Work

- Set up k6, influxDB and grafana as multiple containers together in the same place with docker compose, which is straight forward but I did not get a chance to get to yet
- Configure `k6-operator` for distributed tests
- The current API sequence is pretty decent since it references how browser frontend utilizes the backend endpoints. Many times only API docs would be used to come up with the request sequence by making a lot of assumptions. However, the API sequence can still be improved to reflect real user journey even more accurately:
  - Only synchronous `k6 http.request()` method is used. Some requests, e.g. `GET /users/interests` and `GET recommendations?user_id=${}`, are actually fired up at or around the same time, without waiting for response from the other. This mean for some of the requests, new `k6 asyncRequest()` method would simulate actual traffic more accurately for this sample application
  - To mimic the worst case scenario, we can add pre-flight `OPTIONS` call to most of the endpoints. This simulates new user and users with browser cache disabled. We can also add logic simulating certain percentage of the users being first time user (or cache disabled user)
  - Fetch/xhr type of endpoint requests are the main focus so far. Document type requests, e.g. `GET www.polanji.com`, `GET www.polanji.com/dashboard` and etc, are completely skipped. Depending on how these are hosted, it might worth being included in the test flow. Not to be confused with rich content resources, e.g. stylesheet, .js, and etc, which should always be hosted on CDN and shouldn't be included in API performance test
  - We can add logic to simulate more dynamic user joruneys for course completion
  - More wait time (`k6 sleep()`) can be added to better simulate real user behaviors
- Some test data cleanup step should be added, say inside a `k6 teardown()`, or with direct Database operations. Each `VU` creates a new user at the moment but sending `DELETE /users/${user_id}` returns a 403 with response body `{"detail": "You do not have admin permissions"}`. Thus data cleanup was not implemented
- No after test summary is saved as artifacts right now. `k6 handleSummary()` can be added along with a Github action workflow step. Grafana dashboard solution could make this obselete though
- Browser tests, with either `k6-browser` or MS Playwright, should be added as synthetic monitoring or part of a hybrid approach, running with a single user while API load tests are going, to gather frontend metrics during heavy traffic
