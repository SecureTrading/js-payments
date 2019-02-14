const expiryDate = '(1[0-2]|0[1-9])/dd';
const expiryDateRegexp = new RegExp(expiryDate);

export { expiryDateRegexp, expiryDate };
