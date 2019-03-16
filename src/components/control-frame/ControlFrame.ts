export default class ControlFrame {
  constructor() {}

  static ifFieldExists(): HTMLInputElement {
    // @ts-ignore
    return document.getElementById('st-control-frame-button');
  }
}
