import { StJwt } from '../shared/StJwt';
import { IStyles } from '../shared/Styler';

/**
 * Defines all non field elements of form and their placement on merchant site.
 */
export default class RegisterFrames {
  public styles: IStyles;
  public params: any;
  public elementsToRegister: HTMLElement[];
  public elementsTargets: string[];
  public componentIds: any;
  public jwt: string;
  public origin: string;
  private stJwt: StJwt;

  constructor(jwt: any, origin: any, componentIds: {}, styles: IStyles) {
    this.styles = styles;
    this.componentIds = componentIds;
    this.elementsTargets = this.setElementsFields();
    this.elementsToRegister = [];
    this.jwt = jwt;
    this.stJwt = new StJwt(jwt);
    this.origin = origin;
    this.params = { locale: this.stJwt.locale };
  }

  /**
   * Triggers methods needed on init.
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
    targets.map((item, index) => document.getElementById(item).appendChild(fields[index]));
  }

  /**
   * Defines iframe elements to add
   */
  protected setElementsFields(): string[] {
    return [];
  }
}
