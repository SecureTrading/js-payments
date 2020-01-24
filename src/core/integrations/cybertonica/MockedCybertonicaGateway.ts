import { ICybertonicaGateway } from './CybertonicaGateway';
import {
  ICybertonicaPostQuery,
  ICybertonicaPostResponse,
  ICybertonicaPostResponseStatus
} from '../../models/Cybertonica';

export class MockedCybertonicaGateway implements ICybertonicaGateway {
  /** @todo: remove static after implementing DI and singleton services */
  private static responseStatus: ICybertonicaPostResponseStatus;

  /** @todo: remove static after implementing DI and singleton services */
  static setResponseStatus(responseStatus: ICybertonicaPostResponseStatus): void {
    MockedCybertonicaGateway.responseStatus = responseStatus;
  }

  postQuery(query: ICybertonicaPostQuery): Promise<ICybertonicaPostResponse> {
    return Promise.resolve({
      transactionreference: '40-92-104',
      paymenttypedescription: 'VISA',
      rulecategoryflag: '11111111-2222-aaaa-bbbb-1a2b3c4d5e6f,22222222-1111-bbbb-aaaa-1a2b3c4d5e6f',
      maskedpan: '400000######0721',
      transactionstartedtimestamp: '2020-01-21 15:39:09',
      errormessage: 'Ok',
      accounttypedescription: 'FRAUDCONTROL',
      errorcode: '0',
      fraudcontrolshieldstatuscode: MockedCybertonicaGateway.responseStatus,
      fraudcontrolreference: 'eve_payment:a1b2c3d4-9999-8888-7777-000000000003',
      requesttypedescription: 'RISKDEC',
      acquirerneuralscore: '0',
      operatorname: 'webservices@merchant.com',
      livestatus: '1'
    });
  }
}
