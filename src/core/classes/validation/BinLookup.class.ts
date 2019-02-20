import {
  Brand,
  CardTreeNode,
  BrandDetailsType,
  cardTree,
  brandMapping,
} from '../../imports/cardtype';
import { inArray, forEachBreak } from '../../helpers/utils';

type BinLookupConfigType = {
  minMatch?: number;
  maxMatch?: number;
  supported?: string[];
  defaultCardType?: string;
};

export class BinLookup {
  minMatch: number;
  maxMatch: number;
  supported: string[];
  default: BrandDetailsType;
  constructor(config?: BinLookupConfigType) {
    config = config || {};
    this.minMatch = 'minMatch' in config ? config.minMatch : 0;
    this.maxMatch = 'maxMatch' in config ? config.maxMatch : 6;

    this.supported = this.getAllBrands();
    if ('supported' in config) {
      const support = config.supported;
      for (let i in support) {
        const type = support[i];
        if (!this.isSupported(type)) {
          throw 'unsupported cardTree ' + type;
        }
      }
      this.supported = support;
    }

    this.default =
      'defaultCardType' in config ? this.getCard(config.defaultCardType) : null;
  }

  forEachBreakBrands<returnType>(
    callback: (card: BrandDetailsType) => returnType
  ): returnType {
    return forEachBreak(
      Object.values(brandMapping),
      (card: BrandDetailsType) => {
        if (this.isSupported(card)) {
          return callback(card);
        }
      }
    );
  }

  getAllBrands(): string[] {
    // this cannot use foreachBreakBrands since it's used to set up this.supported
    const result: string[] = [];
    forEachBreak(Object.values(brandMapping), (card: BrandDetailsType) => {
      result.push(card.type);
    });
    return result.sort();
  }

  isSupported(cardTree: string | BrandDetailsType): boolean {
    if (cardTree instanceof Object) {
      cardTree = cardTree.type;
    }
    return inArray(this.supported, cardTree);
  }

  getCard(type: string): BrandDetailsType {
    return this.forEachBreakBrands(card => {
      if (card['type'] === type) {
        return card;
      }
    });
  }

  binLookup(number: string): BrandDetailsType {
    let result: BrandDetailsType = { type: null };
    if (number.length >= this.minMatch) {
      const tmp = brandMapping[this._lookup(number, cardTree)];
      if (this.isSupported(tmp)) {
        result = tmp;
      }
    }
    if (!result.type && this.default && number.length <= this.maxMatch) {
      result = this.default;
    }
    return result;
  }

  matchKey(number: string, key: string): boolean {
    let n = number.substring(0, key.length);
    let result = n == key;
    if (!result && inArray(key, '-')) {
      const keys = key.split('-');
      let n = parseInt(number.substring(0, keys[1].length));
      if (parseInt(keys[0]) <= n && n <= parseInt(keys[1])) {
        result = true;
      }
    }
    return result;
  }

  _lookup(number: string, tree: CardTreeNode): Brand {
    if (!(tree instanceof Object)) {
      return tree;
    }
    const found: string[] = [];
    for (let key in tree) {
      if (this.matchKey(number, key)) {
        found.push(key);
      }
    }
    found.sort((a: string, b: string) => {
      return a.length - b.length;
    });
    return (
      forEachBreak(
        found,
        (key: string): Brand => {
          return this._lookup(number, tree[key]);
        }
      ) ||
      tree.D ||
      null
    );
  }
}
