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
    console.log(this._id);
  }

  verifyClientId() {}
}

export default ST;
