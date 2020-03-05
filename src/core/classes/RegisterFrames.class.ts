import { IStyles } from '../config/model/IStyles';
import { MessageBus } from '../shared/MessageBus';
import { StJwt } from '../shared/StJwt';
import { Container } from 'typedi';

export class RegisterFrames {
  private static COMPLETE_FORM_FIELDS: string[] = ['pan', 'expirydate', 'securitycode'];

  protected styles: IStyles;
  protected params: any;
  protected elementsToRegister: HTMLElement[];
  protected elementsTargets: string[];
  protected jwt: string;
  protected origin: string;
  protected componentIds: any;
  protected fieldsToSubmit: string[];
  protected messageBus: MessageBus;
  private stJwt: StJwt;

  constructor(
    jwt: string,
    origin: string,
    componentIds: {},
    styles: IStyles,
    animatedCard: boolean,
    fieldsToSubmit?: string[]
  ) {
    this.messageBus = Container.get(MessageBus);
    this.fieldsToSubmit = fieldsToSubmit || RegisterFrames.COMPLETE_FORM_FIELDS;
    this.componentIds = componentIds;
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

  protected registerElements(fields: HTMLElement[], targets: string[]) {
    targets.map((item, index) => {
      const itemToChange = document.getElementById(item);
      itemToChange.appendChild(fields[index]);
    });
  }

  protected configureFormFieldsAmount(jwt: string): any {
    return [];
  }

  protected setElementsFields(): any {
    return [];
  }

  private _getStyles(styles: any) {
    for (const key in styles) {
      if (styles[key] instanceof Object) {
        return styles;
      }
    }
    styles = { defaultStyles: styles };
    return styles;
  }
}
