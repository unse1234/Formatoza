import type { IssueText } from './i18n';

/** An issue in the page language, with any English-only engine detail marked as such. */
export function IssueBody({ issue }: { issue: IssueText }) {
  return (
    <>
      <span lang={issue.english ? 'en' : undefined}>{issue.text}</span>
      {issue.detail && issue.detail !== issue.text && (
        <span className="mt-1 block text-[12.5px] text-fg-3" lang="en">
          {issue.detail}
        </span>
      )}
    </>
  );
}
