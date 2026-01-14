import * as React from "react";
import type { UpdateAssignmentFormData } from "@/schemas/assignmentSchema";
import { CreateQuizForm } from "./CreateQuizForm";
import { UpdateQuizForm } from "./UpdateQuizForm";

interface CreateQuizWithModesFormProps {
  mode: "create" | "edit";
  classId: number;
  initialData?: UpdateAssignmentFormData;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateQuizWithModesForm({
  mode,
  classId,
  initialData,
  onSuccess,
  onCancel,
}: CreateQuizWithModesFormProps) {
  if (mode === "edit" && initialData) {
    return (
      <UpdateQuizForm
        classId={classId}
        initialData={initialData}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    );
  }

  return (
    <CreateQuizForm
      classId={classId}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
}

// Re-export the individual forms
export { CreateQuizForm } from "./CreateQuizForm";
export { UpdateQuizForm } from "./UpdateQuizForm";
