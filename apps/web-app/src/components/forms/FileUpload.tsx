import { TrashIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import React, { useRef, useState } from "react";
import type { FormQuestion } from "../../types/form.types";

interface FileUploadProps {
  question: FormQuestion;
  value?: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  question,
  value,
  onChange,
  error,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    if (file) {
      // Validate file type
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (
        question.fileConfig?.allowedTypes &&
        !question.fileConfig.allowedTypes.includes(fileExtension || "")
      ) {
        alert(
          `Please upload a file with one of these types: ${question.fileConfig.allowedTypes.join(", ")}`
        );
        return;
      }

      // Validate file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (
        question.fileConfig?.maxSizeMB &&
        fileSizeMB > question.fileConfig.maxSizeMB
      ) {
        alert(`File size must be less than ${question.fileConfig.maxSizeMB}MB`);
        return;
      }

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }

      onChange(file);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-base font-medium text-mp-dark-green font-lato">
        {question.question}
        {question.compulsory && <span className="text-mp-danger ml-1">*</span>}
      </label>

      {question.notes && (
        <p className="text-sm text-mp-grey italic font-dm-sans">
          {question.notes}
        </p>
      )}

      <div className="border-2 border-dashed border-mp-light-grey rounded-lg p-6 bg-mp-cream transition-colors hover:border-mp-green flex justify-center items-center">
        <input
          ref={fileInputRef}
          type="file"
          accept={question.fileConfig?.allowedTypes
            .map((type) => `.${type}`)
            .join(",")}
          onChange={handleFileChange}
          className="hidden"
        />

        {!value ? (
          <div className="flex flex-col items-center gap-2 w-full">
            <button
              type="button"
              onClick={handleClick}
              className="bg-mp-green text-mp-dark-green px-6 py-3 rounded-md text-base font-medium hover:bg-mp-light-green transition-colors outline-none flex items-center justify-center font-lato"
            >
              <UploadSimpleIcon size={20} weight="bold" className="mr-2" />
              Choose File
            </button>
            {question.helpText && (
              <p className="text-xs text-mp-grey text-center font-dm-sans">
                {question.helpText}
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-row gap-4 items-center w-full justify-start">
            <div className="w-[100px] h-[100px] flex-shrink-0 rounded-lg overflow-hidden border border-mp-light-grey bg-mp-white flex items-center justify-center">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-sm font-semibold text-mp-grey font-dm-sans">
                    {value.name.split(".").pop()?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1 flex-grow">
              <span className="font-medium text-mp-dark-green break-words font-lato">
                {value.name}
              </span>
              <span className="text-sm text-mp-grey font-dm-sans">
                {(value.size / 1024).toFixed(2)} KB
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="bg-mp-danger text-mp-white px-4 py-2 rounded-md text-sm font-medium hover:bg-mp-danger/90 transition-colors outline-none flex items-center gap-2 whitespace-nowrap flex-shrink-0 font-lato"
            >
              <TrashIcon size={18} weight="bold" />
              <span>Remove</span>
            </button>
          </div>
        )}
      </div>

      {error && <p className="text-mp-danger text-sm font-dm-sans">{error}</p>}
    </div>
  );
};
