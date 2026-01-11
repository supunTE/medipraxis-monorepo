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
    <div className="file-upload-container">
      <label className="file-upload-label">
        {question.question}
        {question.compulsory && <span className="required">*</span>}
      </label>

      {question.helpText && <p className="help-text">{question.helpText}</p>}

      {question.notes && <p className="notes">{question.notes}</p>}

      <div className="file-upload-area">
        <input
          ref={fileInputRef}
          type="file"
          accept={question.fileConfig?.allowedTypes
            .map((type) => `.${type}`)
            .join(",")}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        {!value ? (
          <button type="button" onClick={handleClick} className="upload-button">
            Choose File
          </button>
        ) : (
          <div className="file-preview">
            {preview && (
              <img src={preview} alt="Preview" className="image-preview" />
            )}
            <div className="file-info">
              <span className="file-name">{value.name}</span>
              <span className="file-size">
                {(value.size / 1024).toFixed(2)} KB
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="remove-button"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {error && <p className="error-text">{error}</p>}

      {question.fileConfig && (
        <p className="file-requirements">
          Allowed: {question.fileConfig.allowedTypes.join(", ")} | Max size:{" "}
          {question.fileConfig.maxSizeMB}MB
        </p>
      )}
    </div>
  );
};
