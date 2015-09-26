var access_token = 'eyJ1c2VyIjoiNTM1NTE5OTE4YzU5Mzc1ZDJiMzM1MzJhIiwiYXBwIjoiNTYwNmUxNDRiMmYyZjYwYzAwNjlhNzNiIiwiY2hhbGxlbmdlIjowLCIkZSI6MH0KEgXDgzfDhMK5LAvDvAdnCEbCm8OFw5w';
var paymentAccountId = "53565b678c59375d2b339623";

var debitoor = require('debitoor')(access_token);
var _ = require('underscore');
var json2csv = require('json2csv');

debitoor('/v1.0/paymentaccounts/' + paymentAccountId + '/transactions', function (error, response, body) {
    var transactions = body;

    var invoicePayments = [];

    _.each(transactions, function(transaction, index, list){
    	if(transaction.payments) {
    		_.each(transaction.payments.invoices, function(invoicePayment, index, list){
	    		invoicePayments.push(invoicePayment);
	    	});
    	}
    });

    _.each(invoicePayments, function(payment, index, list){
    	debitoor('/sales/invoices/' + payment.invoiceId + '/v1', function(error, response, body){

    		var fields = ['Nr.', 'Rechnungsnummer', 'Rechnungsdatum', 'Buchungsdatum', 'Betrag Netto', 'Betrag Steuer', 'Betrag Brutto']

    		json2csv({ data: myCars, fields: fields }, function(err, csv) {
			  if (err) console.log(err);
			  fs.writeFile('file.csv', csv, function(err) {
			    if (err) throw err;
			    console.log('file saved');
			  });
			});
    	});
    });
});