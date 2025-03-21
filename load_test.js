import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // scenarios: {
  //   high_load_test: {
  //     executor: 'ramping-arrival-rate',
  //     startRate: 5000, // Starting with 5,000 requests per second
  //     timeUnit: '1s',
  //     preAllocatedVUs: 2000, // Initial pool of virtual users
  //     maxVUs: 5000, // Maximum number of virtual users
  //     stages: [
  //       { duration: '10s', target: 5000 }, // Ramp up to 5,000 RPS over 10 seconds
  //       { duration: '10s', target: 5000 }, // Maintain 5,000 RPS for 10 seconds
  //     ],
  //   },
  // },
  // stages: [
  //   { duration: '30s', target: 500 }, // Gradually increase
  //   { duration: '1m', target: 1000 },
  //   { duration: '2m', target: 5000 },
  // ],
  stages: [
    { duration: '1m', target: 500 }, // Start with 500 users
    { duration: '2m', target: 1000 }, // Gradually increase
    { duration: '3m', target: 3000 }, // Peak traffic
    { duration: '1m', target: 500 },  // Cool down
  ],
};

export default function () {
  const url = 'http://10.0.0.4:3000/send'; // Adjust the URL as needed
  const payload = JSON.stringify({"messages": [{"name": "Event 1", "timestamp": "2025-03-15T12:00:00Z"}, {"name": "Event 2", "timestamp": "2025-03-15T12:05:00Z"}]});
  const params = { headers: { 'Content-Type': 'application/json' } };

  const response = http.post(url, payload, params);

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time is less than 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1); // Pause between iterations
}
