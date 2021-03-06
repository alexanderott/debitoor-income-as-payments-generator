var fs = require('fs');

// Configuration
var ACCESS_TOKEN = fs.readFileSync('./.access_token').toString();
var YEAR = 2015;

// Dependencies
var debitoor = require('debitoor')(ACCESS_TOKEN);
var _ = require('underscore');
var json2csv = require('json2csv');


debitoor('/sales/invoices/v1', function(error, response, body){

	var fieldNames = ['Nr.', 'Rechnungsnummer', 'Rechnungsdatum', 'Buchungsdatum', 'Betrag Netto', 'Betrag Steuer', 'Betrag Brutto'];
	var fields = ['number', 'invoiceNumber', 'invoiceDate', 'bookingDate', 'amountNet', 'amountTax', 'amountGross'];

	var data = [];

	var index = 0;

	body = JSON.parse(fs.readFileSync('./body.json'));


	_.each(body, function(invoice, i, list){
		if(invoice.payments){
			_.each(invoice.payments, function(payment, j, list){

				var paymentDate = new Date(payment.paymentDate);

				var taxRate = invoice.lines[0].taxRate;

				if(paymentDate.getFullYear() === YEAR) {
					var amountGross = payment.amount;
					var amountNet = amountGross;
					
					if(taxRate !== 0) {
						amountNet = amountGross/(taxRate/100+1);
					}
					var amountTax = amountGross - amountNet;

					data.push({
						number: index + 1,
						invoiceNumber: invoice.number,
						invoiceDate: invoice.date,
						bookingDate: payment.paymentDate,
						amountNet: (Math.round(amountNet*100)/100).toString().replace('.', ','),
						amountTax: (Math.round(amountTax*100)/100).toString().replace('.', ','),
						amountGross: (Math.round(amountGross*100)/100).toString().replace('.', ',')
					});

					data.sort(function(a,b){
						return new Date(a.bookingDate) - new Date(b.bookingDate);
					});

					index++;
				}
			});
		}
	});

	json2csv({ data: data, fields: fields, fieldNames: fieldNames, del: ';' }, function(err, csv) {
		if (err) console.log(err);
		fs.writeFile('income.csv', csv, function(err) {
			if (err) throw err;
			console.log('file saved');
		});
	});
});
