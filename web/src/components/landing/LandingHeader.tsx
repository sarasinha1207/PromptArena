"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NAV_LINKS } from "@/content/landing";
import { LoginButton } from "./LoginButton";
import { LogoMark } from "./LogoMark";
import styles from "./LandingHeader.module.css";

/** Public site header. Separate from the in-event HUD (handbook §4.2). */
export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      if (window.scrollY < 200) setActive("");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.map((link) => document.getElementById(link.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header className={styles.wrap}>
      <div className={styles.bar} data-scrolled={scrolled} data-open={menuOpen}>
        <Link href="/" className={styles.brand} aria-label="PromptArena home">
          <LogoMark size={30} />
          <span className={styles.brandName}>PromptArena</span>
        </Link>

        <nav className={styles.nav} aria-label="Sections" data-open={menuOpen}>
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={styles.link}
              data-active={active === link.id}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className={styles.mobileLogin}>
            <LoginButton size="small" onClick={() => setMenuOpen(false)} />
          </div>
        </nav>

        <div className={styles.desktopLogin}>
          <LoginButton size="small" />
        </div>

        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
