import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { formatAuthError } from '../api/auth';
import { AuthFormLayout } from '../components/AuthFormLayout';
import { ErrorState } from '../components/ErrorState';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  usePageTitle('Connexion');

  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (caughtError) {
      setError(formatAuthError(caughtError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthFormLayout
      title="Connexion"
      subtitle="Accédez à vos commandes et à votre espace client."
      footer={
        <>
          Pas encore de compte ?{' '}
          <Link to="/register" className="font-semibold text-accent transition hover:opacity-90">
            Créer un compte
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
          <span>Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 rounded-[8px] border border-[#E0DBD5] bg-white px-3 text-sm outline-none transition focus:border-accent"
            placeholder="email@exemple.com"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
          <span>Mot de passe</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 rounded-[8px] border border-[#E0DBD5] bg-white px-3 text-sm outline-none transition focus:border-accent"
            placeholder="Votre mot de passe"
          />
        </label>

        {error ? <ErrorState title="Connexion impossible" description={error} /> : null}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </AuthFormLayout>
  );
}
