const assert = require('assert');
const Fs = require('fs');
const Path = require('path');
const CsvReadableStream = require('../index.js');

describe('End to end', async () => {

	it(`Test basic csv read with skipping header`, async () => {
		let [header, output] = await new Promise((resolve, reject) => {
			let inputStream = Fs.createReadStream(Path.join(__dirname, 'test-header.csv'), 'utf8');
			let header = null;
			let output = [];

			inputStream
				.pipe(new CsvReadableStream({
					parseNumbers: true,
					parseBooleans: true,
					trim: true,
					skipHeader: true,
				}))
				.on('header', row => {
					header = row;
				})
				.on('data', row => {
					output.push(row);
				})
				.on('end', () => {
					resolve([header, output]);
				})
				.on('error', err => {
					reject(err);
				});
		});

		assert.deepEqual(header, [
			'NAME', 'AGE', 'ALIVE',
		]);

		assert.deepEqual(output, [
			['John Smith', 50, false],
			['Jane Doe', 25, true],
		]);
	});

	it(`Test basic csv read with object mapped rows`, async () => {
		let [header, output] = await new Promise((resolve, reject) => {
			let inputStream = Fs.createReadStream(Path.join(__dirname, 'test-header.csv'), 'utf8');
			let header = null;
			let output = [];

			inputStream
				.pipe(new CsvReadableStream({
					parseNumbers: true,
					parseBooleans: true,
					trim: true,
					asObject: true,
				}))
				.on('header', row => {
					header = row;
				})
				.on('data', row => {
					output.push(row);
				})
				.on('end', () => {
					resolve([header, output]);
				})
				.on('error', err => {
					reject(err);
				});
		});

		assert.deepEqual(header, [
			'NAME', 'AGE', 'ALIVE',
		]);

		assert.deepEqual(output, [
			{ NAME: 'John Smith', AGE: 50, ALIVE: false },
			{ NAME: 'Jane Doe', AGE: 25, ALIVE: true },
		]);
	});

});
