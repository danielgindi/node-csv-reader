var fs = require('fs');
var CsvReadableStream = require('../index.js');

var inputStream = fs.createReadStream('test/test-header.csv', 'utf8');

inputStream
	.pipe(CsvReadableStream({ 
        parseNumbers: true, 
        parseBooleans: true, 
        trim: true,
        skipHeader: true }))
	.on('data', function (row) {
	    console.log('A row arrived: ', row);
	})
	.on('end', function (data) {
	    console.log('No more rows!');
	});