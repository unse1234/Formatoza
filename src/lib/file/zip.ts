/** Bundles outputs into a ZIP for "Download all" (fflate is lazy-loaded). */
export async function zipBlobs(files: { name: string; blob: Blob }[]): Promise<Blob> {
  const { zip } = await import('fflate');
  const entries: Record<string, [Uint8Array, { level: 0 | 6 }]> = {};
  const used = new Set<string>();
  for (const f of files) {
    let name = f.name;
    let n = 2;
    while (used.has(name.toLowerCase())) name = f.name.replace(/(\.[^.]*)?$/, ` (${n++})$1`);
    used.add(name.toLowerCase());
    // Already-compressed formats are stored; text is deflated.
    const compressed =
      /^(image\/(jpeg|png|webp|gif|avif)|application\/(pdf|zip|vnd\.openxml))/.test(f.blob.type);
    entries[name] = [new Uint8Array(await f.blob.arrayBuffer()), { level: compressed ? 0 : 6 }];
  }
  return new Promise((resolve, reject) =>
    zip(entries, (err, data) =>
      err ? reject(err) : resolve(new Blob([data as BlobPart], { type: 'application/zip' })),
    ),
  );
}

/** Triggers a download of a Blob and cleans up the object URL afterwards. */
export function downloadBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.rel = 'noopener';
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
