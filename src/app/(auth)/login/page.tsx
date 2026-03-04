import { LoginForm } from "@/features/auth/components/LoginForm";

type Props = {
  searchParams: { error?: string };
};

export default function LoginPage({ searchParams }: Props) {
  return (
    <>
      <h1 className="text-xl font-semibold mb-6 text-center">Log in</h1>
      <LoginForm error={searchParams.error} />
    </>
  );
}
