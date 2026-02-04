export function Footer() {
  return (
    <footer className="border-t py-4">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} EstimPro. Tous droits réservés.
        </p>
        <p className="text-xs text-muted-foreground">
          Solution de gestion pour carrosseries automobiles
        </p>
      </div>
    </footer>
  );
}
