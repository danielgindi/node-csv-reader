const assert = require("assert");
const Fs = require("fs");
const Path = require("path");
const CsvReadableStream = require("../index.js");

describe("Header Processing", async () => {
  it(`Test setting header line`, async () => {
    let [header, output] = await new Promise((resolve, reject) => {
      let inputStream = Fs.createReadStream(
        Path.join(__dirname, "test-header-after-preamble.csv"),
        "utf8",
      );
      let header = null;
      let output = [];

      inputStream
        .pipe(
          new CsvReadableStream({
            headerLine: 4,
          }),
        )
        .on("header", (row) => {
          header = row;
        })
        .on("data", (row) => {
          output.push(row);
        })
        .on("end", () => {
          resolve([header, output]);
        })
        .on("error", (err) => {
          reject(err);
        });
    });

    assert.deepEqual(header, ["NAME", "AGE", "ALIVE"]);

    assert.deepEqual(output, [
      ["John Smith", "50", "false"],
      ["Jane Doe", "25", "true"],
    ]);
  });

  it(`Test setting header line and skip a line`, async () => {
    let [header, output] = await new Promise((resolve, reject) => {
      let inputStream = Fs.createReadStream(
        Path.join(__dirname, "test-header-after-preamble.csv"),
        "utf8",
      );
      let header = null;
      let output = [];

      inputStream
        .pipe(
          new CsvReadableStream({
            headerLine: 4,
            skipLines: 1,
          }),
        )
        .on("header", (row) => {
          header = row;
        })
        .on("data", (row) => {
          output.push(row);
        })
        .on("end", () => {
          resolve([header, output]);
        })
        .on("error", (err) => {
          reject(err);
        });
    });

    assert.deepEqual(header, ["NAME", "AGE", "ALIVE"]);

    assert.deepEqual(output, [
      ["Jane Doe", "25", "true"],
    ]);
  });

  it(`Test setting header line with object mapped rows`, async () => {
    let [header, output] = await new Promise((resolve, reject) => {
      let inputStream = Fs.createReadStream(Path.join(__dirname, 'test-header-after-preamble.csv'), 'utf8');
      let header = null;
      let output = [];

      inputStream
        .pipe(new CsvReadableStream({
          parseNumbers: true,
          parseBooleans: true,
          trim: true,
          asObject: true,
          headerLine: 4,
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
