import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <SignUp appearance={{ elements: { rootBox: "mx-auto" } }} />
    </main>
  );
}
