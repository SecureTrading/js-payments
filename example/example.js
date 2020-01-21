(function () {
    var ST = SecureTrading;
    window
        .fetch('https://webservices.securetrading.net:8443/config.json')
        .then(function (response) {
            if (response.status !== 200) {
                return Promise.reject('Configuration has not been set !');
            }
            return response.json();
        })
        .then(function (data) {
            if (data) {
                configurationInit(ST, data);
            } else {
                fetchDefaultConfig();
            }
        })
        .catch(function () {
            fetchDefaultConfig();
        });

    function fetchDefaultConfig() {
        fetch('./config.json')
            .then(function (response) {
                if (response.status !== 200) {
                    return Promise.reject('Default configuration has not been set !');
                }
                return response.json();
            })
            .then(function (data) {
                if (data) {
                    configurationInit(ST, data);
                }
            });
    }

    function configurationInit(ST, data) {
        var stConfig = data;
        var parsedUrl = new URL(window.location.href);
        stConfig.jwt = parsedUrl.searchParams.get('jwt') || stConfig.jwt;
        var st = ST(stConfig);

        st.submitCallback = function someFancyfunction(data) {
            var stringified = JSON.stringify(data);
            var testVariable = 'This is what we have got after submit' + stringified;
        };
        st.Components(stConfig.components);
        st.ApplePay(stConfig.applePay);
        st.VisaCheckout(stConfig.visaCheckout);
        document.getElementById('example-form-amount').addEventListener('input', function () {
            st.updateJWT(
                'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTU3MzczNjQ5Ni4wMzI3MTMyLCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00iLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwic2l0ZXJlZmVyZW5jZSI6InRlc3RfamFtZXMzODY0MSIsImxvY2FsZSI6ImVuX0dCIiwicGFuIjoiNDExMTExMTExMTExMTExMSIsImV4cGlyeWRhdGUiOiIwMS8yMiIsInNlY3VyaXR5Y29kZSI6IjEyMyJ9fQ.BnW7b7DMhh0XnJNCDKPHfqMjqVUCukM9SfhjtfyfDm0'
            );
        });
    }
})();