## Submission Guidelines

##### Repository:

> - [GitHub](https://github.com/orgs/SecureTrading/teams/js-payments-team)

## Code Style, Naming convention

> - [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
> - [Gitflow](https://pl.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
> - DRY, SOLID, KISS, YAGNI
> - name of branch - feature/ST-number-of-task-name-of-task - for more information please refer to the [Gitflow](https://pl.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)

## How to launch project locally ?

> - You must have npm installed, then just run 'npm install' in project root directory.
> - Available run scripts are in section below

## Available Scripts

> - `test: jest --watch`
> - `coverage: jest --coverage`
> - `dev: webpack --config webpack.dev.js`
> - `prod: webpack --config webpack.prod.js`
> - `start: webpack-dev-server --color --progress --open --hot --config webpack.dev.js`
> - `hot: npm-run-all dev start`

## How to launch docker ?

If you wish to run the docker container which hosts the same distribution files as the npm run prod you can run the following:
> - `docker build . --tag securetrading1/js-payments`
> - `docker run -d -p 8443:8443 -p 8760:8760 -it securetrading1/js-payments`

## How to run behavioural tests ?

Travis will automatically run behavioural tests on all push/pull commits - these must pass before any PR will be accepted

