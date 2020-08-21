import each from 'jest-each';
import { StJwt } from './StJwt';

// given
describe('StJwt', () => {
  // when
  const gbpJwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0ZXN0X2p3dF9pc3N1ZXIiLCJwYXlsb2FkIjp7InNpdGVyZWZlcmVuY2UiOiJleGFtcGxlMTIzNDUiLCJiYXNlYW1vdW50IjoiMTAwMCIsImN1cnJlbmN5aXNvM2EiOiJHQlAifSwiaWF0IjoxNTE2MjM5MDIyfQ.jPuLMHxK3fznVddzkRoYC94hgheBXI1Y7zHAr7qNCig';
  const jpyJwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0ZXN0X2p3dF9pc3N1ZXIiLCJwYXlsb2FkIjp7InNpdGVyZWZlcmVuY2UiOiJleGFtcGxlNjc4OTAiLCJiYXNlYW1vdW50IjoiMTEwMCIsImN1cnJlbmN5aXNvM2EiOiJKUFkifSwiaWF0IjoxNTE2MjM5MDIyfQ.DdLHNTaq-SJPGYdrL0vIRqUyKmu-xdEz19Pp2FVZG-s';
  const usdJwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0ZXN0X2p3dF9pc3N1ZXIiLCJwYXlsb2FkIjp7InNpdGVyZWZlcmVuY2UiOiJleGFtcGxlMTIzNDUiLCJiYXNlYW1vdW50IjoiMTIzNDU2Nzg5IiwiY3VycmVuY3lpc28zYSI6IlVTRCJ9LCJpYXQiOjE1MTYyMzkwMjJ9.vkw_qDlFntie6wi587U1DOVdOEFDBoeeHQeJsR4OQRo';
  const mainamountUsdJwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0ZXN0X2p3dF9pc3N1ZXIiLCJwYXlsb2FkIjp7InNpdGVyZWZlcmVuY2UiOiJleGFtcGxlMTIzNDUiLCJtYWluYW1vdW50IjoiMTIzNDU2Ny44OSIsImN1cnJlbmN5aXNvM2EiOiJVU0QifSwiaWF0IjoxNTE2MjM5MDIyfQ.puxo-OqCBp41qTcBmFbs2STscCWbpuJdtqkyw-ykVJ0';
  const localeJwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0ZXN0X2p3dF9pc3N1ZXIiLCJwYXlsb2FkIjp7InNpdGVyZWZlcmVuY2UiOiJleGFtcGxlMTIzNDUiLCJiYXNlYW1vdW50IjoiMTAwMCIsImN1cnJlbmN5aXNvM2EiOiJHQlAiLCJsb2NhbGUiOiJlc19FUyJ9LCJpYXQiOjE1MTYyMzkwMjJ9.UlcfhQi8ooypaXaQcHMa7m1XTr29Q8ku3u60aBfSkHw';

  // then
  each([
    [gbpJwt, 'example12345', 'GBP', '10.00', 'en_GB'],
    [jpyJwt, 'example67890', 'JPY', '1100', 'en_GB'],
    [usdJwt, 'example12345', 'USD', '1234567.89', 'en_GB'],
    [mainamountUsdJwt, 'example12345', 'USD', '1234567.89', 'en_GB'],
    [localeJwt, 'example12345', 'GBP', '10.00', 'es_ES']
  ]).test('StJwt contents', (jwt, expectedSite, expectedCurrency, expectedMainamount, expectedLocale) => {
    let testJwt = new StJwt(jwt);
    expect(testJwt.sitereference).toBe(expectedSite);
    expect(testJwt.currencyiso3a).toBe(expectedCurrency);
    expect(testJwt.mainamount).toBe(expectedMainamount);
    expect(testJwt.locale).toBe(expectedLocale);
  });
});
