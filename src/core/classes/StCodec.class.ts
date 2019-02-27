class StRequest {
  public static VERSION = '1.00';
  public static SUPPORTED_REQUEST_TYPES = [
    'WALLETVERIFY',
    'THREEDINIT',
    'THREEDQUERY',
    'CACHETOKENISE',
    'AUTH'
  ];
  private _requestId: string;
  private _jwt: string;
  constructor(jwt: string) {
    this._requestId = this._createRequestId();
    this._jwt = jwt;
  }

  public _createRequestId(length = 8) {
    return (
      'J-' +
      Math.random()
        .toString(36)
        .substring(2, 2 + length)
    );
  }

  public buildRequestObject(requestData: object, requestType: string) {
    if (
      !StRequest.SUPPORTED_REQUEST_TYPES.includes(requestType) ||
      !Object.keys(requestData).length
    ) {
      return false;
    }
    return {
      request: [
        {
          ...requestData,
          jwt: this._jwt,
          requestid: this._requestId,
          requesttypedescription: requestType
        }
      ],
      version: StRequest.VERSION
    };
  }
}

export default StRequest;
