Hanuman
========

[![Build Status](https://travis-ci.org/wildnote/hanuman.svg?branch=master)](https://travis-ci.org/wildnote/hanuman)

This project rocks and uses MIT-LICENSE.

Hanuman is a rails engine that gives the rails application the ability to create surveys for data collection.

It is "still pretty early" in the development stage. However, we are using it in two of our applications.

##### Ruby Tests

Before running any tests setup the testing database:

`bundle exec rake db:reset RAILS_ENV=test`

[RSpec](http://rspec.info/) is used to write unit tests for all of the Ruby code.

To run all the Ruby tests:
`$ time rspec`

> As we're using Rspec please try to follow this [guideline](http://betterspecs.org/).


### Frontend

Part of this engine is built with [Emberjs](http://emberjs.com/) using [ember-cli-rails](https://github.com/thoughtbot/ember-cli-rails), so you need:

#### Node

Install the latest version of Node. To do so, either follow the installation instructions on nodejs.org, or use your preferred package manager (such as Homebrew on OSX) if you have one.

After the installation is complete, verify that Node is set up correctly by typing the below commands on the command line. Both should output a version number:

````
node -v
npm -v
````

#### Setup in parent app

The following commands should be done in the parent app.

##### Yarn

Once you’ve installed Node, you’ll need Yarn for the rest of package management:

Got to [Yarn install docs](https://yarnpkg.com/lang/en/docs/install/) to properly install it.

##### Ember CLI

Once you’ve installed Node, you’ll need to global install Ember CLI:

````
yarn global add ember-cli
````

##### Bower

You’ll need to globally install Bower, a package manager that keeps your front-end dependencies (including jQuery, Ember, and QUnit) up-to-date:

````
yarn global add bower
````

Once you have Bower and Ember CLI installed you need to install yarn and bower dependencies before running the rails server:

```
BUNDLE_GEMFILE="Gemfile.development" rake ember:install
````

###### To run tests

````
BUNDLE_GEMFILE="Gemfile.development" rake ember:test
````

You may need to run the following to get the tests running

```
yarn global add phantomjs-prebuilt
```

#### Keep it dependecies updated

If you're working/developing Hamunan frontend's code, it's recommened to re-install bower and npm packages because some versions have may changed by another dev. You can save this *alias* and run it to keep your js packages updated within the ember app.

`ember-clean`: aliased to

`npm cache clean && bower cache clean && rm -rf node_modules bower_components dist tmp && yarn install && bower install`

> Run this commands within the frontend folder.

If this doesn't work you may need to downgrade your node to version 7.7.2 using nvm (nvm should be installed from their github page and not using brew).
