import PlaceholderPage from '../components/PlaceholderPage';
import { usePageTitle } from '../hooks/usePageTitle';

export default function NotFoundPage() {
  usePageTitle('Page introuvable');

  return (
    <PlaceholderPage
      eyebrow="404"
      title="Page introuvable"
      description="La route demandée n'existe pas dans cette base frontend."
    />
  );
}
