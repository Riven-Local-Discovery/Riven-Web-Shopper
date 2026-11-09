import { useNavigate } from 'react-router-dom';
import logoGlow from '@/assets/img/riven-logo-glow.png';
import welcomeBg from '@/assets/img/welcome-bg.jpeg';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Icon, type IconName } from '@/components/Icon';
import { useDocumentTitle } from '@/components/Screen';
import { colors } from '@/theme';

const HIGHLIGHTS: { icon: IconName; label: string }[] = [
  { icon: 'storefront-outline', label: 'Local bazaars' },
  { icon: 'people-outline', label: 'Independent makers' },
  { icon: 'heart-outline', label: 'Handmade goods' },
];

export default function WelcomePage() {
  const navigate = useNavigate();
  useDocumentTitle();

  return (
    <div className="welcome" style={{ backgroundImage: `url(${welcomeBg})` }}>
      <div className="welcome-shade" />
      <div className="welcome-content">
        <div className="welcome-brand fade-up" style={{ animationDelay: '0ms' }}>
          <img src={logoGlow} alt="" className="welcome-mark" />
          <h1 className="welcome-wordmark">RIVEN</h1>
          <p className="welcome-tagline">DISCOVER. CONNECT. BELONG.</p>
        </div>

        <div className="welcome-bottom">
          <div className="welcome-copy fade-up" style={{ animationDelay: '140ms' }}>
            <AppText variant="display" as="h2" color={colors.textOnDark} align="center">
              More than a<br />
              marketplace.
            </AppText>
            <AppText variant="body" color="rgba(255,255,255,0.7)" align="center">
              Explore local bazaars, meet independent makers and shop handmade.
            </AppText>
            <ul className="welcome-highlights">
              {HIGHLIGHTS.map((h) => (
                <li key={h.label} className="glass-pill">
                  <Icon name={h.icon} size={14} color={colors.secondary} />
                  <AppText variant="caption" color="rgba(255,255,255,0.85)">
                    {h.label}
                  </AppText>
                </li>
              ))}
            </ul>
          </div>

          <div className="welcome-actions fade-up" style={{ animationDelay: '280ms' }}>
            <Button title="Get Started" icon="arrow-forward" onPress={() => navigate('/register')} />
            <button type="button" className="glass-btn" onClick={() => navigate('/login')}>
              Already have an account? <strong>Log in</strong>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
