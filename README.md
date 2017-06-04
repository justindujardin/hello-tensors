# HelloTensors

A basic Angular-CLI app using tensorflow and InceptionV3 image classifier on MacOS Sierra.

## TensorFlow Setup

We need to jump through a few hoops to get Tensorflow running. We're going to use `homebrew` to install
our dependencies and `virtualenv` to setup an isolated version of Python3 because MacOS doesn't always like
you messing with the pre-installed python versions. 

If you don’t have [homebrew](https://brew.sh), install it:

```sh
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

Then install python3 and virtualenv:

```sh
brew install python3
sudo easy_install pip
sudo pip install --upgrade virtualenv 
```

Then we're going to [create a virtualenv with Python3](https://www.tensorflow.org/install/install_mac#installing_with_virtualenv) inside of the `api/` folder:

```sh
virtualenv --system-site-packages -p python3 api
```

Finally, we'll start the api server to verify everything works:

```sh
cd api && python api/server.py && cd ..
```

We’re going to deploy the app to a free heroku instance:

```sh
brew install heroku
```




This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.1.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
