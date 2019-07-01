# Change Log

All notable changes to this project will be documented in this file.

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
