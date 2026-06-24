import TopBar from "@/components/TopBar";
import SiteFooter from "@/components/SiteFooter";
import ContactRail from "@/components/ContactRail";

// Layout for the public-facing marketing site: shared nav, footer and the
// persistent contact rail. The /admin shell intentionally omits this chrome.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      {children}
      <SiteFooter />
      <ContactRail />
    </>
  );
}
