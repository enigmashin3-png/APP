export async function fetchGoogleFitSteps(token: string): Promise<number> {
  const body = {
    aggregateBy: [{ dataTypeName: "com.google.step_count.delta" }],
    bucketByTime: { durationMillis: 86_400_000 },
    startTimeMillis: Date.now() - 86_400_000,
    endTimeMillis: Date.now(),
  };

  const res = await fetch("https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return json.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal ?? 0;
}

export async function fetchSamsungHealthSteps(token: string): Promise<number> {
  // Samsung Health does not currently expose a public web API. This function
  // serves as a placeholder for integrations that proxy data from the Samsung
  // Health SDK or companion devices.
  const res = await fetch("https://api.samsunghealth.com/steps", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return 0;
  const json = await res.json();
  return json.steps ?? 0;
}

export async function fetchAppleHealthSteps(token: string): Promise<number> {
  // Apple HealthKit data is typically read on-device and forwarded to your
  // backend. This endpoint is an example of how a proxy API could supply data.
  const res = await fetch("/api/apple-health/steps", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return 0;
  const json = await res.json();
  return json.steps ?? 0;
}

export function calculateCalories(met: number, weightKg: number, durationMinutes: number): number {
  return met * weightKg * (durationMinutes / 60);
}
