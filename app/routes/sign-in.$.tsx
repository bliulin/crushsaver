import { SignIn } from "@clerk/react-router";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <SignIn routing="path" path="/sign-in" />
    </div>
  );
}
