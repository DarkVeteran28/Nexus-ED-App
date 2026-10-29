import './globals.css';
import type { ReactNode } from 'react';
import { AuthRecoveryRedirect } from '@/components/auth-recovery-redirect';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthRecoveryRedirect />
        {children}
      </body>
    </html>
  );
}
