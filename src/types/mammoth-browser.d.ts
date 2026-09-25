declare module 'mammoth/mammoth.browser.min.js' {
  interface Message {
    type: 'warning' | 'error';
    message: string;
  }
  interface Result {
    value: string;
    messages: Message[];
  }
  interface Input {
    arrayBuffer: ArrayBuffer;
  }
  interface Options {
    ignoreEmptyParagraphs?: boolean;
    includeDefaultStyleMap?: boolean;
    styleMap?: string | string[];
  }
  const mammoth: {
    convertToHtml(input: Input, options?: Options): Promise<Result>;
    extractRawText(input: Input): Promise<Result>;
  };
  export default mammoth;
}
