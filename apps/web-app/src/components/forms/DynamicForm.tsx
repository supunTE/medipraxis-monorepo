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
          <div
            key={question.id}
            className="p-4 bg-mp-cream border border-mp-warning rounded-md text-mp-dark-green text-sm font-dm-sans"
          >
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
    <div className="w-full max-w-[800px] md:max-w-[1800px] mx-auto px-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {groupedQuestions.map((group, idx) => {
          if (group.type === "file-upload-group") {
            return (
              <div key={`file-group-${idx}`} className="flex flex-col gap-6">
                {group.questions.map((question) => (
                  <div key={question.id} className="w-full">
                    {renderField(question)}
                  </div>
                ))}
              </div>
            );
          } else {
            return group.questions.map((question) => (
              <div key={question.id} className="w-full">
                {renderField(question)}
              </div>
            ));
          }
        })}

        <div className="pt-8 mt-8 border-t border-mp-light-grey">
          <h3 className="text-lg font-semibold text-mp-dark-green mb-2 font-lato">
            Select Report Expiration Period
          </h3>
          <p className="text-sm text-mp-grey mb-6 font-dm-sans">
            Pick an expiration period based on how long you want the report to
            remain accessible.
          </p>
          <div className="flex gap-4 flex-wrap md:flex-row flex-col">
            <label
              className={`flex items-center gap-2 px-6 py-3 border-2 rounded-lg cursor-pointer transition-all ${
                expirationDays === 3
                  ? "border-mp-green bg-[#f0f7ed]"
                  : "border-mp-light-grey bg-mp-white hover:border-mp-green hover:bg-[#f9fdf7]"
              }`}
            >
              <input
                type="radio"
                name="expiration"
                value="3"
                checked={expirationDays === 3}
                onChange={() => setExpirationDays(3)}
                className="appearance-none w-5 h-5 border-2 border-mp-light-grey rounded-full cursor-pointer relative transition-all bg-mp-white hover:border-mp-green checked:border-mp-green checked:bg-mp-green after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-2 after:h-2 after:rounded-full after:bg-mp-white after:opacity-0 checked:after:opacity-100"
              />
              <span className="text-base font-medium text-mp-dark-green cursor-pointer font-lato">
                3 Days
              </span>
            </label>
            <label
              className={`flex items-center gap-2 px-6 py-3 border-2 rounded-lg cursor-pointer transition-all ${
                expirationDays === 7
                  ? "border-mp-green bg-[#f0f7ed]"
                  : "border-mp-light-grey bg-mp-white hover:border-mp-green hover:bg-[#f9fdf7]"
              }`}
            >
              <input
                type="radio"
                name="expiration"
                value="7"
                checked={expirationDays === 7}
                onChange={() => setExpirationDays(7)}
                className="appearance-none w-5 h-5 border-2 border-mp-light-grey rounded-full cursor-pointer relative transition-all bg-mp-white hover:border-mp-green checked:border-mp-green checked:bg-mp-green after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-2 after:h-2 after:rounded-full after:bg-mp-white after:opacity-0 checked:after:opacity-100"
              />
              <span className="text-base font-medium text-mp-dark-green cursor-pointer font-lato">
                7 Days
              </span>
            </label>
            <label
              className={`flex items-center gap-2 px-6 py-3 border-2 rounded-lg cursor-pointer transition-all ${
                expirationDays === 30
                  ? "border-mp-green bg-[#f0f7ed]"
                  : "border-mp-light-grey bg-mp-white hover:border-mp-green hover:bg-[#f9fdf7]"
              }`}
            >
              <input
                type="radio"
                name="expiration"
                value="30"
                checked={expirationDays === 30}
                onChange={() => setExpirationDays(30)}
                className="appearance-none w-5 h-5 border-2 border-mp-light-grey rounded-full cursor-pointer relative transition-all bg-mp-white hover:border-mp-green checked:border-mp-green checked:bg-mp-green after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-2 after:h-2 after:rounded-full after:bg-mp-white after:opacity-0 checked:after:opacity-100"
              />
              <span className="text-base font-medium text-mp-dark-green cursor-pointer font-lato">
                30 Days
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-mp-light-grey">
          <button
            type="submit"
            className="bg-mp-green text-mp-white px-8 py-3 rounded-md text-base font-medium cursor-pointer transition-colors outline-none hover:bg-[#7ab568] focus:outline-none font-lato"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};
