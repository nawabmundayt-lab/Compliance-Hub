import type { Metadata } from 'next';
import './globals.css';
import { DataProvider } from '@/components/providers';
import { AppShell } from '@/components/shell';

export const metadata: Metadata = {
  title: 'PSBA Compliance Hub — Facilities Compliance & Monitoring Dashboard',
  description: 'Punjab-wide monitoring of Joyland fitness certificates, Food Court PFA licenses and Parking Stand agreements for Punjab Sahulat Bazaar Authority.',
  icons: { icon: '/psba-logo.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DataProvider>
          <AppShell>{children}</AppShell>
        </DataProvider>
      </body>
    </html>
  );
}
