import { signup } from "./actions";

export default function SignupPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Join LearnBridge</h1>
          <p className="mt-2 text-gray-600">
            Sign up to help your child learn algebra
          </p>
        </div>

        {searchParams.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {searchParams.error}
          </div>
        )}

        <form action={signup} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="whatsapp_number"
              className="block text-sm font-medium"
            >
              WhatsApp Number
            </label>
            <input
              id="whatsapp_number"
              name="whatsapp_number"
              type="tel"
              required
              placeholder="+91 98765 43210"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="child_name" className="block text-sm font-medium">
              Child&apos;s Name
            </label>
            <input
              id="child_name"
              name="child_name"
              type="text"
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 py-2 text-white font-medium hover:bg-blue-700"
          >
            Sign Up
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Log in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
