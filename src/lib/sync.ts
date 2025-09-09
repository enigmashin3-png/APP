export async function uploadBackup(
  url: string,
  key: string,
  payloadJson: string,
): Promise<{ ok: boolean; msg: string }> {
  if (!url) return { ok: false, msg: "Sync URL is empty" };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-sync-key": key ?? "" },
      body: payloadJson,
    });
    if (!res.ok) return { ok: false, msg: `HTTP ${res.status}` };
    return { ok: true, msg: "Uploaded" };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Network error';
    return { ok: false, msg };
  }
}

export async function downloadBackup(
  url: string,
  key: string,
): Promise<{ ok: boolean; msg: string; json?: string }> {
  if (!url) return { ok: false, msg: "Sync URL is empty" };
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "x-sync-key": key ?? "" },
    });
    if (!res.ok) return { ok: false, msg: `HTTP ${res.status}` };
    const text = await res.text();
    return { ok: true, msg: "Downloaded", json: text };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Network error';
    return { ok: false, msg };
  }
}
