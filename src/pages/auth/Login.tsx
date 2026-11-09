import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '@/api/client';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Header, Screen } from '@/components/Screen';
import { SocialAuth } from '@/components/SocialAuth';
import { TextField } from '@/components/TextField';
import { Logo } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme';
import { showAlert } from '@/utils/alert';
import { isValidEmail } from '@/utils/format';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!isValidEmail(email)) next.email = 'Please enter a valid email address';
    if (!password) next.password = 'Please enter your password';
    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      setFormError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <Screen width="narrow" header={<Header title="Log in" />}>
        <form onSubmit={submit} noValidate className="auth-card">
          <Logo />
          <AppText variant="h1" style={{ marginTop: 24 }}>
            Welcome back
          </AppText>
          <AppText variant="bodySm" style={{ marginTop: 4, marginBottom: 24 }}>
            Sign in to your account
          </AppText>

          <TextField
            label="Email address"
            icon="mail-outline"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            error={errors.email}
          />
          <TextField
            label="Password"
            icon="lock-closed-outline"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secure
            autoComplete="current-password"
            error={errors.password}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -8, marginBottom: 20 }}>
            <button
              type="button"
              className="link"
              onClick={() => showAlert('Forgot password', 'Password reset is not available yet. Please contact support.')}
            >
              Forgot password?
            </button>
          </div>

          {formError ? (
            <AppText variant="bodySm" color={colors.danger} role="alert" style={{ marginBottom: 12 }}>
              {formError}
            </AppText>
          ) : null}

          <Button title="Log In" type="submit" loading={submitting} />
          <SocialAuth />

          <AppText variant="bodySm" align="center" style={{ marginTop: 24 }}>
            New to Riven?{' '}
            <Link to="/register" replace className="link">
              Create an account
            </Link>
          </AppText>
        </form>
      </Screen>
    </div>
  );
}
