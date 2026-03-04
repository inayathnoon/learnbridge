import { logout } from "../actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="text-sm text-gray-500 hover:text-gray-800"
      >
        Log out
      </button>
    </form>
  );
}
