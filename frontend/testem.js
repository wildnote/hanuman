module.exports = {
  "framework": "qunit",
  "test_page": "tests/index.html?hidepassed",
  "disable_watching": true,
  "parallel": -1,
  "reporter": "dot",
  "launch_in_ci": [
    "PhantomJS"
  ],
  "launch_in_dev": [
    "PhantomJS",
    "Chrome"
  ]
};
