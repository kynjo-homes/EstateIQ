import Image from "next/image";
import Link from "next/link";
import logo from "@/components/images/logo2.png";

const footerLinks = [
  {
    heading: "Product",
    links: ["Features", "Pricing", "Integrations", "Changelog"],
  },
  {
    heading: "Company",
    links: ["About", "Blog", "Careers", "Contact"],
  },
  {
    heading: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
  },
];

const Footer = () => (
  <footer className="py-16 bg-card border-t border-border">
    <div className="max-w-7xl mx-auto section-padding">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <Image
              src={logo}
              alt="EstateIQ - Intelligent Estate Management Platform"
              height={64}
              width={224}
              className="h-16 w-auto object-contain"
            />
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            Intelligent estate management for modern communities.
          </p>
        </div>

        {footerLinks.map((group) => (
          <div key={group.heading}>
            <h4 className="font-sans text-sm font-semibold text-foreground mb-4">{group.heading}</h4>
            <ul className="space-y-2.5">
              {group.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-14 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
        <span className="text-xs text-muted-foreground">© 2026 EstateIQ. All rights reserved.</span>
        <div className="flex gap-5">
          {["Twitter", "LinkedIn", "GitHub"].map((s) => (
            <a key={s} href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              {s}
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
