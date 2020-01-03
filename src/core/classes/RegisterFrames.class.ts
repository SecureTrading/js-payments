import BinLookup from '../shared/BinLookup';
import MessageBus from '../shared/MessageBus';
import { StJwt } from '../shared/StJwt';
import { IStyles } from '../shared/Styler';

/**
 * Defines all non field elements of form and their placement on merchant site.
 */
export default class RegisterFrames {
  private static COMPLETE_FORM_FIELDS: string[] = ['pan', 'expirydate', 'securitycode'];

  protected styles: IStyles;
  protected params: any;
  protected elementsToRegister: HTMLElement[];
  protected elementsTargets: string[];
  protected jwt: string;
  protected origin: string;
  protected componentIds: any;
  protected hasAnimatedCard: boolean;
  protected submitCallback: any;
  protected fieldsToSubmit: string[];
  protected binLookup: BinLookup;
  protected messageBus: MessageBus;
  private stJwt: StJwt;

  constructor(
    jwt: string,
    origin: string,
    componentIds: {},
    styles: IStyles,
    animatedCard: boolean,
    fieldsToSubmit: string[],
    submitCallback?: any
  ) {
    this.binLookup = new BinLookup();
    this.messageBus = new MessageBus();
    this.fieldsToSubmit = fieldsToSubmit.length ? fieldsToSubmit : RegisterFrames.COMPLETE_FORM_FIELDS;
    this.componentIds = componentIds;
    this.submitCallback = submitCallback;
    this.hasAnimatedCard = animatedCard;
    this.elementsToRegister = [];
    this.jwt = jwt;
    this.origin = origin;
    this.styles = this._getStyles(styles);
    this.configureFormFieldsAmount(jwt);
    this.elementsTargets = this.setElementsFields();
    this.registerElements(this.elementsToRegister, this.elementsTargets);
    this.stJwt = new StJwt(jwt);
    this.params = { locale: this.stJwt.locale, origin: this.origin };
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

  protected configureFormFieldsAmount(jwt: string): any {
    return [];
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
