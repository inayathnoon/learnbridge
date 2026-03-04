import { SignupForm } from "@/features/auth/components/SignupForm";

type Props = {
  searchParams: { error?: string };
};

export default function SignupPage({ searchParams }: Props) {
  return (
    <>
      <h1 className="text-xl font-semibold mb-6 text-center">Create account</h1>
      <SignupForm error={searchParams.error} />
    </>
  );
}
