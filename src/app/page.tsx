import Header from "@/components/Header";
import HeroParticles from "@/components/HeroParticles";
import ScrollSequence from "@/components/ScrollSequence";
import SectionDivider from "@/components/SectionDivider";
import ValueProp from "@/components/ValueProp";
import Services from "@/components/Services";
import Differentiation from "@/components/Differentiation";
import BrainOrb from "@/components/BrainOrb";
import Proof from "@/components/Proof";
import CTA from "@/components/CTA";
import SignalPath from "@/components/SignalPath";
import FloatingOrb from "@/components/FloatingOrb";
import { getLang } from "@/i18n/get-lang";
import { getDict } from "@/i18n/dictionaries";

export default async function Home() {
  const lang = await getLang();
  const dict = getDict(lang);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "HLM",
    url: "https://hlm.com",
    logo: "https://hlm.com/logo.png",
    description: dict.meta_description,
    contactPoint: {
      "@type": "ContactPoint",
      email: "contato@highlevelmkt.com",
      telephone: "+351934071660",
      contactType: "sales",
    },
    knowsAbout: [
      "Revenue Systems", "Paid Traffic", "Marketing Automation",
      "AI Solutions", "Lead Generation", "Conversion Optimization",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <FloatingOrb />

      <main className="relative">
        <SignalPath />
        <div id="s-hero"><HeroParticles /></div>
        <div id="s-scroll-seq"><ScrollSequence /></div>
        <SectionDivider />
        <div id="s-value-prop"><ValueProp /></div>
        <Services />
        <SectionDivider />
        <Differentiation />
        <BrainOrb />
        <div id="s-proof"><Proof /></div>
        <div id="s-cta"><CTA /></div>
      </main>
    </>
  );
}
