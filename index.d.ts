/// <reference types="node" />

import { Transform, Readable } from "stream";

export declare type Options = {
  /**
   * Specify what is the CSV delimiter
   * @default ","
   */
  delimiter?: string;

  /**
   * Support Excel-like multiline CSV
   * @default true
   */
  multiline?: boolean;

  /**
   * Allow quotation marks to wrap columns
   * @default true
   */
  allowQuotes?: boolean;

  /**
   * Should empty lines be automatically skipped?
   * @default false
   */
  skipEmptyLines?: boolean;

  /**
   * Automatically parse numbers (with a . as the decimal separator)
   * @default false
   */
  parseNumbers?: boolean;

  /**
   * Automatically parse booleans (strictly lowercase `true` and `false`)
   * @default false
   */
  parseBooleans?: boolean;

  /**
   * Automatically left-trims columns
   * @default false
   */
  ltrim?: boolean;

  /**
   * Automatically right-trims columns
   * @default false
   */
  rtrim?: boolean;

  /**
   * If true, then both 'ltrim' and 'rtrim' are set to true
   * @default false
   */
  trim?: boolean;

  /**
   * If true, then skip the first header row
   * @default false
   */
  skipHeader?: boolean;

  /**
   * If true, each row will be converted automatically to an object based on the header.
   * This implied `skipHeader=true`.
   * @default false
   */
  asObject?: boolean;
};

export declare type DataTypes = string | number | boolean;

export declare type Line = DataTypes[] | { [header: string]: DataTypes };

declare interface CsvReadableStream extends Transform {
  /**
   * Create a new readable stream that parses CSV data into events, line by line
   * @constructor
   */
  new(options?: Options): this;

  /**
   * Create a new readable stream that parses CSV data into events, line by line
   */
  (options?: Options): this;

  addListener(event: "close", listener: () => void): this;
  addListener(event: "data", listener: (line: Line) => void): this;
  addListener(event: "header", listener: (headers: string[]) => void): this;
  addListener(event: "end", listener: () => void): this;
  addListener(event: "readable", listener: () => void): this;
  addListener(event: "drain", listener: () => void): this;
  addListener(event: "error", listener: (err: Error) => void): this;
  addListener(event: "finish", listener: () => void): this;
  addListener(event: "pipe", listener: (src: Readable) => void): this;
  addListener(event: "unpipe", listener: (src: Readable) => void): this;
  addListener(event: string | symbol, listener: (...args: any[]) => void): this;

  on(event: "close", listener: () => void): this;
  on(event: "data", listener: (line: Line) => void): this;
  on(event: "header", listener: (headers: string[]) => void): this;
  on(event: "end", listener: () => void): this;
  on(event: "readable", listener: () => void): this;
  on(event: "drain", listener: () => void): this;
  on(event: "error", listener: (err: Error) => void): this;
  on(event: "finish", listener: () => void): this;
  on(event: "pipe", listener: (src: Readable) => void): this;
  on(event: "unpipe", listener: (src: Readable) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this;

  once(event: "close", listener: () => void): this;
  once(event: "data", listener: (line: Line) => void): this;
  once(event: "header", listener: (headers: string[]) => void): this;
  once(event: "end", listener: () => void): this;
  once(event: "readable", listener: () => void): this;
  once(event: "drain", listener: () => void): this;
  once(event: "error", listener: (err: Error) => void): this;
  once(event: "finish", listener: () => void): this;
  once(event: "pipe", listener: (src: Readable) => void): this;
  once(event: "unpipe", listener: (src: Readable) => void): this;
  once(event: string | symbol, listener: (...args: any[]) => void): this;

  prependListener(event: "close", listener: () => void): this;
  prependListener(event: "data", listener: (line: Line) => void): this;
  prependListener(event: "header", listener: (headers: string[]) => void): this;
  prependListener(event: "end", listener: () => void): this;
  prependListener(event: "readable", listener: () => void): this;
  prependListener(event: "drain", listener: () => void): this;
  prependListener(event: "error", listener: (err: Error) => void): this;
  prependListener(event: "finish", listener: () => void): this;
  prependListener(event: "pipe", listener: (src: Readable) => void): this;
  prependListener(event: "unpipe", listener: (src: Readable) => void): this;
  prependListener(
    event: string | symbol,
    listener: (...args: any[]) => void
  ): this;

  prependOnceListener(event: "close", listener: () => void): this;
  prependOnceListener(event: "data", listener: (line: Line) => void): this;
  prependOnceListener(
    event: "header",
    listener: (headers: string[]) => void
  ): this;
  prependOnceListener(event: "end", listener: () => void): this;
  prependOnceListener(event: "readable", listener: () => void): this;
  prependOnceListener(event: "drain", listener: () => void): this;
  prependOnceListener(event: "error", listener: (err: Error) => void): this;
  prependOnceListener(event: "finish", listener: () => void): this;
  prependOnceListener(event: "pipe", listener: (src: Readable) => void): this;
  prependOnceListener(event: "unpipe", listener: (src: Readable) => void): this;
  prependOnceListener(
    event: string | symbol,
    listener: (...args: any[]) => void
  ): this;

  removeListener(event: "close", listener: () => void): this;
  removeListener(event: "data", listener: (line: Line) => void): this;
  removeListener(event: "header", listener: (headers: string[]) => void): this;
  removeListener(event: "end", listener: () => void): this;
  removeListener(event: "readable", listener: () => void): this;
  removeListener(event: "drain", listener: () => void): this;
  removeListener(event: "error", listener: (err: Error) => void): this;
  removeListener(event: "finish", listener: () => void): this;
  removeListener(event: "pipe", listener: (src: Readable) => void): this;
  removeListener(event: "unpipe", listener: (src: Readable) => void): this;
  removeListener(
    event: string | symbol,
    listener: (...args: any[]) => void
  ): this;
}

declare const CsvReadableStream: CsvReadableStream;

export default CsvReadableStream;
