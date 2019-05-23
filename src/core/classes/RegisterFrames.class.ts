import { StJwt } from '../shared/StJwt';
import { IStyles } from '../shared/Styler';

/**
 * Defines all non field elements of form and their placement on merchant site.
 */
export default class RegisterFrames {
  public styles: IStyles;
  public params: any;
  public onlyWallets: boolean;
  public elementsToRegister: HTMLElement[];
  public elementsTargets: any;
  public componentIds: any;
  public jwt: any;
  public origin: any;
  private stJwt: StJwt;

  constructor(jwt: any, origin: any, componentIds: [], styles: IStyles) {
    this.styles = styles;
    this.componentIds = componentIds;
    this.elementsTargets = this.setElementsFields();
    this.elementsToRegister = [];
    this.jwt = jwt;
    this.stJwt = new StJwt(jwt);
    this.origin = origin;
    this.params = { locale: this.stJwt.locale };
    this._onInit();
  }

  /**
   * Defines iframe elements to add
   */
  public setElementsFields(): any {
    return [];
  }

  public _onInit() {
    this.registerElements(this.elementsToRegister, this.elementsTargets);
  }

  /**
   * Register fields in clients form
   * @param fields
   * @param targets
   */
  public registerElements(fields: HTMLElement[], targets: string[]) {
    targets.map((item, index) => {
      const itemToChange = document.getElementById(item);
      itemToChange.appendChild(fields[index]);
    });
  }
}
