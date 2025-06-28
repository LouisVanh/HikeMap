'use client';
import { useAuth } from '../context/auth_context';

export const AuthButton = () => {
  const { user, signInWithGoogle, signOut } = useAuth();

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <>
          <span className="text-white">Hi, {user.email}</span>
          <button
            className="bg-red-500 text-white px-3 py-1 rounded"
            onClick={signOut}
          >
            Sign Out
          </button>
        </>
      ) : (
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded"
          onClick={signInWithGoogle}
        >
          Sign In with Google
        </button>
      )}
    </div>
  );
};
