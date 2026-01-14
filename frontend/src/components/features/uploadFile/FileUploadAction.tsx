"use client";

import { useMemo, useState } from "react";
import { Upload } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosProgressEvent } from "axios";
import httpClient from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { UploadProgress } from "./UploadProgress";
import type { UploadedFileItem } from "./FileUpload";

type HttpMethod = "post" | "put" | "patch";

interface FileUploadActionProps {
  file: File | null;
  files?: File[]; // For multiple upload
  action: string;
  method?: HttpMethod;
  buttonLabel?: string;
  buildFormData?: (file: File) => FormData;
  onUploadSuccess: (uploadedFile: UploadedFileItem) => void;
  onUploadError?: (error: unknown) => void;
  onReset: () => void;
  onUploadingChange?: (isUploading: boolean) => void;
  onUploadResponse?: (response: unknown) => void;
  disabled?: boolean;
  multiple?: boolean;
}

export function FileUploadAction({
  file,
  files,
  action,
  method = "post",
  buttonLabel,
  buildFormData,
  onUploadSuccess,
  onUploadError,
  onReset,
  onUploadingChange,
  onUploadResponse,
  disabled = false,
  multiple = false,
}: FileUploadActionProps) {
  const t = useTranslations();
  const [uploadProgress, setUploadProgress] = useState(0);

  const formDataBuilder = useMemo(() => {
    if (buildFormData) return buildFormData;
    return (selectedFile: File) => {
      const formData = new FormData();
      formData.append("file", selectedFile);
      return formData;
    };
  }, [buildFormData]);

  const mutation = useMutation({
    mutationFn: async (selectedFile: File) => {
      onUploadingChange?.(true);
      const formData = formDataBuilder(selectedFile);

      const response = await httpClient.request({
        url: action,
        method,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (evt: AxiosProgressEvent) => {
          if (!evt.total) return;
          setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      });

      return response;
    },
    onSuccess: (response, selectedFile) => {
      const raw = (response as { data?: unknown })?.data ?? response;
      const data =
        raw && typeof raw === "object"
          ? (raw as Record<string, unknown>)
          : undefined;

      onUploadResponse?.(raw);

      const possibleUrls = [
        data?.publicUrl,
        data?.avatarUrl,
        data?.iconUrl,
        data?.url,
      ];

      const publicUrlCandidate = possibleUrls.find(
        (value) => typeof value === "string" && value.trim().length > 0
      ) as string | undefined;

      if (!publicUrlCandidate) {
        toast.error(t("file_upload_failed"));
        return;
      }

      const documentId = typeof data?.id === "number" ? data.id : undefined;

      const uploadedFile: UploadedFileItem = {
        id: Date.now().toString() + Math.random().toString(36),
        file: selectedFile,
        publicUrl: publicUrlCandidate,
        documentId,
      };

      onUploadSuccess(uploadedFile);
      toast.success(t("file_upload_success"));
      onReset();
    },
    onError: (error) => {
      toast.error(t("file_upload_failed"));
      onUploadError?.(error);
      setUploadProgress(0);
      onUploadingChange?.(false);
    },
    onSettled: () => {
      setUploadProgress(0);
      onUploadingChange?.(false);
    },
  });

  const handleUpload = async () => {
    if (mutation.isPending) return;

    if (multiple && files && files.length > 0) {
      // Upload all files sequentially
      for (const fileToUpload of files) {
        await mutation.mutateAsync(fileToUpload);
      }
    } else if (file) {
      // Single file upload
      mutation.mutate(file);
    }
  };

  const isUploading = mutation.isPending;
  const hasFilesToUpload = multiple ? files && files.length > 0 : !!file;

  return (
    <>
      {isUploading && <UploadProgress progress={uploadProgress} />}

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleUpload}
          disabled={!hasFilesToUpload || isUploading || disabled}
          size="default"
          className="w-36"
        >
          <Upload className="mr-2 h-4 w-4" />
          {multiple && files && files.length > 1
            ? `${t("upload_file")} (${files.length})`
            : buttonLabel || t("upload_file")}
        </Button>
      </div>
    </>
  );
}
