import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI & Robotics Book Chat API',
  description: 'Backend API for AI & Robotics Book with intelligent chat and learning journey tracking',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
