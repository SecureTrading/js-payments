import * as JwtDecode from 'jwt-decode';
import { Money, Currencies } from 'ts-money';

// TODO docstrings

export interface JwtPayload {
    [key: string]: string;
}

export interface JwtObj {
    payload: JwtPayload;
}

export class Jwt {

    private _decodedJwt: JwtObj;
    public payload: JwtPayload;

    constructor(jwt: string) {
        this._decodedJwt = JwtDecode<JwtObj>(jwt);
        this.payload = this._decodedJwt.payload;
    }

    public get sitereference() {
        return this.payload.sitereference;
    }

    public get currencyiso3a() {
        return this.payload.currencyiso3a;
    }
    
    private get currency() {
        // Currencies doesn't define index signature so treating as 'any'
        return (Currencies as any)[this.payload.currencyiso3a];
    }

    public get mainamount() {
        let mainamount = this.payload.mainamount;
        if (mainamount === undefined) {
            // Merchants can specify amount in main or base units so need to convert to main
            mainamount = Money.fromInteger({amount: parseInt(this.payload.baseamount),
                                            currency: this.currency
                                            }).toString();
        }
        return mainamount;
    }
}
