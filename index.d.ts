import { Transform } from "stream";

declare type CsvReadableStreamOptions = {
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
};

declare type Line = (string | number | boolean)[];

export declare class CsvReadableStream extends Transform {
  constructor(options?: CsvReadableStreamOptions);

  on(event: "data", cb: (line: Line) => void): CsvReadableStream;
}

export declare function CsvReadableStream(
  options?: CsvReadableStreamOptions
): CsvReadableStream;
