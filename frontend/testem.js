module.exports = {
  test_page: 'tests/index.html?hidepassed',
  disable_watching: true,
  launch_in_ci: ['Chrome'],
  launch_in_dev: ['Chrome'],
  browser_args: {
    Chrome: {
      ci: ['--headless', '--disable-gpu', '--remote-debugging-port=9222']
    }
  },
  reporter: 'dot'
};
