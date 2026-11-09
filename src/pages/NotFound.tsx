import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@/components/Layout';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/States';

export default function NotFoundPage() {
  const navigate = useNavigate();
  useDocumentTitle('Page not found');
  return (
    <Screen width="narrow">
      <EmptyState
        icon="search-outline"
        title="Page not found"
        message="The page you're looking for doesn't exist or has moved."
        actionLabel="Back to home"
        onAction={() => navigate('/')}
      />
    </Screen>
  );
}
