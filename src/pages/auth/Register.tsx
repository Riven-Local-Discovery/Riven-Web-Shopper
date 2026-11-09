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
import { isValidEmail, isValidPassword } from '@/utils/format';

export default function RegisterPage() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (fullName.trim().length < 2) next.fullName = 'Please enter your full name';
    if (!isValidEmail(email)) next.email = 'Please enter a valid email address';
    if (!isValidPassword(password)) next.password = 'Password must be at least 8 characters and contain one number';
    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      await register(fullName.trim(), email.trim().toLowerCase(), password);
    } catch (err) {
      setFormError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <Screen width="narrow" header={<Header title="Create account" />}>
        <form onSubmit={submit} noValidate className="auth-card">
          <Logo />
          <AppText variant="h1" style={{ marginTop: 24 }}>
            Create your account
          </AppText>
          <AppText variant="bodySm" style={{ marginTop: 4, marginBottom: 24 }}>
            Join Riven and explore unique bazaars and local creators.
          </AppText>

          <TextField
            label="Full Name"
            icon="person-outline"
            placeholder="John Doe"
            value={fullName}
            onChangeText={setFullName}
            autoComplete="name"
            error={errors.fullName}
          />
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
            autoComplete="new-password"
            error={errors.password}
            hint="Password must be at least 8 characters and contain one number."
          />

          {formError ? (
            <AppText variant="bodySm" color={colors.danger} role="alert" style={{ marginBottom: 12 }}>
              {formError}
            </AppText>
          ) : null}

          <Button title="Create Account" type="submit" loading={submitting} />
          <SocialAuth />

          <AppText variant="bodySm" align="center" style={{ marginTop: 24 }}>
            Already have an account?{' '}
            <Link to="/login" replace className="link">
              Log in
            </Link>
          </AppText>
        </form>
      </Screen>
    </div>
  );
}
