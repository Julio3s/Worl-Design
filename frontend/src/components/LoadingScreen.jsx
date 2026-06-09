import { Loader2 } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-cream text-primary">
      <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
      <span className="sr-only">Loading</span>
    </div>
  );
}
