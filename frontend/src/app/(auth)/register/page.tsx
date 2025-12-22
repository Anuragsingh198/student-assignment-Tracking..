import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Create Account</h1>
        <p className="text-muted-foreground">Join our learning platform</p>
      </div>
      <RegisterForm />
    </div>
  );
}
