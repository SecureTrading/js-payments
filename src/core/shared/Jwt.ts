import *  as JwtDecode from 'jwt-decode';

// TODO docstrings

export interface JwtPayload {
    [key: string]: string;
}
  
export interface JwtObj {
    payload: JwtPayload;
}

export class Jwt {

    private _rawJwt: string;
    private _decodedJwt: JwtObj;

    constructor(jwt: string) {
        this._decodedJwt = JwtDecode<JwtObj>(jwt);
    }

    public getPayload<JwtPayload>() {
        return this._decodedJwt.payload;
    }

}
