"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Edit, Users, Loader2 } from "lucide-react";
import { assignmentApi } from "@/lib/api";
import { CreateAssignmentForm } from "./create-assignment-form";
import { EditAssignmentForm } from "./edit-assignment-form";

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  allowedSubmissionType?: string;
  maxScore?: number;
}

export function AssignmentsList() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAssignments = async () => {
    try {
      const response = await assignmentApi.getAll();
      setAssignments(response.assignments || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load assignments");
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Assignments</h2>
          <p className="text-muted-foreground">
            Manage your assignments and track student submissions
          </p>
        </div>
        <CreateAssignmentForm onSuccess={() => fetchAssignments()} />
      </div>

      <div className="grid gap-4">
        {assignments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No assignments created yet.</p>
            <CreateAssignmentForm onSuccess={() => fetchAssignments()}>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Assignment
              </Button>
            </CreateAssignmentForm>
          </div>
        ) : (
          assignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{assignment.title}</CardTitle>
                    <CardDescription>{assignment.description}</CardDescription>
                  </div>
                  <Badge variant="default">
                    {assignment.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    <span className="flex items-center">
                      <Users className="mr-1 h-4 w-4" />
                      View submissions
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <EditAssignmentForm assignment={assignment}>
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </EditAssignmentForm>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/teacher/submissions/${assignment.id}`}>
                        View Submissions
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
