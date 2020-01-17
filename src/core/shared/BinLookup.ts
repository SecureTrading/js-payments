import { Brand } from '../models/constants/Brand';
import { BrandDetailsType } from '../models/constants/BrandDetailsType';
import { brandMapping } from '../models/constants/BrandMapping';
import { cardTree } from '../models/constants/CardTree';
import { CardTreeNode } from '../models/constants/CardTreeNode';
import { IBinLookupConfigType } from '../models/IBinLookupConfigType';
import { Utils } from './Utils';

export class BinLookup {
  public static DEFAULT_MIN_MATCH = 0;
  public static DEFAULT_MAX_MATCH = 6;
  private readonly minMatch: number;
  private readonly maxMatch: number;
  private readonly supported: string[];
  private readonly default: BrandDetailsType;

  constructor(config?: IBinLookupConfigType) {
    config = config || {};
    this.minMatch = 'minMatch' in config ? config.minMatch : BinLookup.DEFAULT_MIN_MATCH;
    this.maxMatch = 'maxMatch' in config ? config.maxMatch : BinLookup.DEFAULT_MAX_MATCH;

    this.supported = this.getAllBrands();
    if ('supported' in config) {
      const { supported } = config;
      // tslint:disable-next-line:forin
      for (const i in supported) {
        const type = supported[i];
        if (!this.isSupported(type)) {
          throw Error(`unsupported cardTree ${type}`);
        }
      }
      this.supported = supported;
    }

    this.default = 'defaultCardType' in config ? this.getCard(config.defaultCardType) : null;
  }

  public binLookup(number: string): BrandDetailsType {
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

  private forEachBreakBrands<returnType>(callback: (card: BrandDetailsType) => returnType): returnType {
    return Utils.forEachBreak(Object.values(brandMapping), (card: BrandDetailsType) => {
      if (this.isSupported(card)) {
        return callback(card);
      }
    });
  }

  private getAllBrands(): string[] {
    return Object.values(brandMapping)
      .map(brand => brand.type)
      .sort();
  }

  private isSupported(brand: string | BrandDetailsType): boolean {
    if (brand instanceof Object) {
      brand = brand.type;
    }
    return Utils.inArray(this.supported, brand);
  }

  private getCard(type: string): BrandDetailsType {
    return this.forEachBreakBrands(card => {
      if (card.type === type) {
        return card;
      }
    });
  }

  private matchKey(number: string, key: string): boolean {
    const n1 = number.substring(0, key.length);
    let result = n1 === key;
    if (!result && Utils.inArray(key, '-')) {
      const keys = key.split('-');
      const n2 = parseInt(number.substring(0, keys[1].length), 10);
      if (parseInt(keys[0], 10) <= n2 && n2 <= parseInt(keys[1], 10)) {
        result = true;
      }
    }
    return result;
  }

  private _lookup(number: string, tree: CardTreeNode): Brand {
    if (!(tree instanceof Object)) {
      return tree;
    }
    const found: string[] = Object.keys(tree)
      .filter(key => this.matchKey(number, key))
      .sort((a, b) => a.length - b.length);
    return (
      Utils.forEachBreak(
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
