var http = require('http');
var querystring = require('querystring');
var xml2js = require('xml2js');
var dateFormat = require('dateformat');

function getExchangeRate(baseCurrency, transactionCurrency, date, callback) {

    // If the date is a Saturday or Sunday, change to the previous Friday
    if (date.getDay() === 6) { // Saturday
        date.setDate(date.getDate() - 1);
    } else if (date.getDay() === 0) { // Sunday
        date.setDate(date.getDate() - 2);
    }

    var data = {
        service: 'getExchngRateDetails',
        baseCurrency: baseCurrency,
        settlementDate: dateFormat(date, 'mm/dd/yyyy')
    };

    var queryString = querystring.stringify(data);

    var parameters = {
        host: 'www.mastercard.com',
        path: '/psder/eu/callPsder.do',
        method: 'POST',
        headers: {
            'Content-Length': queryString.length,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    var request = http.request(parameters, function (response) {
        var xml = '';
        response.on('data', function (chunk) {
            xml += chunk;
        });
        response.on('end', function () {
            xml2js.parseString(xml, function (err, result) {
                var currencies = result.PSDER.TRANSACTION_CURRENCY[0].TRANSACTION_CURRENCY_DTL;
                for (var i = 0; i < currencies.length; i++) {
                    if (currencies[i].ALPHA_CURENCY_CODE[0] === transactionCurrency) {
                        callback(parseFloat(currencies[i].CONVERSION_RATE[0], 10));
                        break;
                    }
                }
            });
        });
    });

    request.end(queryString);
}

module.exports.getExchangeRate = getExchangeRate;
