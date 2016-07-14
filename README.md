Hanuman
========

[![Build Status](https://travis-ci.org/kristenhazard/hanuman.svg?branch=master)](https://travis-ci.org/kristenhazard/hanuman)

This project rocks and uses MIT-LICENSE.

Hanuman is a rails engine that gives the rails application the ability to create surveys for data collection.

It is still pretty early in the development stage. However, we are using it in two of our applications.



### Frontend

Part of this engine is built with [Emberjs](http://emberjs.com/) using [ember-cli-rails](https://github.com/thoughtbot/ember-cli-rails), so you need:

###### Node

Install the latest version of Node. To do so, either follow the installation instructions on nodejs.org, or use your preferred package manager (such as Homebrew on OSX) if you have one.

After the installation is complete, verify that Node is set up correctly by typing the below commands on the command line. Both should output a version number:

````
node -v
npm -v
````

###### Ember CLI

Once you’ve installed Node, you’ll need to globally install Ember CLI:

````
npm install -g ember-cli
````

###### Bower

You’ll need to globally install Bower, a package manager that keeps your front-end dependencies (including jQuery, Ember, and QUnit) up-to-date:

````
npm install -g bower
````

Once you have Bower and Ember CLI installed you need to install npm and bower dependencies before running the rails server:

````
rake ember:install
```

To run tests

```
BUNDLE_GEMFILE="Gemfile.development" rake ember:test
```
