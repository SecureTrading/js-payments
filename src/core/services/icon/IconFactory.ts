export class IconFactory {
  private _url: string;

  constructor(url: string) {
    this._url = url;
  }

  getIcon(url: string): string {
    return `<img src='${this._url}' />`;
  }
}


