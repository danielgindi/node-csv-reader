# csv-reader

[![npm Version](https://badge.fury.io/js/csv-reader.png)](https://npmjs.org/package/csv-reader)

A CSV stream reader, with many many features, and ability to work with the largest datasets

## Included features: (can be turned on and off)

* Support for excel-style multiline cells wrapped in quotes
* Choosing a different delimiter instead of the comma
* Automatic skipping empty lines
* Automatic skipping of the first header row
* Automatic parsing of numbers and booleans
* Automatic trimming
* Being a stream transformer, you can `.pause()` if you need some time to process the row and `.resume()` when you are ready to receive and process more rows.
* Consumes and emits rows one-by-one, allowing you to process datasets in any size imaginable.
* Automatically strips the BOM if exists (not handled automatically by node.js stream readers)

## Installation:

```
npm install --save csv-reader
```

The options you can pass are:

Name | Type | Default | Explanation
---- | ---- | ------- | -----------
  `delimiter` | `String` | `,` | The character that separates between cells 
  `multiline` | `Boolean` | `true` | Allow multiline cells, when the cell is wrapped with quotes ("...\n...") 
  `allowQuotes` | `Boolean` | `true` | Should quotes be treated as a special character that wraps cells etc.
  `skipEmptyLines` | `Boolean` | `false` | Should empty lines be automatically skipped?
  `skipHeader` | `Boolean` | `false` | Should the first header row be skipped?
  `asObject` | `Boolean` | `false` | If true, each row will be converted automatically to an object based on the header. This implied `skipHeader=true`.
  `parseNumbers` | `Boolean` | `false` | Should numbers be automatically parsed? This will parse any format supported by `parseFloat` including scientific notation, `Infinity` and `NaN`.
  `parseBooleans` | `Boolean` | `false` | Automatically parse booleans (strictly lowercase `true` and `false`)
  `ltrim` | `Boolean` | `false` | Automatically left-trims columns
  `rtrim` | `Boolean` | `false` | Automatically right-trims columns
  `trim` | `Boolean` | `false` | If true, then both 'ltrim' and 'rtrim' are set to true
  
## Events:

A `'data'` event will be emitted with each row, either in an array format (`(string|number|boolean)[]`) or an Object format (`Object<string, (string|number|boolean)>`), depending on the `asObject` option.  
A preliminary `'header'` event will be emitted with the first row, only in an array format, and without any interpolation to different types (`string[]`).  
Of course other events as usual - `end` and `error`.

## Usage example:

```javascript

const Fs = require('fs');
const CsvReadableStream = require('csv-reader');

let inputStream = Fs.createReadStream('my_data.csv', 'utf8');

inputStream
	.pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
	.on('data', function (row) {
	    console.log('A row arrived: ', row);
	})
	.on('end', function () {
	    console.log('No more rows!');
	});

```

A common issue with CSVs are that Microsoft Excel for some reason *does not save UTF8 files*. Microsoft never liked standards.
In order to automagically handle the possibility of such files with ANSI encodings arriving from user input, you can use the [autodetect-decoder-stream](https://www.npmjs.com/package/autodetect-decoder-stream) like this:

```javascript

const Fs = require('fs');
const CsvReadableStream = require('csv-reader');
const AutoDetectDecoderStream = require('autodetect-decoder-stream');

let inputStream = Fs.createReadStream('my_data.csv')
	.pipe(new AutoDetectDecoderStream({ defaultEncoding: '1255' })); // If failed to guess encoding, default to 1255

// The AutoDetectDecoderStream will know if the stream is UTF8, windows-1255, windows-1252 etc.
// It will pass a properly decoded data to the CsvReader.
 
inputStream
	.pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
	.on('data', function (row) {
	    console.log('A row arrived: ', row);
	}).on('end', function () {
	    console.log('No more rows!');
	});
	
```

## Contributing

If you have anything to contribute, or functionality that you lack - you are more than welcome to participate in this!
If anyone wishes to contribute unit tests - that also would be great :-)

## Me
* Hi! I am Daniel Cohen Gindi. Or in short- Daniel.
* danielgindi@gmail.com is my email address.
* That's all you need to know.

## Help

If you want to buy me a beer, you are very welcome to
[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=G6CELS3E997ZE)
 Thanks :-)

## License

All the code here is under MIT license. Which means you could do virtually anything with the code.
I will appreciate it very much if you keep an attribution where appropriate.

    The MIT License (MIT)

    Copyright (c) 2013 Daniel Cohen Gindi (danielgindi@gmail.com)

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.
