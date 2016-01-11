var fs = require('fs');

// Configuration
var ACCESS_TOKEN = fs.readFileSync('./.access_token').toString();
console.log(ACCESS_TOKEN);
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

	_.each(body, function(invoice, i, list){
		if(invoice.payments){
			_.each(invoice.payments, function(payment, j, list){

				var paymentDate = new Date(payment.paymentDate);

				if(paymentDate.getFullYear() === YEAR) {
					var amountGross = payment.amount;
					var amountNet = amountGross/1.2;
					var amountTax = amountGross - amountNet;

					data.push({
						number: index,
						invoiceNumber: invoice.number,
						invoiceDate: invoice.date,
						bookingDate: payment.paymentDate,
						amountNet: (Math.round(amountNet*100)/100).toString().replace('.', ','),
						amountTax: (Math.round(amountTax*100)/100).toString().replace('.', ','),
						amountGross: (Math.round(amountGross*100)/100).toString().replace('.', ',')
					})

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
