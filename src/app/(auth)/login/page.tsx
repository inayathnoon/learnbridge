import { LoginForm } from "@/features/auth/components/LoginForm";

type Props = {
  searchParams: { error?: string; message?: string };
};

export default function LoginPage({ searchParams }: Props) {
  return (
    <>
      <h1 className="text-xl font-semibold mb-6 text-center">Log in</h1>
      {searchParams.message && (
        <p className="text-sm text-green-700 bg-green-50 p-3 rounded mb-4">
          {searchParams.message}
        </p>
      )}
      <LoginForm error={searchParams.error} />
    </>
  );
}
