// // @ts-ignore
// import SecureTrading from './../dist/st';
// // @ts-ignore
// (() => {
//   const ST = SecureTrading;
//   window
//     .fetch('https://merchant.example.com:8443/config.json')
//     .then(response => {
//       if (response.status !== 200) {
//         return Promise.reject('Configuration has not been set !');
//       }
//       return response.json();
//     })
//     .then(data => {
//       if (data) {
//         configurationInit(ST, data);
//       } else {
//         fetchDefaultConfig(ST);
//       }
//     })
//     .catch(() => {
//       fetchDefaultConfig(ST);
//     });
// })();
//
// // @ts-ignore
// const fetchDefaultConfig = (STJS: SecureTrading) => {
//   fetch('./../json/config.json')
//     .then(response => {
//       if (response.status !== 200) {
//         return Promise.reject('Default configuration has not been set !');
//       }
//       return response.json();
//     })
//     .then(data => {
//       if (data) {
//         configurationInit(STJS, data);
//       }
//     });
// };
// // @ts-ignore
// const configurationInit = (STJS: SecureTrading, data: any) => {
//   const stConfig = data;
//   const parsedUrl = new URL(window.location.href);
//   stConfig.jwt = parsedUrl.searchParams.get('jwt') || stConfig.jwt;
//   const st = STJS(stConfig);
//
//   st.submitCallback = (jsonData: any) => {
//     const stringified = JSON.stringify(jsonData);
//     const testVariable = 'This is what we have got after submit' + stringified;
//   };
//   st.Components(stConfig.components);
//   st.ApplePay(stConfig.applePay);
//   st.VisaCheckout(stConfig.visaCheckout);
//   document.getElementById('example-form-amount').addEventListener('input', () => {
//     st.updateJWT(
//       'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTU3NjI0MDkwM' +
//         'y44NDgxOTIyLCJwYXl' +
//         'sb2FkIjp7Im1' +
//         'haW5hbW91bnQiOiIxMC4wMCIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIiwiY3VycmVuY3lpc28zYSI6' +
//         'IkdCUCIsInNpdGVyZWZl' +
//         'cmVuY2UiOiJ0ZXN0X2phbWVzMzg2NDEiLCJsb2NhbGUiOiJlbl9HQiJ9fQ.dZf3tVclkUTXMR1uXo39jUIXHyjA' +
//         'pGXYlAJ-5ujen00'
//     );
//   });
// };
