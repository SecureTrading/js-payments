(function() {
  var ST = SecureTrading;
  window
    .fetch('<%= WEBSERVICES_URL %>/config.json')
    .then(function(response) {
      if (response.status !== 200) {
        return Promise.reject('Configuration has not been set !');
      }
      return response.json();
    })
    .then(function(data) {
      try {
        configurationInit(ST, data);
      } catch (e) {
        console.error(e);
      }
    })
    .catch(function() {
      fetchDefaultConfig();
    });

  function fetchDefaultConfig() {
    fetch('./../json/config.json')
      .then(function(response) {
        if (response.status !== 200) {
          return Promise.reject('Default configuration has not been set !');
        }
        return response.json();
      })
      .then(function(data) {
        if (data) {
          configurationInit(ST, data);
        }
      });
  }

  function displayPopup(id, text, tp) {
    if (!document.getElementById(id)) {
      var div = document.createElement('div');
      div.innerText = text;
      div.setAttribute('id', id);
      div.setAttribute(
        'style',
        'display: flex; justify-content: center; position: fixed; height: 70px;right:0;color: white;padding: 0 50px;align-items: center;border-radius: 10px;font-family: Verdana;font-size: 20px;z-index:2'
      );
      div.style.backgroundColor = tp;
      if (tp === 'green') {
        div.style.top = 0;
      } else {
        div.style.bottom = 0;
      }
      var popup = document.getElementById('st-popup');
      popup.appendChild(div);
      setTimeout(function() {
        popup.removeChild(div);
      }, 3000);
    }
  }

  function configurationInit(ST, data) {
    var stConfig = data;
    var parsedUrl = new URL(window.location.href);
    stConfig.jwt = parsedUrl.searchParams.get('jwt') || stConfig.jwt;
    stConfig.submitCallback = function someFancyfunction(data) {
      var stringified = JSON.stringify(data);
      var testVariable = 'This is what we have got after submit' + stringified;
      console.error(testVariable);
    };
    stConfig.successCallback = function() {
      displayPopup('success-popup', 'This is success message', 'green');
    };
    stConfig.errorCallback = function() {
      displayPopup('error-popup', 'This is error message', 'red');
    };
    stConfig.cancelCallback = function() {
      displayPopup('cancel-popup', 'This is cancel message', '#ffc23a');
    };

    var st = ST(stConfig);
    st.Components(stConfig.components);
    st.VisaCheckout(stConfig.visaCheckout);
    st.ApplePay(stConfig.applePay);

    st.Cybertonica().then(function(response) {
      console.error(response);
    });

    document.getElementById('example-form-amount').addEventListener('input', function() {
      st.updateJWT('somejwt');

      var amountField = document.getElementById('example-form-amount');
      var priceField = document.getElementById('st-form-price');
      var amount = amountField.value ? amountField.value : 1;
      priceField.value = amount * 10;
    });
  }
})();
