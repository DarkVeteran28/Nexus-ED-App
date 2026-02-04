// src/app/layout.tsx

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* This is where your pages (Student, Teacher, etc.) are injected */}
        {children}
      </body>
    </html>
  )
}