module.exports = {
  test_page: 'tests/index.html?hidepassed',
  disable_watching: true,
  launch_in_ci: ['PhantomJS'],
  launch_in_dev: ['PhantomJS'],
  browser_args: {
    PhantomJS: {
      ci: ['--web-security=false', '--ignore-ssl-errors=true', '--ssl-protocol=any'].filter(Boolean)
    }
  },
  reporter: 'dot'
};
