import * as JwtDecode from 'jwt-decode';
import { Money, Currencies } from 'ts-money';

// TODO docstrings

export interface StJwtPayload {
    [key: string]: string;
}

export interface StJwtObj {
    payload: StJwtPayload;
}

export class StJwt {

    private _decodedJwt: StJwtObj;
    public payload: StJwtPayload;

    constructor(jwt: string) {
        this._decodedJwt = JwtDecode<StJwtObj>(jwt);
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
