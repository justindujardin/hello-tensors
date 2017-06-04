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

Then we're going to [create a virtualenv with Python3](https://www.tensorflow.org/install/install_mac#installing_with_virtualenv) inside of the root project folder, and activate the environment:

```sh
# Setup the virtual env with python v3
virtualenv --system-site-packages -p python3 ./
# activate the isolated python env to make `python` available on the commandline
source ./bin/activate 
# Install tensorflow, etc.
pip install -r requirements.txt
```

Finally, we'll start the api server to verify everything works:

```sh
python server.py
```

We should see that a server comes online using port 5000. Great!

## Heroku Deployment

We’re going to deploy the app to a free Heroku instance:

Create your heroku app

```sh
heroku create
```

This will output your app name, which you will need to set in `src/environments/environments.prod.ts`. Your final
environments file should look like this:

```typescript
export const environment = {
  production: true,
  apiHost: 'https://hello-tensors.herokuapp.com'
};
```

Install the python buildpack:

```sh
heroku buildpacks:set heroku/python
```

Deploy by pushing to heroku directly (`git push heroku master`) or by using the `api.deploy.sh` file as a convenience.

## Angular Application

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.1.0.

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

### Deploying the application to gh-pages

Run `site.deploy.sh` in the root folder.

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
