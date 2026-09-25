import { useEffect, useMemo, useState } from 'react';
import { canPreviewNatively } from '~/lib/file/capabilities';
import { extensionOf } from '~/lib/file/filename';

/** Small thumbnail for an input file; a format badge when the browser can't display it. */
export function FilePreview({ file, size = 40 }: { file: File; size?: number }) {
  const [failed, setFailed] = useState(false);
  const previewable = canPreviewNatively(file.type, file.name) && file.size < 30 * 1024 * 1024;
  const url = useMemo(() => (previewable ? URL.createObjectURL(file) : null), [file, previewable]);
  useEffect(() => () => void (url && URL.revokeObjectURL(url)), [url]);

  const ext = (extensionOf(file.name).slice(1) || 'file').slice(0, 4).toUpperCase();
  return (
    <span
      className="checker relative flex shrink-0 items-center justify-center overflow-hidden rounded-md shadow-border"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {url && !failed ? (
        <img
          src={url}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-surface-2 font-mono text-[10px] font-medium text-fg-2">
          {ext}
        </span>
      )}
    </span>
  );
}
