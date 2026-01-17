import React, { useState } from "react";
import type { FormResponse, FormValues } from "../../types/form.types";
import { FormFieldType } from "../../types/form.types";
import { FileUpload } from "./FileUpload";

interface DynamicFormProps {
  formData: FormResponse;
  onSubmit: (values: FormValues) => void;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  formData,
  onSubmit,
}) => {
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [expirationDays, setExpirationDays] = useState<number>(7);

  const handleFieldChange = (questionId: string, value: any) => {
    setValues((prev) => ({
      ...prev,
      [questionId]: value,
    }));

    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    formData.questions.forEach((question) => {
      if (question.compulsory && !values[question.id]) {
        newErrors[question.id] = `${question.question} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onSubmit({ ...values, expiration_days: expirationDays });
    }
  };

  const renderField = (question: (typeof formData.questions)[0]) => {
    switch (question.type) {
      case FormFieldType.FILE_UPLOAD:
        return (
          <FileUpload
            key={question.id}
            question={question}
            value={values[question.id] || null}
            onChange={(file) => handleFieldChange(question.id, file)}
            error={errors[question.id]}
          />
        );

      default:
        return (
          <div key={question.id} className="field-not-implemented">
            Field type "{question.type}" not implemented yet
          </div>
        );
    }
  };

  const sortedQuestions = [...formData.questions].sort(
    (a, b) => a.sequence - b.sequence
  );

  // Group questions by type for layout purposes
  const groupedQuestions: Array<{
    type: "single" | "file-upload-group";
    questions: typeof sortedQuestions;
  }> = [];

  let currentFileUploadGroup: typeof sortedQuestions = [];

  sortedQuestions.forEach((question) => {
    if (question.type === FormFieldType.FILE_UPLOAD) {
      currentFileUploadGroup.push(question);
    } else {
      if (currentFileUploadGroup.length > 0) {
        groupedQuestions.push({
          type: "file-upload-group",
          questions: currentFileUploadGroup,
        });
        currentFileUploadGroup = [];
      }

      groupedQuestions.push({
        type: "single",
        questions: [question],
      });
    }
  });

  if (currentFileUploadGroup.length > 0) {
    groupedQuestions.push({
      type: "file-upload-group",
      questions: currentFileUploadGroup,
    });
  }

  return (
    <div className="dynamic-form-container">
      <form onSubmit={handleSubmit} className="dynamic-form">
        {groupedQuestions.map((group, idx) => {
          if (group.type === "file-upload-group") {
            return (
              <div key={`file-group-${idx}`} className="file-upload-section">
                {group.questions.map((question) => (
                  <div key={question.id} className="form-field">
                    {renderField(question)}
                  </div>
                ))}
              </div>
            );
          } else {
            return group.questions.map((question) => (
              <div key={question.id} className="form-field">
                {renderField(question)}
              </div>
            ));
          }
        })}

        <div className="expiration-period-section">
          <h3 className="expiration-heading">
            Select Report Expiration Period
          </h3>
          <p className="expiration-description">
            Pick an expiration period based on how long you want the report to
            remain accessible.
          </p>
          <div className="expiration-options">
            <label
              className={`expiration-option ${expirationDays === 3 ? "selected" : ""}`}
            >
              <input
                type="radio"
                name="expiration"
                value="3"
                checked={expirationDays === 3}
                onChange={() => setExpirationDays(3)}
              />
              <span className="option-label">3 Days</span>
            </label>
            <label
              className={`expiration-option ${expirationDays === 7 ? "selected" : ""}`}
            >
              <input
                type="radio"
                name="expiration"
                value="7"
                checked={expirationDays === 7}
                onChange={() => setExpirationDays(7)}
              />
              <span className="option-label">7 Days</span>
            </label>
            <label
              className={`expiration-option ${expirationDays === 30 ? "selected" : ""}`}
            >
              <input
                type="radio"
                name="expiration"
                value="30"
                checked={expirationDays === 30}
                onChange={() => setExpirationDays(30)}
              />
              <span className="option-label">30 Days</span>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};
