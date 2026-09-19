"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Edit2, Check, X, Store } from "lucide-react";
import { toast } from "sonner";
import {
  AffiliateConfig,
  DEFAULT_AFFILIATE_CONFIG,
  getAffiliateConfig,
  saveAffiliateConfig,
} from "@/lib/affiliateConfig";

type PersonKey = keyof AffiliateConfig;

interface AffiliatePersonBoxProps {
  personKey: PersonKey;
  config: AffiliateConfig;
  editPerson: PersonKey | null;
  tempUrl: string;
  onTempUrlChange: (url: string) => void;
  onEdit: (person: PersonKey) => void;
  onCancel: () => void;
  onSave: (person: PersonKey) => void;
}

function AffiliatePersonBox({
  personKey,
  config,
  editPerson,
  tempUrl,
  onTempUrlChange,
  onEdit,
  onCancel,
  onSave,
}: AffiliatePersonBoxProps) {
  const isEditing = editPerson === personKey;
  const data = config[personKey];

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 w-full flex-1">
        <Input
          type="url"
          inputMode="url"
          value={tempUrl}
          onChange={(event) => onTempUrlChange(event.target.value)}
          placeholder="Nhập link Shopee affiliate..."
          className="h-11 text-base md:text-sm"
          autoFocus
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onSave(personKey)} className="flex-1">
            <Check className="w-4 h-4 mr-1" aria-hidden="true" /> Lưu
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel} className="flex-1">
            <X className="w-4 h-4 mr-1" aria-hidden="true" /> Hủy
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center flex-1 w-full gap-2">
      <a
        href={data.url}
        target="_blank"
        rel="noopener noreferrer"
        className="touch-target flex min-h-12 flex-1 items-center justify-between rounded-lg px-3 text-sm font-medium shadow-sm active:opacity-80"
        style={{
          backgroundColor:
            personKey === "person1" ? "var(--primary, #ee4d2d)" : "var(--background, #fff)",
          color:
            personKey === "person1" ? "var(--primary-foreground, #fff)" : "var(--foreground, #171717)",
          border:
            personKey === "person1" ? "1px solid transparent" : "1px solid var(--border, #e5e5e5)",
        }}
      >
        <span>Ủng hộ {data.name}</span>
        <ExternalLink className="ml-2 h-4 w-4 shrink-0" aria-hidden="true" />
      </a>
      <button
        type="button"
        aria-label={`Sửa link của ${data.name}`}
        title={`Sửa link của ${data.name}`}
        className="inline-flex items-center justify-center rounded-lg bg-white border shadow-sm text-gray-500 active:bg-gray-100"
        style={{ width: "48px", height: "48px", minWidth: "48px", minHeight: "48px", padding: 0 }}
        onClick={() => onEdit(personKey)}
      >
        <Edit2 className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function AffiliateWidget() {
  const [config, setConfig] = useState<AffiliateConfig>(DEFAULT_AFFILIATE_CONFIG);

  useEffect(() => {
    let isActive = true;

    const syncConfig = () => {
      void getAffiliateConfig()
        .then((nextConfig) => {
          if (isActive) setConfig(nextConfig);
        })
        .catch((error) => {
          if (!isActive) return;
          console.error("Lỗi đồng bộ Firebase:", error);
        });
    };

    syncConfig();
    const syncInterval = window.setInterval(syncConfig, 60000);
    window.addEventListener("focus", syncConfig);

    return () => {
      isActive = false;
      window.clearInterval(syncInterval);
      window.removeEventListener("focus", syncConfig);
    };
  }, []);

  const [editPerson, setEditPerson] = useState<PersonKey | null>(null);
  const [tempUrl, setTempUrl] = useState("");

  const handleEdit = (person: PersonKey) => {
    setEditPerson(person);
    setTempUrl(config[person].url);
  };

  const handleSave = async (person: PersonKey) => {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(tempUrl);
      if (!/^https?:$/.test(parsedUrl.protocol)) {
        throw new Error("Unsupported protocol");
      }
    } catch {
      toast.error("Link chưa hợp lệ. Vui lòng dùng địa chỉ bắt đầu bằng http:// hoặc https://.");
      return;
    }

    const newConfig = {
      ...config,
      [person]: { ...config[person], url: parsedUrl.toString() },
    } satisfies AffiliateConfig;
    const previousConfig = config;

    // Cập nhật giao diện ngay lập tức (Optimistic Update)
    setConfig(newConfig);
    setEditPerson(null);

    // Lưu vào Firebase
    try {
      await saveAffiliateConfig(newConfig);
      toast.success("Đã đồng bộ link lên Firebase!");
    } catch (error) {
      setConfig(previousConfig);
      console.error(error);
      toast.error("Chưa thể đồng bộ lên máy chủ, vui lòng kiểm tra quyền Firebase.");
    }
  };

  return (
    <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 rounded-2xl p-4 md:p-6 mb-8 border border-orange-200/50 dark:border-orange-900/50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex-1 text-center md:text-left space-y-1">
        <h2 className="font-bold text-lg md:text-xl flex items-center justify-center md:justify-start gap-2 text-primary">
          <Store className="w-6 h-6" aria-hidden="true" />
          Ủng hộ Admin & Cộng đồng
        </h2>
        <p className="text-sm text-muted-foreground">
          Bấm vào link bên dưới để mua hàng giúp duy trì dự án nhé!
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full md:w-[520px]">
        <AffiliatePersonBox
          personKey="person1"
          config={config}
          editPerson={editPerson}
          tempUrl={tempUrl}
          onTempUrlChange={setTempUrl}
          onEdit={handleEdit}
          onCancel={() => setEditPerson(null)}
          onSave={(person) => void handleSave(person)}
        />
        <AffiliatePersonBox
          personKey="person2"
          config={config}
          editPerson={editPerson}
          tempUrl={tempUrl}
          onTempUrlChange={setTempUrl}
          onEdit={handleEdit}
          onCancel={() => setEditPerson(null)}
          onSave={(person) => void handleSave(person)}
        />
      </div>
    </div>
  );
}
