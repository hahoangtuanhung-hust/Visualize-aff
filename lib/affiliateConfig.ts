import { firestoreUrl, throwFirestoreError } from "@/lib/firebase";

export interface AffiliateConfig {
  person1: { name: string; url: string };
  person2: { name: string; url: string };
}

export const DEFAULT_AFFILIATE_CONFIG: AffiliateConfig = {
  person1: { name: "Admin", url: "https://shopee.vn" },
  person2: { name: "Cộng đồng", url: "https://shopee.vn" },
};

interface FirestoreStringValue {
  stringValue?: string;
}

interface FirestorePersonValue {
  mapValue?: {
    fields?: {
      name?: FirestoreStringValue;
      url?: FirestoreStringValue;
    };
  };
}

interface FirestoreAffiliateDocument {
  fields?: {
    person1?: FirestorePersonValue;
    person2?: FirestorePersonValue;
  };
}

function normalizeUrl(value: string | undefined, fallback: string) {
  if (!value) return fallback;

  try {
    const parsedUrl = new URL(value);
    return /^https?:$/.test(parsedUrl.protocol) ? parsedUrl.toString() : fallback;
  } catch {
    return fallback;
  }
}

function readPerson(
  value: FirestorePersonValue | undefined,
  fallback: AffiliateConfig["person1"]
) {
  const fields = value?.mapValue?.fields;

  return {
    name: fields?.name?.stringValue || fallback.name,
    url: normalizeUrl(fields?.url?.stringValue, fallback.url),
  };
}

export async function getAffiliateConfig() {
  const response = await fetch(firestoreUrl("config/affiliate"), {
    method: "GET",
    cache: "no-store",
  });

  if (response.status === 404) {
    return DEFAULT_AFFILIATE_CONFIG;
  }

  if (!response.ok) {
    await throwFirestoreError(response, "Không thể tải link affiliate từ Firebase");
  }

  const document = (await response.json()) as FirestoreAffiliateDocument;

  return {
    person1: readPerson(document.fields?.person1, DEFAULT_AFFILIATE_CONFIG.person1),
    person2: readPerson(document.fields?.person2, DEFAULT_AFFILIATE_CONFIG.person2),
  } satisfies AffiliateConfig;
}

export async function saveAffiliateConfig(config: AffiliateConfig) {
  const response = await fetch(firestoreUrl("config/affiliate"), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        person1: {
          mapValue: {
            fields: {
              name: { stringValue: config.person1.name },
              url: { stringValue: config.person1.url },
            },
          },
        },
        person2: {
          mapValue: {
            fields: {
              name: { stringValue: config.person2.name },
              url: { stringValue: config.person2.url },
            },
          },
        },
      },
    }),
  });

  if (!response.ok) {
    await throwFirestoreError(response, "Không thể lưu link affiliate lên Firebase");
  }
}
