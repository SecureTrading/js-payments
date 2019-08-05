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
  private stJwt: StJwt;

  constructor(jwt: string, origin: string, componentIds: {}, styles: IStyles, animatedCard: boolean) {
    this.styles = styles;
    this.componentIds = componentIds;
    this.hasAnimatedCard = animatedCard;
    this.elementsTargets = this.setElementsFields();
    this.elementsToRegister = [];
    this.jwt = jwt;
    this.stJwt = new StJwt(jwt);
    this.origin = origin;
    this.params = { locale: this.stJwt.locale };
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
}
