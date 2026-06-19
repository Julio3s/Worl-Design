import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { formatAuthError } from '../api/auth';
import { AuthFormLayout } from '../components/AuthFormLayout';
import { ErrorState } from '../components/ErrorState';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuthStore } from '../store/authStore';

export default function RegisterPage() {
  usePageTitle('Inscription');

  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const register = useAuthStore((state) => state.register);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password2: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.password !== form.password2) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setSubmitting(true);

    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (caughtError) {
      setError(formatAuthError(caughtError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthFormLayout
      title="Créer un compte"
      subtitle="Inscrivez-vous pour suivre vos commandes WORLD DESIGN."
      footer={
        <>
          Déjà inscrit ?{' '}
          <Link to="/login" className="font-semibold text-accent transition hover:opacity-90">
            Se connecter
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
          <span>Nom complet</span>
          <input
            type="text"
            required
            value={form.name}
            onChange={handleChange('name')}
            className="h-11 rounded-[8px] border border-[#E0DBD5] bg-white px-3 text-sm outline-none transition focus:border-accent"
            placeholder="Nom et prénom"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
          <span>Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={handleChange('email')}
            className="h-11 rounded-[8px] border border-[#E0DBD5] bg-white px-3 text-sm outline-none transition focus:border-accent"
            placeholder="email@exemple.com"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
          <span>Téléphone</span>
          <input
            type="tel"
            required
            value={form.phone}
            onChange={handleChange('phone')}
            className="h-11 rounded-[8px] border border-[#E0DBD5] bg-white px-3 text-sm outline-none transition focus:border-accent"
            placeholder="+228 97 08 54 24"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
          <span>Mot de passe</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange('password')}
            className="h-11 rounded-[8px] border border-[#E0DBD5] bg-white px-3 text-sm outline-none transition focus:border-accent"
            placeholder="8 caractères minimum"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
          <span>Confirmation du mot de passe</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={form.password2}
            onChange={handleChange('password2')}
            className="h-11 rounded-[8px] border border-[#E0DBD5] bg-white px-3 text-sm outline-none transition focus:border-accent"
            placeholder="Confirmez le mot de passe"
          />
        </label>

        {error ? <ErrorState title="Inscription impossible" description={error} /> : null}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Création du compte...' : 'Créer mon compte'}
        </button>
      </form>
    </AuthFormLayout>
  );
}
