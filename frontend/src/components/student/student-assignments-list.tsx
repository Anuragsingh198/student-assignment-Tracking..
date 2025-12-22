"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { assignmentApi, submissionApi } from "@/lib/api";

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  allowedSubmissionType: 'TEXT' | 'FILE';
}

interface AssignmentWithSubmission extends Assignment {
  submission?: {
    id: string;
    status: string;
    grade?: number;
  };
}

export function StudentAssignmentsList() {
  const [assignments, setAssignments] = useState<AssignmentWithSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAssignmentsAndSubmissions = async () => {
    try {
      const [assignmentsResponse, submissionsResponse] = await Promise.all([
        assignmentApi.getAll(),
        submissionApi.getMySubmissions(),
      ]);

      const assignmentsWithSubmissions = (assignmentsResponse.assignments || []).map((assignment: Assignment) => {
        const submission = (submissionsResponse.submissions || []).find(
          (sub: any) => {
            const subAssignmentId = typeof sub.assignmentId === 'object' 
              ? sub.assignmentId?._id || sub.assignmentId?.id 
              : sub.assignmentId;
            return subAssignmentId === assignment.id || subAssignmentId === assignment._id;
          }
        );

        return {
          ...assignment,
          submission,
        };
      });

      setAssignments(assignmentsWithSubmissions);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load assignments");
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignmentsAndSubmissions();
    
    const handleFocus = () => {
      fetchAssignmentsAndSubmissions();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
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
      <div>
        <h2 className="text-2xl font-bold">My Assignments</h2>
        <p className="text-muted-foreground">
          View and submit your assignments
        </p>
      </div>

      <div className="grid gap-4">
        {assignments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No assignments available.</p>
          </div>
        ) : (
          assignments.map((assignment) => {
            const isSubmitted = !!assignment.submission;
            const isGraded = assignment.submission?.grade !== undefined;
            const dueDate = new Date(assignment.dueDate);
            const isOverdue = dueDate < new Date() && !isSubmitted;

            return (
              <Card key={assignment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <CardDescription>{assignment.description}</CardDescription>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline">
                          {assignment?.allowedSubmissionType === 'TEXT' ? '📝 Text Submission' : '📎 File Submission'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isGraded && (
                        <Badge variant="secondary">
                          Grade: {assignment.submission?.grade}%
                        </Badge>
                      )}
                      {isOverdue && (
                        <Badge variant="destructive">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Due: {dueDate.toLocaleDateString()}</span>
                      {!isSubmitted && (
                        <span className="flex items-center text-orange-600">
                          <Clock className="mr-1 h-4 w-4" />
                          Pending submission
                        </span>
                      )}
                      {isSubmitted && !isGraded && (
                        <span className="flex items-center text-blue-600">
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Submitted
                        </span>
                      )}
                      {isGraded && (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Graded
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {!isSubmitted ? (
                        <Button asChild>
                          <Link href={`/student/submit/${assignment.id}`}>
                            Submit Assignment
                          </Link>
                        </Button>
                      ) : (
                        <Button variant="outline" disabled>
                          {isGraded ? "Graded" : "Submitted"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
