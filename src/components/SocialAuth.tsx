import { colors } from '@/theme';
import { showAlert } from '@/utils/alert';
import { AppText } from './AppText';
import { Icon } from './Icon';

// The API only exposes email/password auth (/auth/register, /auth/login).
// These buttons are placeholders until an OAuth endpoint is available.
const notAvailable = (provider: string) =>
  showAlert(`${provider} sign-in`, `${provider} sign-in isn't available yet. Please use your email and password.`);

export function SocialAuth() {
  return (
    <div className="social-auth">
      <div className="divider-row">
        <span className="line" />
        <AppText variant="caption">Or continue with</AppText>
        <span className="line" />
      </div>
      <div className="row" style={{ justifyContent: 'center', gap: 16 }}>
        <button type="button" className="social-btn" onClick={() => notAvailable('Google')} aria-label="Continue with Google">
          <Icon name="logo-google" size={20} color={colors.text} />
        </button>
        <button type="button" className="social-btn" onClick={() => notAvailable('Apple')} aria-label="Continue with Apple">
          <Icon name="logo-apple" size={22} color={colors.text} />
        </button>
      </div>
    </div>
  );
}
