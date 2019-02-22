/***
 * Establishes connection with ST, defines client.
 */
class ST {
  private _id: string;

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  constructor(id: string) {
    this._id = id;
  }
}

export default ST;
