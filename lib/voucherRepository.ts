import { VoucherItem, VoucherTag } from "@/data/mockVouchers";
import { firestoreUrl, throwFirestoreError } from "@/lib/firebase";

interface FirestoreValue {
  stringValue?: string;
  integerValue?: string | number;
}

interface FirestoreVoucherDocument {
  name?: string;
  fields?: {
    code?: FirestoreValue;
    detail?: FirestoreValue;
    tag?: FirestoreValue;
    updatedAt?: FirestoreValue;
  };
}

interface FirestoreVoucherList {
  documents?: FirestoreVoucherDocument[];
  nextPageToken?: string;
}

const VALID_TAGS: VoucherTag[] = ["Mã acc mới", "Mã acc cũ"];

function readVoucher(document: FirestoreVoucherDocument): VoucherItem | null {
  const encodedId = document.name?.split("/").pop();
  const code = document.fields?.code?.stringValue?.trim().toUpperCase();
  const detail = document.fields?.detail?.stringValue?.trim();
  const tag = document.fields?.tag?.stringValue as VoucherTag | undefined;
  const updatedAt = Number(document.fields?.updatedAt?.integerValue);

  if (
    !encodedId ||
    !code ||
    !detail ||
    !tag ||
    !VALID_TAGS.includes(tag) ||
    !Number.isFinite(updatedAt)
  ) {
    return null;
  }

  return {
    id: decodeURIComponent(encodedId),
    code,
    detail,
    tag,
    updatedAt,
  };
}

function voucherFields(voucher: VoucherItem) {
  return {
    fields: {
      code: { stringValue: voucher.code.trim().toUpperCase() },
      detail: { stringValue: voucher.detail.trim() },
      tag: { stringValue: voucher.tag },
      updatedAt: { integerValue: String(voucher.updatedAt) },
    },
  };
}

export async function getVouchers() {
  const vouchers: VoucherItem[] = [];
  let pageToken = "";

  do {
    const query = pageToken
      ? `pageSize=100&pageToken=${encodeURIComponent(pageToken)}`
      : "pageSize=100";
    const response = await fetch(firestoreUrl("vouchers", query), {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      await throwFirestoreError(response, "Không thể tải voucher từ Firebase");
    }

    const payload = (await response.json()) as FirestoreVoucherList;

    for (const document of payload.documents || []) {
      const voucher = readVoucher(document);
      if (voucher) vouchers.push(voucher);
    }

    pageToken = payload.nextPageToken || "";
  } while (pageToken);

  return vouchers.sort((first, second) => second.updatedAt - first.updatedAt);
}

export async function saveVoucher(voucher: VoucherItem) {
  const response = await fetch(
    firestoreUrl(`vouchers/${voucher.id}`),
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(voucherFields(voucher)),
    }
  );

  if (!response.ok) {
    await throwFirestoreError(response, "Không thể lưu voucher lên Firebase");
  }
}

export async function deleteVoucher(id: string) {
  const response = await fetch(firestoreUrl(`vouchers/${id}`), {
    method: "DELETE",
  });

  if (!response.ok && response.status !== 404) {
    await throwFirestoreError(response, "Không thể xóa voucher trên Firebase");
  }
}
