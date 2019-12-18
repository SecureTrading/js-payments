import { StJwt } from '../shared/StJwt';
import { IStyles } from '../shared/Styler';

/**
 * Defines all non field elements of form and their placement on merchant site.
 */
export default class RegisterFrames {
  protected styles: IStyles;
  protected params: any;
  protected elementsToRegister: HTMLElement[];
  protected elementsTargets: string[];
  protected jwt: string;
  protected origin: string;
  protected componentIds: any;
  protected hasAnimatedCard: boolean;
  protected submitCallback: any;
  private stJwt: StJwt;

  constructor(
    jwt: string,
    origin: string,
    componentIds: {},
    styles: IStyles,
    animatedCard: boolean,
    cybertonicaApiKey: string,
    submitCallback?: any
  ) {
    this.styles = this._getStyles(styles);
    this.componentIds = componentIds;
    this.submitCallback = submitCallback;
    this.hasAnimatedCard = animatedCard;
    this.elementsTargets = this.setElementsFields();
    this.elementsToRegister = [];
    this.jwt = jwt;
    this.stJwt = new StJwt(jwt);
    this.origin = origin;
    this.params = { locale: this.stJwt.locale, origin: this.origin };
  }

  /**
   * Gathers and launches methods needed on initializing object.
   */
  protected onInit() {
    this.registerElements(this.elementsToRegister, this.elementsTargets);
  }

  /**
   * Register fields in clients form
   * @param fields
   * @param targets
   */
  protected registerElements(fields: HTMLElement[], targets: string[]) {
    targets.map((item, index) => {
      const itemToChange = document.getElementById(item);
      itemToChange.appendChild(fields[index]);
    });
  }

  /**
   * Defines iframe elements to add
   */
  protected setElementsFields(): any {
    return [];
  }

  /**
   * Set defaultStyles if styles are defined as a flat structure
   * @param styles
   */
  private _getStyles(styles: any) {
    // If we have an object as a value then we assume we are in the new format otherwise we are a flat array
    for (const key in styles) {
      if (styles[key] instanceof Object) {
        return styles;
      }
    }
    styles = { defaultStyles: styles };
    return styles;
  }
}
