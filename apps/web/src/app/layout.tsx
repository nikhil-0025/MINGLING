import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from '@/contexts/session-context';
import { SocketProvider } from '@/contexts/socket-context';
import { RoomProvider } from '@/contexts/room-context';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Mingling — Anonymous Real-Time Messaging',
  description: 'Privacy-first messaging. No login required. Communicate instantly with temporary sessions.',
  keywords: ['messaging', 'anonymous', 'privacy', 'chat', 'real-time', 'no login'],
  authors: [{ name: 'Mingling' }],
  openGraph: {
    title: 'Mingling — Anonymous Real-Time Messaging',
    description: 'Privacy-first messaging without registration.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange={false}>
          <SessionProvider>
            <SocketProvider>
              <RoomProvider>
                {children}
              </RoomProvider>
            </SocketProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}