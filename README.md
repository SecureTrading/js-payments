# JS Library

[![Build Status](https://travis-ci.org/SecureTrading/js-payments.svg?branch=develop)](https://travis-ci.org/SecureTrading/js-payments) <!-- Coveralls --> [![Coverage Status](https://coveralls.io/repos/github/SecureTrading/js-payments/badge.svg?branch=develop)](https://coveralls.io/github/SecureTrading/js-payments?branch=develop) <!-- Browserstack --> [![BrowserStack Status](https://www.browserstack.com/automate/badge.svg?badge_key=eVhLS2ZRY1hqcnJhQXZYVVVZeGhBZnNZL2U4S0ZuNzFDSVk5WFd6MnQvTT0tLVZXd0diVnBPU1RURXJ4S2VrakpuUlE9PQ==--8df058f3f39c1ace5b4d83d27b8c3b46fc3bd90d)](https://www.browserstack.com/automate/public-build/eVhLS2ZRY1hqcnJhQXZYVVVZeGhBZnNZL2U4S0ZuNzFDSVk5WFd6MnQvTT0tLVZXd0diVnBPU1RURXJ4S2VrakpuUlE9PQ==--8df058f3f39c1ace5b4d83d27b8c3b46fc3bd90d) <!-- Dependabot --> [![Dependabot badge](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://app.dependabot.com/) <!-- Snyk --> [![Known Vulnerabilities](https://snyk.io/test/github/SecureTrading/js-payments/develop/badge.svg)](https://snyk.io/test/github/SecureTrading/js-payments/develop)

A JavaScript interface for allowing tokenization and authorisation of payments through SecureTrading.

## Quickstart

You can check JS Library in action by running it on your local environment. To do this, run commands below:

```
npm install
npm start
```

Then open address `https://localhost:8443` in your web browser.

Please be aware, that NPM uses the configuration from `package.json` file and by default hostname is set to `localhost`. To use another hostname you should set a configuration variable by running the command below:

```
npm config set js-payments:host YOUR_HOSTNAME
```

## API Reference

- [API documentation](https://docs.securetrading.com/document/api/getting-started/)

## Mock-ups, graphics

Not specified yet

## Technology Stack:

##### Tools and languages:

- [TypeScript](https://www.typescriptlang.org/)
- [ES6](https://developer.mozilla.org/en-US/docs/Web/JavaScript) + [Babel](https://babeljs.io/)
- [Webpack](https://webpack.js.org/)
- [npm](https://www.npmjs.com/)
- [Sass (SCSS + BEM)](https://sass-lang.com/)
- [PostCSS](https://postcss.org/)
- [Prettier](https://prettier.io/)
- [Stylelint](https://stylelint.io/)
- [TSLint](https://palantir.github.io/tslint/)
- [ESLint](https://eslint.org/)
- [TypeDoc](https://typedoc.org/)

##### CI/CD:

- [Dependabot](https://dependabot.com/)
- [Snyk](https://snyk.io/)
- [Coveralls](https://coveralls.io/)
- [Travis CI](https://travis-ci.org/)
- [BrowserStack](https://www.browserstack.com/)

[<img alt="BrowserStack" src="browserstack-logo.png" width="300" />](https://www.browserstack.com/)

##### Automated tests:

- [Jest](https://jestjs.io/) for unit testing
- [Selenium (Java)](https://www.seleniumhq.org/) + [BrowserSync](https://www.browsersync.io/) for UI testing

## Browser compatibility:

- Internet Explorer 10 or later
- Latest versions of the following:
  - Chrome
  - Firefox
  - Edge
  - Safari

## License

- [MIT](https://opensource.org/licenses/MIT)
