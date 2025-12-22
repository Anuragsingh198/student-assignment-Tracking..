import { AssignmentSubmission } from "@/components/student/assignment-submission";

interface PageProps {
  params: Promise<{ assignmentId: string }>;
}

export default async function StudentSubmitPage({ params }: PageProps) {
  const { assignmentId } = await params;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Submit Assignment</h1>
      <AssignmentSubmission assignmentId={assignmentId} />
    </div>
  );
}
