import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion - EstimPro",
  description: "Connectez-vous à votre compte EstimPro",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50">
      <div className="w-full max-w-md p-4">{children}</div>
    </div>
  );
}
