"use client";

import React, { useState, useRef } from "react";
import { Card, Spinner } from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import toast from "react-hot-toast";
import { UploadIcon } from "lucide-react";
import { calculateFileSha256 } from "@/shared/utils/crypto";

interface UploadImageProps {
  onSave: (file: File, sha256?: string) => Promise<string>;
  imageUrl?: string;
  setImageUrl: (imageUrl: string) => void;
  className?: string;
  description?: string;
}

const UploadImage: React.FC<UploadImageProps> = ({
  onSave,
  imageUrl,
  setImageUrl,
  className = "h-32 w-32",
  description,
}) => {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error(t("Please select a valid image file"));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("Image size should be less than 5MB"));
      return;
    }

    setIsUploading(true);
    try {
      const sha256 = await calculateFileSha256(file);
      const imageUrl = await onSave(file, sha256);
      setImageUrl(imageUrl);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(t("Failed to upload image"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-2">
      <Card
        className={`relative group ${isUploading ? "cursor-not-allowed" : "cursor-pointer"} ${className} `}
        style={{
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        onPress={handleImageClick}
        isPressable={!isUploading}
        shadow="none"
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Uploaded"
            className="w-full h-full object-contain"
          />
        )}
        <div
          className={`absolute top-0 rounded-large right-0 bg-default-100 w-full h-full flex items-center justify-center transition-opacity duration-300 ${
            imageUrl && !isUploading ? "opacity-0" : "opacity-100"
          } group-hover:opacity-50 backdrop-blur-sm`}
        ></div>
        <div
          className={`absolute w-full h-full flex flex-col gap-2 items-center justify-center ${
            imageUrl && !isUploading ? "opacity-0" : "opacity-100"
          } group-hover:opacity-100`}
        >
          <span>
            {isUploading ? <Spinner size="lg" /> : <UploadIcon size={48} />}
          </span>
          <span className="text-sm text-default-500">{description}</span>
        </div>
      </Card>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
};

export default UploadImage;
