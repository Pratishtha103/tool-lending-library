import "./globals.css";

export const metadata = {
  title: "Tool Lending Library - Asset Management Dashboard",
  description: "Enterprise feature-complete CRUD system for tracking tools, loans, conditions, and catalog status. Built for floor staff and administrators.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
