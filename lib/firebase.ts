const FIREBASE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "shopee-voucher-hub";
const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  "AIzaSyC7AKyzHUNDuLjRFPp8ZGceVRzcDLZ-HlE";

const FIRESTORE_ROOT = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

export function firestoreUrl(path: string, query = "") {
  const normalizedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const parameters = query
    ? `${query}&key=${encodeURIComponent(FIREBASE_API_KEY)}`
    : `key=${encodeURIComponent(FIREBASE_API_KEY)}`;

  return `${FIRESTORE_ROOT}/${normalizedPath}?${parameters}`;
}

export async function throwFirestoreError(
  response: Response,
  action: string
): Promise<never> {
  let details = "";

  try {
    const payload = (await response.json()) as {
      error?: { message?: string };
    };
    details = payload.error?.message || "";
  } catch {
    details = "";
  }

  throw new Error(
    details
      ? `${action} (${response.status}): ${details}`
      : `${action} (${response.status})`
  );
}
