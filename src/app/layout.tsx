// app/layout.tsx
import { AuthProvider } from '@/components/AuthProvider';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider> {/* {children} 감싸기 */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}