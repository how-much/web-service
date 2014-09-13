var http = require('http');
var url = require('url');

var rateProviders = {
    mastercard: require('./providers/mastercard.js')
};

http.createServer(function (req, res) {
    // Sample URL: http://localhost/?provider=mastercard&transactionAmount=12&baseCurrency=EUR&transactionCurrency=GBP
    var parameters = url.parse(req.url, true).query;

    if (parameters.provider && rateProviders[parameters.provider] && parameters.transactionAmount && parameters.baseCurrency && parameters.transactionCurrency) {

        var date = new Date();
        if (parameters.date) {
            var timestamp = Date.parse(parameters.date);
            if (timestamp) {
                date = new Date(timestamp);
            }
        }


        var rateProvider = rateProviders[parameters.provider];
        rateProvider.getExchangeRate(parameters.baseCurrency, parameters.transactionCurrency, date, function (exchangeRate) {

            var cost = parameters.transactionAmount / exchangeRate;
            
            var percentCharge, minCharge;
            if (parameters.percentCharge && parseFloat(parameters.percentCharge)) {
                percentCharge = cost * parameters.percentCharge / 100;
            }
            if (parameters.minCharge && parseFloat(parameters.minCharge)) {
                minCharge = parseFloat(parameters.minCharge);
            }

            if (percentCharge && minCharge) {
                cost += Math.max(percentCharge, minCharge);
            } else if (percentCharge) {
                cost += percentCharge;
            } else if (minCharge) {
                cost += minCharge;
            }

            var json = {
                cost: cost
            };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(json));
        });

    } else {
        res.writeHead(404);
        res.end();
    }

}).listen(80);