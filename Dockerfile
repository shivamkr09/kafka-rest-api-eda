FROM grafana/k6

COPY load_test.js /load_test.js

ENTRYPOINT ["k6", "run", "/load_test.js"]
