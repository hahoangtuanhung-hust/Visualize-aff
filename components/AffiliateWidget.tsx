"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Edit2, Check, X, Store } from "lucide-react";
import { useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { toast } from "sonner";

interface AffiliateConfig {
  person1: { name: string; url: string };
  person2: { name: string; url: string };
}

export function AffiliateWidget() {
  const [config, setConfig] = useState<AffiliateConfig>({
    person1: { name: "Admin", url: "https://shopee.vn" },
    person2: { name: "Cộng đồng", url: "https://shopee.vn" },
  });

  useEffect(() => {
    if (!db) return;
    const docRef = doc(db, "config", "affiliate");
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setConfig(docSnap.data() as AffiliateConfig);
        } else {
          // Initialize if empty
          setDoc(docRef, {
            person1: { name: "Admin", url: "https://shopee.vn" },
            person2: { name: "Cộng đồng", url: "https://shopee.vn" },
          }).catch(console.error);
        }
      },
      (error) => {
        console.error("Lỗi đồng bộ Firebase:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  const [editPerson, setEditPerson] = useState<"person1" | "person2" | null>(null);
  const [tempUrl, setTempUrl] = useState("");

  const handleEdit = (person: "person1" | "person2", e: React.MouseEvent) => {
    e.stopPropagation();
    setEditPerson(person);
    setTempUrl(config[person].url);
  };

  const handleSave = async (person: "person1" | "person2") => {
    const newConfig = {
      ...config,
      [person]: { ...config[person], url: tempUrl },
    };
    
    // Cập nhật giao diện ngay lập tức (Optimistic Update)
    setConfig(newConfig);
    setEditPerson(null);
    
    // Lưu vào Firebase
    try {
      await setDoc(doc(db, "config", "affiliate"), newConfig, { merge: true });
      toast.success("Đã đồng bộ link lên Firebase!");
    } catch (error) {
      console.error(error);
      toast.error("Chưa thể đồng bộ lên máy chủ, vui lòng kiểm tra quyền Firebase.");
    }
  };

  const PersonBox = ({ personKey }: { personKey: "person1" | "person2" }) => {
    const isEditing = editPerson === personKey;
    const data = config[personKey];

    if (isEditing) {
      return (
        <div className="flex flex-col gap-2 w-full flex-1">
          <Input 
            value={tempUrl} 
            onChange={(e) => setTempUrl(e.target.value)} 
            placeholder="Nhập link Shopee affiliate..."
            className="h-9 text-sm"
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleSave(personKey)} className="flex-1 h-8">
              <Check className="w-4 h-4 mr-1" /> Lưu
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditPerson(null)} className="flex-1 h-8">
              <X className="w-4 h-4 mr-1" /> Hủy
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 flex-1 w-full relative group">
        <Button 
          variant={personKey === "person1" ? "default" : "outline"} 
          className="flex-1 justify-between shadow-sm h-10 w-full"
          onClick={() => window.open(data.url, "_blank")}
        >
          Ủng hộ {data.name}
          <ExternalLink className="ml-2 w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="md:opacity-0 opacity-100 group-hover:opacity-100 absolute -right-2 -top-2 w-7 h-7 bg-white dark:bg-gray-800 shadow-sm border rounded-full text-muted-foreground transition-opacity"
          onClick={(e) => handleEdit(personKey, e)}
          title="Sửa link"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 rounded-2xl p-4 md:p-6 mb-8 border border-orange-200/50 dark:border-orange-900/50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex-1 text-center md:text-left space-y-1">
        <h2 className="font-bold text-lg md:text-xl flex items-center justify-center md:justify-start gap-2 text-primary">
          <Store className="w-6 h-6" />
          Ủng hộ Admin & Cộng đồng
        </h2>
        <p className="text-sm text-muted-foreground">
          Bấm vào link bên dưới để mua hàng giúp duy trì dự án nhé!
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full md:w-[450px]">
        <PersonBox personKey="person1" />
        <PersonBox personKey="person2" />
      </div>
    </div>
  );
}
