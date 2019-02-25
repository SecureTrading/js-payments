import each from 'jest-each';
import { inArray } from '../../../../src/core/helpers/utils';
import {
  BrandDetailsType,
  cardTree,
  brandMapping
} from '../../../../src/core/imports/cardtype';
import BinLookup from '../../../../src/core/classes/validation/BinLookup.class';

const fs = require('fs');
const readline = require('readline');

const nullType: BrandDetailsType = { type: null };

each([
  [
    {},
    {
      default: null,
      minMatch: 0,
      maxMatch: 6,
      supported: [
        'AMEX',
        'ASTROPAYCARD',
        'DINERS',
        'DISCOVER',
        'JCB',
        'LASER',
        'MAESTRO',
        'MASTERCARD',
        'PIBA',
        'VISA'
      ]
    }
  ],
  [{ supported: ['DELTA'] }, 'unsupported cardTree DELTA'],
  [
    { minMatch: 3, maxMatch: 20, supported: ['VISA'] },
    { default: null, minMatch: 3, maxMatch: 20, supported: ['VISA'] }
  ],
  [
    { defaultCardType: 'AMEX', supported: ['AMEX', 'MASTERCARD'] },
    { default: brandMapping['4'], supported: ['AMEX', 'MASTERCARD'] }
  ],
  [
    { defaultCardType: 'AMEX', supported: ['VISA', 'MASTERCARD'] },
    { default: null, supported: ['VISA', 'MASTERCARD'] }
  ]
]).test(
  'BinLookup.constructor', // Check different options get set on config correctly
  (testConfig, expected) => {
    if (expected instanceof Object) {
      const bl = new BinLookup(testConfig);
      expect(bl).toMatchObject(expected); // WARNING: toMatchObject only tests the keys in the expected are a subset of the actual - to test against {} we MUST use toEqual
    } else {
      expect(() => {
        new BinLookup(testConfig);
      }).toThrow(expected);
    }
  }
);

test('BinLookup.getAllBrands', () => {
  const bl = new BinLookup();
  expect(bl.getAllBrands()).toEqual([
    'AMEX',
    'ASTROPAYCARD',
    'DINERS',
    'DISCOVER',
    'JCB',
    'LASER',
    'MAESTRO',
    'MASTERCARD',
    'PIBA',
    'VISA'
  ]);
});

each([
  ['VISA', true],
  ['DELTA', false], // Because we treat DELTA as VISA brand
  ['VISADEBIT', false], // Not supported (it"s known as delta)
  ['\u2219', false], // utf-8
  ['MASTERCARD', true],
  [{ type: 'MASTERCARD' }, true], // we can pass the whole cardTree object too
  ['', false],
  [undefined, false],
  [null, false],
  [{}, false]
]).test('BinLookup.isSupported', (cardTree, expected) => {
  const bl = new BinLookup();
  expect(bl.isSupported(cardTree)).toBe(expected);
});

each([
  ['VISA', { type: 'VISA', length: [13, 16, 19] }],
  ['MASTERCARD', { type: 'MASTERCARD', length: [16] }],
  ['AMEX', { type: 'AMEX', length: [15] }]
]).test('BinLookup.getCard', (type, expected) => {
  const bl = new BinLookup();
  expect(bl.getCard(type)).toMatchObject(expected); // WARNING: toMatchObject only tests the keys in the expected are a subset of the actual - to test against {} we MUST use toEqual
  expect(Object.keys(bl.getCard(type)).sort()).toEqual([
    'cvcLength',
    'format',
    'length',
    'luhn',
    'type'
  ]);
});

each([
  ['1801', '180', true],
  ['1901', '180', false],
  ['18', '180', false],
  ['3088', '3088-3094', true],
  ['3090', '3088-3094', true],
  ['3096', '3088-3094', false]
]).test('BinLookup.matchKey', (number, key, expected) => {
  const bl = new BinLookup();
  expect(bl.matchKey(number, key)).toBe(expected);
});

each([
  [{}, '', '2', brandMapping['2']],
  [{}, '', null, nullType],
  [{ supported: ['AMEX'] }, '', '2', nullType],
  [{ defaultCardType: 'MASTERCARD' }, '', null, brandMapping['2']],
  [{ defaultCardType: 'AMEX', minMatch: 3 }, '34', '1', brandMapping['4']],
  [
    { defaultCardType: 'AMEX', supported: ['AMEX'] },
    '',
    '1',
    brandMapping['4']
  ],
  [{ defaultCardType: 'MASTERCARD', maxMatch: 3 }, '3456', null, nullType]
]).test(
  'BinLookup._lookup_withDefaults',
  (config, number, lookupResult, expected) => {
    const bl = new BinLookup(config);
    bl._lookup = jest.fn();
    (<jest.Mock>bl._lookup).mockReturnValue(lookupResult);
    expect(bl.binLookup(number)).toEqual(expected);
  }
);

test('BinLookup._lookup_allMappings', () => {
  const bl = new BinLookup();
  const mappings = Object.assign(
    { 198: nullType, null: nullType },
    brandMapping
  );
  for (let result in mappings) {
    bl._lookup = jest.fn();
    (<jest.Mock>bl._lookup).mockReturnValue(result);
    expect(bl.binLookup('01234')).toEqual(mappings[result]);
    expect(bl._lookup).toHaveBeenCalledTimes(1);
    expect(bl._lookup).toHaveBeenCalledWith('01234', cardTree);
  }
});

each([
  ['notfound', {}, null, 1],
  ['notfound', { D: 7 }, 7, 1],
  ['180', { '1': { '18': { '1801': 1 } } }, null, 3],
  ['1801', { '1': { '18': { '1801': 1 } } }, 1, 4],
  ['1802', { '1': { '18': { '1801': 1 } } }, null, 3],
  ['3095', { D: 9, '308-309': { '3088-3094': 2 } }, 9, 2],
  ['3088', { '308-309': { '3088-3094': 2 } }, 2, 3],
  ['52', { D: 3, '51-55': 2, '52': 1 }, 1, 2],
  ['523', { '51-55': { D: 2 }, '52': { '522': 1 } }, 2, 3],
  [
    '60110',
    {
      '5-6': { '56-69': 7 },
      '6': {
        '64-65': { '644-659': 8 },
        '60': {
          '6011': {
            '60110': 8,
            '60112-60114': 8,
            '60118-60119': { '601186-601199': 8 },
            '60117': { '601177-601179': 8, '601174': 8 }
          },
          '6012': { '601281': 6 }
        },
        '62': {
          '622': { '622126-622925': 8 },
          '628': { '6282-6288': 8 },
          '624-626': 8
        },
        '63': {
          '630': {
            '63048': { '630487': 9, '630485': 9 },
            '63049': { '630493-630494': 9, '630498': 9 }
          }
        },
        '64': { '644-649': 8 },
        '65': 8,
        '67': { '675': { '6759': { D: 7 } } }
      }
    },
    8,
    5
  ]
]).test('BinLookup._lookup', (number, tree, expected, depth) => {
  const bl = new BinLookup();
  bl._lookup = jest.fn(bl._lookup); // mock the function as itself (so that we can spy how deep it has recursed)
  expect(bl._lookup(number, tree)).toBe(expected);
  expect(bl._lookup).toHaveBeenCalledTimes(depth);
});
