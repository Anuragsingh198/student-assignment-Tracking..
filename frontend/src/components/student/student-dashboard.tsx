"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { assignmentApi, submissionApi } from "@/lib/api";

interface Assignment {
  _id?: string;
  id?: string;
  title: string;
  dueDate: string;
  allowedSubmissionType: 'TEXT' | 'FILE';
}

interface Submission {
  assignmentId: string | { _id: string };
  status: string;
  score?: number;
}

export function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    completedAssignments: 0,
    pendingAssignments: 0,
    averageGrade: 0,
  });
  const [upcomingAssignments, setUpcomingAssignments] = useState<Array<{
    id: string;
    title: string;
    dueDate: string;
    status: string;
    grade?: number;
    priority: string;
  }>>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [assignmentsResponse, submissionsResponse] = await Promise.all([
          assignmentApi.getAll(),
          submissionApi.getMySubmissions(),
        ]);

        const assignments = assignmentsResponse?.assignments || [];
        const submissions = submissionsResponse?.submissions || [];

        const publishedAssignments = assignments.filter((assignment: any) => 
          assignment.isPublished !== false
        );

        const totalAssignments = publishedAssignments.length;
        
        const submittedAssignmentIds = new Set();
        submissions.forEach((sub: Submission) => {
          const assignmentId = typeof sub.assignmentId === 'object' 
            ? sub.assignmentId?._id || sub.assignmentId?.id 
            : sub.assignmentId;
          if (assignmentId) {
            submittedAssignmentIds.add(assignmentId.toString());
          }
        });
        
        const completedAssignments = submittedAssignmentIds.size;
        const pendingAssignments = Math.max(0, totalAssignments - completedAssignments);
        
        const gradedSubmissions = submissions.filter((sub: any) => 
          sub.score !== undefined && sub.score !== null
        );
        const averageGrade = gradedSubmissions.length > 0
          ? Math.round(gradedSubmissions.reduce((sum: number, sub: any) => sum + (sub.score || 0), 0) / gradedSubmissions.length)
          : 0;

        setStats({
          totalAssignments,
          completedAssignments,
          pendingAssignments,
          averageGrade,
        });

        const assignmentMap = new Map();
        submissions.forEach((sub: Submission) => {
          const assignmentId = typeof sub.assignmentId === 'object' 
            ? sub.assignmentId?._id || sub.assignmentId?.id 
            : sub.assignmentId;
          if (assignmentId) {
            assignmentMap.set(assignmentId.toString(), sub);
          }
        });

        const upcoming = publishedAssignments
          .filter((assignment: Assignment) => {
            const assignmentId = assignment._id || assignment.id;
            return assignmentId && !assignmentMap.has(assignmentId.toString());
          })
          .map((assignment: Assignment) => {
            const assignmentId = assignment._id || assignment.id || '';
            const dueDate = new Date(assignment.dueDate);
            const now = new Date();
            const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            let priority = "low";
            if (daysUntilDue <= 3 && daysUntilDue >= 0) priority = "high";
            else if (daysUntilDue <= 7 && daysUntilDue >= 0) priority = "medium";

            return {
              id: assignmentId.toString(),
              title: assignment.title,
              dueDate: assignment.dueDate,
              status: "pending",
              priority,
            };
          })
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
          .slice(0, 5);

        setUpcomingAssignments(upcoming);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setStats({
          totalAssignments: 0,
          completedAssignments: 0,
          pendingAssignments: 0,
          averageGrade: 0,
        });
        setUpcomingAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your assignments and progress.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedAssignments} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingAssignments}</div>
            <p className="text-xs text-muted-foreground">
              Need to submit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageGrade}%</div>
            <p className="text-xs text-muted-foreground">
              Across all assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalAssignments > 0 ? Math.round((stats.completedAssignments / stats.totalAssignments) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Assignments completed
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Upcoming Assignments</CardTitle>
              <CardDescription>
                Assignments that need your attention
              </CardDescription>
            </div>
            <Button asChild>
              <Link href="/student/assignments">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {upcomingAssignments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No upcoming assignments at this time.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Check back later or view all assignments to see what's available.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <h3 className="font-medium">{assignment.title}</h3>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                      {assignment.status === "completed" && assignment.grade && (
                        <Badge variant="secondary">
                          Grade: {assignment.grade}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {assignment.priority === "high" && (
                      <Badge variant="destructive">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        High Priority
                      </Badge>
                    )}
                    {assignment.status === "pending" ? (
                      <Button size="sm" asChild>
                        <Link href={`/student/submit/${assignment.id}`}>
                          Submit
                        </Link>
                      </Button>
                    ) : (
                      <Badge variant="secondary">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
