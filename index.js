const Stream = require('stream');
const Util = require('util');

/**
 * @const
 * @type {RegExp}
 */
const PARSE_FLOAT_TEST = /^[-+]?\d+(?:\.\d*)?(?:[eE]\+\d+)?$|^(?:\d+)?\.\d+(?:e+\d+)?$|^[-+]?Infinity$|^[-+]?NaN$/;

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
 * @param {boolean} [options.asObject=false] - If true, each row will be converted automatically to an object based
 *                                             on the header. This implied `skipHeader=true`.
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
        column = '',
        columnCount = 0,
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
        asObject = !!options.asObject,
        skipHeader = !!options.skipHeader || asObject,

        postProcessingEnabled = parseNumbers || parseBooleans || ltrim || rtrim;

    let headerRow = [];

    /** @type {*[]|Object<string,*>} */
    let columns = asObject === true ? {} : [];

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
                data = data.substring(dataIndex) + newData;
            } else {
                data = newData;
            }
            dataLen = data.length;
            dataIndex = 0;

            // Node doesn't strip BOMs, that's in user's land
            if (lookForBOM) {
                if (newData.charCodeAt(0) === 0xfeff) {
                    dataIndex++;
                }
                lookForBOM = false;
            }
        }

        let isFinishedLine = false;

        const rowIndex = rowCount;

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
                    if (rowIndex === 0) {
                        headerRow.push(column.trim());
                    }

                    if (column.length > 0 && postProcessingEnabled === true) {
                        column = postProcessColumn(column);
                    }

                    if (asObject === true) {
                        columns[headerRow[columnCount]] = column;
                    } else {
                        columns.push(column);
                    }

                    column = '';
                    columnCount++;
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

        if (isFinishedLine || (data === null && this._isStreamDone === true)) {

            if (columnCount > 0 ||
                column.length > 0 ||
                data !== null ||
                !this._isStreamDone) {

                const isEmptyRow = columnCount === 1 && column.length === 0;

                // Process last column
                if (rowIndex === 0) {
                    headerRow.push(column.trim());
                    this.emit('header', headerRow);
                }

                if (column.length > 0 && postProcessingEnabled === true) {
                    column = postProcessColumn(column);
                }

                if (asObject === true) {
                    columns[headerRow[columnCount]] = column;
                } else {
                    columns.push(column);
                }

                // Commit this row
                let row = columns;

                // Clear row state data
                columns = asObject === true ? {} : [];
                column = '';
                columnCount = 0;
                isQuoted = false;

                if (skipHeader === false || rowIndex > 0) {
                    // Is this row full or empty?
                    if (isEmptyRow === false || skipEmptyLines === false) {
                        // Emit the parsed row
                        //noinspection JSUnresolvedFunction
                        this.push(row);
                    }
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

    try {
        this._processChunk(chunk);

        cb();
    } catch (err) {
        cb(err);
    }
};

//noinspection JSUnusedGlobalSymbols
CsvReadableStream.prototype._flush = function (cb) {

    try {
        this._isStreamDone = true;

        this._processChunk();

        cb();
    } catch (err) {
        cb(err);
    }

};

/**
 * @module
 * @type {CsvReadableStream}
 */
module.exports = CsvReadableStream;
