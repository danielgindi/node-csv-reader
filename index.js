const Stream = require('stream');
const Util = require('util');

/**
 * @const
 * @type {RegExp}
 */
const PARSE_FLOAT_TEST = /^[0-9]+(?:\.[0-9]*)?(?:[eE]\+[0-9]+)?$|^(?:[0-9]+)?\.[0-9]+(?:e+[0-9]+)?$|^[-+]?Infinity$|^[-+]?NaN$/;

const Transform = Stream.Transform;

/**
 * @param {Object?} options
 * @param {string} [options.delimiter=','] - Specify what is the CSV delimeter
 * @param {boolean} [options.multiline=true] - Support Excel-like multiline CSV
 * @param {boolean} [options.allowQuotes=true] - Allow quotation marks to wrap columns
 * @param {boolean} [options.skipEmptyLines=false] - Should empty lines be automatically skipped?
 * @param {boolean} [options.parseNumbers=false] - Automatically parse numbers (with a . as the decimal separator)
 * @param {boolean} [options.parseBooleans=false] - Automatically parse booleans (strictly lowercase `true` and `false`)
 * @param {boolean} [options.ltrim=false] - Automatically left-trims columns
 * @param {boolean} [options.rtrim=false] - Automatically right-trims columns
 * @param {boolean} [options.trim=false] - If true, then both 'ltrim' and 'rtrim' are set to true
 * @param {boolean} [options.skipHeader=false] - If true, then skip the first header row
 * @returns {CsvReadableStream}
 * @constructor
 */
const CsvReadableStream = function (options) {
    options = options || {};

    //noinspection JSUndefinedPropertyAssignment
    options.objectMode = true;

    if (!(this instanceof CsvReadableStream)) {
        return new CsvReadableStream(options);
    }

    let data = null,
        dataIndex = null,
        nextIndex = null,
        dataLen = null,
        columns = [],
        column = '',
        lastLineEndCR = false,
        lookForBOM = true,
        isQuoted = false,
        rowCount = 0;

    const multiline = !!options.multiline || typeof options.multiline === 'undefined',
        delimiter = options.delimiter != null ? options.delimiter.toString() || ',' : ',',
        allowQuotes = !!options.allowQuotes || typeof options.allowQuotes === 'undefined',
        skipEmptyLines = !!options.skipEmptyLines,
        parseNumbers = !!options.parseNumbers,
        parseBooleans = !!options.parseBooleans,
        ltrim = !!options.ltrim || !!options.trim,
        rtrim = !!options.rtrim || !!options.trim,
        trim = ltrim && rtrim,
        skipHeader = options.skipHeader,

        postProcessingEnabled = parseNumbers || parseBooleans || ltrim || rtrim;

    const postProcessColumn = function (column) {

        if (trim) {
            column = column.trim();
        } else if (ltrim) {
            column = column.replace(/^\s+/, '');
        } else if (rtrim) {
            column = column.replace(/\s+$/, '');
        }

        if (parseBooleans) {
            if (column === 'true') {
                return true;
            }
            if (column === 'false') {
                return false;
            }
        }

        if (parseNumbers) {
            if (PARSE_FLOAT_TEST.test(column)) {
                return parseFloat(column);
            }
        }

        return column;
    };

    this._processChunk = function (newData) {

        if (newData) {
            if (data) {
                data = data.substr(dataIndex) + newData;
            } else {
                data = newData;
            }
            dataLen = data.length;
            dataIndex = 0;
        }

        // Node doesn't strip BOMs, that's in user's land
        if (lookForBOM) {
            if (newData.charCodeAt(0) === 0xfeff) {
                dataIndex++;
            }
            lookForBOM = false;
        }

        let isFinishedLine = false;

        for (; dataIndex < dataLen; dataIndex++) {
            const c = data[dataIndex];

            if (c === '\n' || c === '\r') {
                if (!isQuoted || !multiline) {
                    if (lastLineEndCR && c === '\n') {
                        lastLineEndCR = false;
                        continue;
                    }
                    lastLineEndCR = c === '\r';
                    dataIndex++;
                    isFinishedLine = true;
                    rowCount++;

                    if (!multiline) {
                        isQuoted = false;
                    }

                    break;
                }
            }

            if (isQuoted) {
                if (c === '"') {
                    nextIndex = dataIndex + 1;

                    // Do we have enough data to peek at the next character?
                    if (nextIndex >= dataLen && !this._isStreamDone) {
                        // Wait for more data to arrive
                        break;
                    }

                    if (nextIndex < dataLen && data[nextIndex] === '"') {
                        column += '"';
                        dataIndex++;
                    } else {
                        isQuoted = false;
                    }
                } else {
                    column += c;
                }
            } else {
                if (c === delimiter) {
                    columns.push(column);
                    column = '';
                } else if (c === '"' && allowQuotes) {
                    if (column.length) {
                        column += c;
                    } else {
                        isQuoted = true;
                    }
                } else {
                    column += c;
                }
            }
        }

        if (dataIndex === dataLen) {
            data = null;
        }

        if (isFinishedLine && skipHeader && rowCount === 1) {
            column = '';
            columns = [];
            // Look to see if there are more rows in available data
            this._processChunk();
            return;
        } else if (isFinishedLine || (data === null && this._isStreamDone)) {

            if (columns.length || column || data || !this._isStreamDone) {

                // We have a row, send it to the callback

                // Commit this row
                columns.push(column);
                const row = columns;

                // Clear row state data
                columns = [];
                column = '';
                isQuoted = false;

                // Is this row full or empty?
                if (row.length > 1 || row[0].length || !skipEmptyLines) {

                    // Post processing
                    if (postProcessingEnabled) {
                        let i = 0;
                        const rowSize = row.length;
                        for (; i < rowSize; i++) {
                            row[i] = postProcessColumn(row[i]);
                        }
                    }

                    // Emit the parsed row
                    //noinspection JSUnresolvedFunction
                    this.push(row);
                }

                // Look to see if there are more rows in available data
                this._processChunk();

            } else {
                // We just ran into a newline at the end of the file, ignore it
            }

        } else {

            if (data) {

                // Let more data come in.
                // We are probably waiting for a "peek" at the next character

            } else {

                // We have probably hit end of file.
                // Let the end event come in.

            }

        }

    };

    Transform.call(this, options);
};

Util.inherits(CsvReadableStream, Transform);

//noinspection JSUnusedGlobalSymbols
CsvReadableStream.prototype._transform = function (chunk, enc, cb) {

    this._processChunk(chunk);

    cb();
};

//noinspection JSUnusedGlobalSymbols
CsvReadableStream.prototype._flush = function (cb) {

    this._isStreamDone = true;

    this._processChunk();

    cb();
};

/**
 * @module
 * @type {CsvReadableStream}
 */
module.exports = CsvReadableStream;
