# Change Log

All notable changes to this project will be documented in this file.

## 2.0.7

### Added

- Callbacks which can be called when validation fails or payment succeeds. Could be managed by user.

### Changed

- submitCallback feature has been improved (backward compatibility).

## 2.0.6

### Fixed

- Notification frame styling issues.
- Potential XSS vulnerability if a merchant site is vulnerable to XSS and passes un-sanitized values into the styling option. 
  - Additional sanitization used and insertRule used to prevent rules not whitelisted.
  
### Added
- Added version info to request to gateway to allow ST to monitor what version the merchant is using

## 2.0.5

### Fixed

- Animate card frame styling issues
- Allowed requests list validation

## 2.0.4

### Added

- Option to allow returning customers to only submit security code e.g. if referencing a previous auth
- Allow non-3DS card types e.g. PIBA to be processed through the library

### Fixed

- Potential to duplicate transactions if used with Component based framework i.e. React/Vue
  - This included creating a react example page in a separate repository to verify the library works in React - this can be viewed at https://github.com/SecureTrading/reactjs-payments

### Changed

- Refactored payment card out to separate js-payments-card repo and ts-modules for code re-use
- Dependencies updated:
  - @babel/runtime - 7.8.4
  - @securetrading/js-payments-card - 1.0.7
  - @securetrading/ts-iin-lookup - NEW - 0.0.4
  - @securetrading/ts-luhn-check - NEW - 0.0.4
  - i18next - 19.1.0
  - url-polyfill - 1.1.8

## 2.0.3

### Fixed

- Updated dependencies and fixed vulnerabilities (eg. Prototype Pollution in Handlebars - [CVE-2019-19919](https://github.com/advisories/GHSA-w457-6q6x-cgp9)).

## 2.0.2

### Fixed

- Resolved serialize-javascript dependency: regular expressions Cross-Site Scripting (XSS) vulnerability.
- Updated bunch of packages.
- Fixed a bug which could cause duplicate payments if deferInit=true

## 2.0.1

### Added

- Add updateJWT function to allow JWT to be changed after initial load. E.g. this could be used to change the amount the customer will be charged if the checkout allows modification to the cart contents after initial load.
- Add ability to deferInit in order to allow updateJWT functionality. This is required so the JavaScript will not initialise the background steps for Cardinal Commerce until after the form is submitted allowing for the merchant generated JWT to be changed after the initial page load.

### Changed

- Add option for buttonId in config to allow a specific button to be targetted as the pay button (previously this was always targetting the first button only). If not specified this will keep the original behavior.
- Improved behavioural tests to be able to more easily define more configuration options for additional test cases.
- Allow ApplePay supportedNetworks to be overridden in config rather than always using only the supported versions for the current device.

## 2.0.0

### Added

- Allow CSS customisation to individual fields
- Add support to submit analytics to ST Google Analytics account to improve library usage tracking (disabled by default)

### Changed

- Update Cardinal commerce to use live URL if livestatus is set to 1 - new config option for ST
- Move images out of js bundle into separate directory

### Fixed

- In IE animation of card would appear to blink instead of rotate
- Transactions in IE fixed
- ApplePay will now be able to process a second payment in the case the transaction was cancelled
- ApplyPay will display the add new card overlay if no valid cards are inside the customers wallet

## 2.0.0-beta.2

### Added

- Merchant callback is now available.
- Improved JWT flow security.
- Added ability to switch off/on Animated Card.

### Changed

- Expiration date formatting has been changed to more intuitive and smooth.
- Improved unit tests coverage.
- Updated dependencies and fixed vulnerabilities (eg. Prototype Pollution in Lodash).

### Fixed

- Form fields clearing after pressing 'Enter' button.
- Missing translations.
- Fields highlighting issues (highlighting on red when field has been validated positively).
- Blocking form after succeeded payment in some cases.
- Button targetting is now restricted to the st-form payment form only rather than the whole document.
- VisaCheckout/ApplePay messages correctly display at the end of the payment.
- Correct the supported networks for v3 of ApplePay.
- Fix the link to the Browser Stack README badge.

## 2.0.0-beta.1

### Added

- Field errors for both payment and merchant defined fields will now highlight the input
- Payment form will be locked during processing of payment to ensure duplicate transactions do not occur
- Allow payment endpoint to be overridden to allow for alternative gateway instances
- Added ability to handle "immediate" payments where the form is submitted with the payment data inside the initial JWT
- Added ability to provide data required for JSINIT so this request does not need to be performed in the JavaScript

### Changed

- Improved unit test coverage of entire library
- Cleaner interface for instantiation of library and validation performed on arguments
- Payment gateway responses now return as JWT's to allow verification that data has not been modified
- Improved responsiveness of animated card
- Improved mock implementations of Cardinal/Apple Pay/Visa Checkout
- Improved response when Cardinal 3DS provider returns errors

### Fixed

- Security code will now correctly show on animated card for Amex
- Polyfills for Fetch, window.location, URL and URLSearchParams added for IE
- Babel polyfill and transpile into ES5 correctly applied after TypeScript compilation
- Tab index for Firefox browsers will correctly skip hidden iframes
- Pay button on Safari correctly submits after specifying correct targetOrigin
- Field length validation correctly applied for Android devices

## 2.0.0-beta.0

Initial 2.0 version of Secure Trading JavaScript Interface for allowing payments through SecureTrading payment gateway
