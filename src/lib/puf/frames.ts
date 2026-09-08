/** 요청 FormData 에서 프레임 묶음을 읽습니다. 갤러리 업로드는 1장 묶음입니다. */
export async function parseFrames(form: FormData | null) {
  const files = (form?.getAll("frames") ?? []).filter((f): f is File => f instanceof File && f.size > 0);
  const total = files.reduce((n, f) => n + f.size, 0);
  if (files.length === 0) return { error: "이미지가 없어요.", status: 400 } as const;
  if (files.length > 30 || total > 40 * 1024 * 1024) return { error: "이미지가 너무 커요.", status: 413 } as const;
  let timestamps: number[] = [];
  try {
    const parsed = JSON.parse(String(form?.get("timestamps") ?? "[]"));
    if (Array.isArray(parsed)) timestamps = parsed.map((n) => Number(n) || 0);
  } catch {
    /* 없으면 순서대로 */
  }
  if (timestamps.length !== files.length) timestamps = files.map((_, i) => i * 200);
  const frames = await Promise.all(files.map(async (f) => Buffer.from(await f.arrayBuffer())));
  return { frames, timestamps } as const;
}
