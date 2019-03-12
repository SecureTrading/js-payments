import { Brand, CardTreeNode, BrandDetailsType, cardTree, brandMapping } from '../imports/cardtype';
import Utils from './Utils';

type BinLookupConfigType = {
  minMatch?: number;
  maxMatch?: number;
  supported?: string[];
  defaultCardType?: string;
};

class BinLookup {
  static DEFAULT_MIN_MATCH = 0;
  static DEFAULT_MAX_MATCH = 6;
  private minMatch: number;
  private maxMatch: number;
  private supported: string[];
  private default: BrandDetailsType;

  constructor(config?: BinLookupConfigType) {
    config = config || {};
    this.minMatch = 'minMatch' in config ? config.minMatch : BinLookup.DEFAULT_MIN_MATCH;
    this.maxMatch = 'maxMatch' in config ? config.maxMatch : BinLookup.DEFAULT_MAX_MATCH;

    this.supported = this.getAllBrands();
    if ('supported' in config) {
      const { supported } = config;
      for (let i in supported) {
        const type = supported[i];
        if (!this.isSupported(type)) {
          throw `unsupported cardTree ${type}`;
        }
      }
      this.supported = supported;
    }

    this.default = 'defaultCardType' in config ? this.getCard(config.defaultCardType) : null;
  }

  /**
   * ForEachBreak helper function that only runs over supported brands
   * @param callback Callback to run over the supported brands
   * @return first truthy result of the callback or null
   */
  forEachBreakBrands<returnType>(callback: (card: BrandDetailsType) => returnType): returnType {
    return Utils.forEachBreak(Object.values(brandMapping), (card: BrandDetailsType) => {
      if (this.isSupported(card)) {
        return callback(card);
      }
    });
  }

  /**
   * All text brand names the wywtem knows about
   * @return array of all text brand names
   */
  getAllBrands(): string[] {
    return Object.values(brandMapping)
      .map(brand => brand.type)
      .sort();
  }

  /**
   * Test if a brand is supported with the current configuration
   * @param brand the brand to lookup
   * @return Whether this brand is supported
   */
  isSupported(brand: string | BrandDetailsType): boolean {
    if (brand instanceof Object) {
      brand = brand.type;
    }
    return Utils.inArray(this.supported, brand);
  }

  /**
   * Look up a brand given it's text name (rather than the internal ID)
   * @param type The name of the brand to get the details for
   * @return The details about the named brand
   */
  getCard(type: string): BrandDetailsType {
    return this.forEachBreakBrands(card => {
      if (card.type === type) {
        return card;
      }
    });
  }

  /**
   * Lookup the type of a card
   * @param number Card number to lookup
   * @return BrandDetails for the brand identified
   */
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

  /**
   * Tree key searching function
   * @param number Card number to check against this key
   * @param key Search key to test against
   * @return whether the card number matches this key
   */
  matchKey(number: string, key: string): boolean {
    let n = number.substring(0, key.length);
    let result = n == key;
    if (!result && Utils.inArray(key, '-')) {
      const keys = key.split('-');
      let n = parseInt(number.substring(0, keys[1].length));
      if (parseInt(keys[0]) <= n && n <= parseInt(keys[1])) {
        result = true;
      }
    }
    return result;
  }

  /**
   * Recursive lookup helper function
   * @param number Card number to lookup
   * @param tree Recursively searched tree branch
   * @return The succesfully found brand for this card number or null
   */
  _lookup(number: string, tree: CardTreeNode): Brand {
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

export default BinLookup;
