import MessageBus from '../../core/shared/MessageBus';
import { IAllowedStyles, IStyles, Styler } from './Styler';

export default class Frame {
  // TODO "protected" here isn't the correct solution (jwt should only be in ControlFrame)
  protected _frameParams: { origin: string; jwt: string };
  protected _messageBus: MessageBus;

  constructor() {
    this.setFrameParams();
    // TODO this is now duplicated by every child except ControlFrame
    this._messageBus = new MessageBus(this._frameParams.origin);
  }

  public onInit() {
    this._applyStyles();
  }

  public parseUrl() {
    const parsedUrl = new URL(window.location.href);
    const styles: IStyles = {};
    parsedUrl.searchParams.forEach((value, param) => {
      styles[param] = value;
    });
    return styles;
  }

  protected _applyStyles() {
    new Styler(this._getAllowedStyles()).inject(this.parseUrl());
  }

  protected _getAllowedStyles() {
    const allowed: IAllowedStyles = {
      'background-color-body': { property: 'background-color', selector: 'body' },
      'color-body': { property: 'color', selector: 'body' },
      'font-size-body': { property: 'font-size', selector: 'body' },
      'line-height-body': { property: 'line-height', selector: 'body' },
      'space-inset-body': { property: 'padding', selector: 'body' },
      'space-outset-body': { property: 'margin', selector: 'body' }
    };
    return allowed;
  }

  private setFrameParams() {
    // @ts-ignore
    const frameUrl = new URL(window.location);
    const frameParams = new URLSearchParams(frameUrl.search); // @TODO: add polyfill for IE

    this._frameParams = {
      jwt: frameParams.get('jwt'),
      origin: frameParams.get('origin')
    };
  }

}
