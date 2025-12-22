"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Edit } from "lucide-react";
import { assignmentApi } from "@/lib/api";
import { ReactNode } from "react";

const editAssignmentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  dueDate: z.date({
    required_error: "Due date is required",
  }).refine((date) => date > new Date(), "Due date must be in the future"),
  allowedSubmissionType: z.enum(["TEXT", "FILE"], {
    required_error: "Submission type is required",
  }),
  maxScore: z.number().min(0, "Score must be positive").max(1000, "Score cannot exceed 1000"),
});

type EditAssignmentFormData = z.infer<typeof editAssignmentSchema>;

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface EditAssignmentFormProps {
  assignment: Assignment;
  children: ReactNode;
  onSuccess?: () => void;
}

export function EditAssignmentForm({ assignment, children, onSuccess }: EditAssignmentFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditAssignmentFormData>({
    resolver: zodResolver(editAssignmentSchema),
    defaultValues: {
      title: assignment.title,
      description: assignment.description,
      dueDate: new Date(assignment.dueDate),
      allowedSubmissionType: assignment.allowedSubmissionType || "TEXT",
      maxScore: assignment.maxScore || 100,
    },
  });

  const onSubmit = async (data: EditAssignmentFormData) => {
    setIsLoading(true);
    setError("");

    try {
      await assignmentApi.update(assignment.id, {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate.toISOString(),
        allowedSubmissionType: data.allowedSubmissionType,
        maxScore: data.maxScore,
      });

      setShowForm(false);
      reset();
      onSuccess?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update assignment");
    } finally {
      setIsLoading(false);
    }
  };

  if (!showForm) {
    return (
      <div onClick={() => setShowForm(true)}>
        {children}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Edit Assignment</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowForm(false)}
            disabled={isLoading}
          >
            ✕
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Update the assignment details below.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              placeholder="Enter assignment title"
              {...register("title")}
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              placeholder="Enter assignment description"
              {...register("description")}
              disabled={isLoading}
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-dueDate">Due Date</Label>
            <Input
              id="edit-dueDate"
              type="datetime-local"
              {...register("dueDate", {
                valueAsDate: true,
              })}
              disabled={isLoading}
              min={new Date().toISOString().slice(0, 16)}
            />
            {errors.dueDate && (
              <p className="text-sm text-red-600">{errors.dueDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-allowedSubmissionType">Submission Type</Label>
            <select
              id="edit-allowedSubmissionType"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("allowedSubmissionType")}
              disabled={isLoading}
            >
              <option value="TEXT">Text Only</option>
              <option value="FILE">File Upload</option>
            </select>
            {errors.allowedSubmissionType && (
              <p className="text-sm text-red-600">{errors.allowedSubmissionType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-maxScore">Maximum Score</Label>
            <Input
              id="edit-maxScore"
              type="number"
              placeholder="Enter maximum score (e.g., 100)"
              {...register("maxScore", {
                valueAsNumber: true,
              })}
              disabled={isLoading}
              min="0"
              max="1000"
            />
            {errors.maxScore && (
              <p className="text-sm text-red-600">{errors.maxScore.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForm(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Assignment"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
