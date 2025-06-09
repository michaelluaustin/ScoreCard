import { AppProvider } from '@/components/AppProvider';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Flag } from 'lucide-react'; // Using Flag icon from lucide-react as a placeholder logo

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <div className="flex flex-col min-h-screen">
        <header className="bg-primary text-primary-foreground shadow-md">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline">
              <Flag className="h-7 w-7" />
              ScoreCard+
            </Link>
          </div>
        </header>
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-muted text-muted-foreground py-4 text-center text-sm">
          © {new Date().getFullYear()} ScoreCard+. Tee up your game!
        </footer>
      </div>
    </AppProvider>
  );
}
