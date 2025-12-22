import { SubmissionEvaluation } from "@/components/teacher/submission-evaluation";

interface PageProps {
  params: Promise<{ assignmentId: string }>;
}

export default async function TeacherSubmissionPage({ params }: PageProps) {
  const { assignmentId } = await params;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Evaluate Submissions</h1>
      <SubmissionEvaluation assignmentId={assignmentId} />
    </div>
  );
}
