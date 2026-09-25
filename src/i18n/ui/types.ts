/**
 * Strings used by the converter island. Values are plain strings with `{placeholders}`
 * (and `{one, other}` plural pairs) so a dictionary can be serialised into an island prop:
 * a localized page ships only its own language, and English is bundled as the default.
 */
import type { ErrorCode } from '~/engines/types';

export interface Plural {
  one: string;
  other: string;
}

export interface UiStrings {
  /** BCP 47 tag used for plural rules. */
  locale: string;
  converterLabel: string;
  status: { blocked: string; loading: string; ready: string };
  capability: { fileApis: string; imageApis: string; avif: string };
  inputMethod: string;
  tabFiles: string;
  tabPaste: string;
  inputLabel: string;
  tryExample: string;
  clear: string;
  pastePlaceholder: string;
  autoConvertHint: string;
  largeInputHint: string;
  outputLabel: string;
  outputPlaceholder: string;
  converting: string;
  dismiss: string;
  fatalTitle: string;
  convertTo: string;
  convertN: string;
  combineN: string;
  convertAgain: string;
  startOver: string;
  files: Plural;
  summaryNothing: string;
  summaryReady: string;
  summaryPartial: string;
  preparingZip: string;
  downloadAllZip: string;
  resultsNote: string;
  announceReady: string;
  announceFailed: string;
  announceFatal: string;
  dropzone: {
    dropToAddFiles: string;
    dropToAddFile: string;
    addMore: string;
    dropFiles: string;
    dropFile: string;
    hintSingle: string;
    hintMulti: string;
    chooseFiles: string;
    chooseFile: string;
    pasteImage: string;
    pasteFile: string;
  };
  fileList: {
    label: string;
    cannotConvert: string;
    moveUp: string;
    moveDown: string;
    remove: string;
  };
  settings: {
    title: string;
    defaults: string;
    legend: string;
    on: string;
    off: string;
    useWhite: string;
    useBlack: string;
  };
  progress: {
    label: string;
    starting: string;
    cancel: string;
    /** Engine progress labels, matched by pattern (engines report English). */
    image: string;
    page: string;
    pageOfRun: string;
  };
  issues: {
    error: string;
    note: string;
    showMore: string;
    showFewer: string;
    technicalDetail: string;
  };
  result: {
    previewMode: string;
    code: string;
    preview: string;
    previewOf: string;
    contentsOf: string;
    loading: string;
    truncated: string;
    empty: string;
    convertedAlt: string;
    copy: string;
    copied: string;
    open: string;
    download: string;
    /** "{a} of {b}" for detail values such as "3 of 12". */
    of: string;
    detailKeys: Record<string, string>;
  };
  notices: {
    maxFiles: string;
    oneFile: string;
    duplicates: string;
    cancelled: string;
    pasteFirst: string;
    addValidFile: string;
    engineLoadFailed: string;
  };
  /**
   * Error text per error code. Empty for English, whose engines already speak it;
   * localized dictionaries must provide every code.
   */
  errors: Partial<Record<ErrorCode, string>>;
  /**
   * Settings text, keyed by the English label/help/choice/placeholder from
   * `src/engines/options.ts`. Empty for English. Tests require every string used by a
   * localized page's conversion to be translated.
   */
  options: Record<string, string>;
}
