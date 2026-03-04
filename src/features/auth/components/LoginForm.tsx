import { login } from "../actions";

type Props = {
  error?: string;
};

export function LoginForm({ error }: Props) {
  return (
    <form action={login} className="flex flex-col gap-4 w-full max-w-sm">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="border rounded px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="border rounded px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        className="bg-brand-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-brand-700"
      >
        Log in
      </button>

      <p className="text-sm text-center text-gray-500">
        No account?{" "}
        <a href="/signup" className="text-brand-600 hover:underline">
          Sign up
        </a>
      </p>
    </form>
  );
}
