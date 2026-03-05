import { signup } from "../actions";

type Props = {
  error?: string;
};

export function SignupForm({ error }: Props) {
  return (
    <form action={signup} className="flex flex-col gap-4 w-full max-w-sm">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="childName" className="text-sm font-medium">
          Child's name
        </label>
        <input
          id="childName"
          name="childName"
          type="text"
          required
          className="border rounded px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="whatsappNumber" className="text-sm font-medium">
          Your WhatsApp number
        </label>
        <input
          id="whatsappNumber"
          name="whatsappNumber"
          type="tel"
          required
          placeholder="+919876543210"
          className="border rounded px-3 py-2 text-sm"
        />
        <p className="text-xs text-gray-500">
          Include country code. You'll get a WhatsApp message to confirm.
        </p>
      </div>

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
          minLength={6}
          autoComplete="new-password"
          className="border rounded px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        className="bg-brand-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-brand-700"
      >
        Create account
      </button>

      <p className="text-sm text-center text-gray-500">
        Already have an account?{" "}
        <a href="/login" className="text-brand-600 hover:underline">
          Log in
        </a>
      </p>
    </form>
  );
}
