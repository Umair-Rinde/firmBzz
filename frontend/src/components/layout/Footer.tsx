import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">AE</span>
              </div>
              <span className="font-heading text-xl font-bold text-foreground">
                Anmol Enterpirses
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Connecting businesses with trusted products and retailers. 
              Grow your business with confidence.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-foreground">Quick Links</h4>
            <ul className="mt-4 space-y-2">
              {(
                [
                  { label: "Products", path: "/products" },
                  { label: "Retailers", path: "/retailers" },
                  { label: "About", path: "/" },
                  { label: "Contact", path: "/contact" },
                ] as const
              ).map(({ label, path }) => (
                <li key={label}>
                  <Link
                    to={path}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-foreground">Support</h4>
            <ul className="mt-4 space-y-2">
              {["Help Center", "Terms of Service", "Privacy Policy"].map((item) => (
                <li key={item}>
                  <Link
                    to="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} FirmBizz. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
