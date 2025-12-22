"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Eye, Loader2, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { submissionApi, assignmentApi } from "@/lib/api";

interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string;
  submittedAt: string;
  status: string;
  score?: number;
  student?: {
    name: string;
    email: string;
  };
  assignment?: {
    title: string;
    dueDate: string;
  };
}

export function SubmissionsList() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await submissionApi.getAll();
        const submissionsData = response.submissions || [];
        
        const enrichedSubmissions = await Promise.all(
          submissionsData.map(async (submission: any) => {
            try {
              const assignmentResponse = await assignmentApi.getById(submission.assignmentId);
              return {
                ...submission,
                assignment: {
                  title: assignmentResponse.assignment.title,
                  dueDate: assignmentResponse.assignment.dueDate,
                },
              };
            } catch (err) {
              return submission;
            }
          })
        );

        setSubmissions(enrichedSubmissions);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load submissions");
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const getStatusIcon = (status: string, score?: number) => {
    if (score !== undefined) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (status === "SUBMITTED") {
      return <Clock className="h-4 w-4 text-blue-600" />;
    }
    return <AlertCircle className="h-4 w-4 text-orange-600" />;
  };

  const getStatusText = (status: string, score?: number) => {
    if (score !== undefined) {
      return `Graded: ${score}%`;
    }
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading submissions...</span>
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
          <h2 className="text-2xl font-bold">All Submissions</h2>
          <p className="text-muted-foreground">
            Review and evaluate student submissions across all assignments
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {submissions.length} submission{submissions.length !== 1 ? 's' : ''} total
        </div>
      </div>

      <div className="grid gap-4">
        {submissions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No submissions found.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Submissions will appear here once students start submitting their assignments.
            </p>
          </div>
        ) : (
          submissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {submission.assignment?.title || `Assignment ${submission.assignmentId}`}
                    </CardTitle>
                    <CardDescription>
                      Submitted by: {submission.student?.name || submission.studentId}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={submission.score !== undefined ? "default" : "secondary"}>
                      {getStatusIcon(submission.status, submission.score)}
                      <span className="ml-1">{getStatusText(submission.status, submission.score)}</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>
                      Submitted: {new Date(submission.submittedAt).toLocaleDateString()} at {new Date(submission.submittedAt).toLocaleTimeString()}
                    </span>
                    {submission.assignment?.dueDate && (
                      <span>
                        Due: {new Date(submission.assignment.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <Button asChild>
                    <Link href={`/teacher/submissions/${submission.assignmentId}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Evaluate
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
