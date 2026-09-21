import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { InteractiveBackground } from '@/components/InteractiveBackground';

export const metadata: Metadata = {
  title: 'Vital Connect | Intelligent Emergency Blood Coordination Platform',
  description: 'Connecting people, hospitals, and blood sources when every second matters across all 38 Tamil Nadu districts.',
  keywords: ['Blood Donation', 'Emergency Blood', 'Tamil Nadu', 'Chain Rescue', 'Vital Connect'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-vital-500 selection:text-white min-h-screen flex flex-col justify-between overflow-x-hidden bg-slate-950 text-slate-100">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <InteractiveBackground />
              <div className="relative z-10 flex flex-col min-h-screen justify-between w-full">
                <div>
                  <Navbar />
                  {/* Full-width responsive container eliminating max-w-7xl constraint */}
                  <main className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-14 py-4">
                    {children}
                  </main>
                </div>
                <Footer />
              </div>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
