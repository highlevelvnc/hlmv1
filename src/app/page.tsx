import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ScrollSequence from "@/components/ScrollSequence";
import SectionDivider from "@/components/SectionDivider";
import ValueProp from "@/components/ValueProp";
import Services from "@/components/Services";
import Differentiation from "@/components/Differentiation";
import Proof from "@/components/Proof";
import CTA from "@/components/CTA";
import SignalPath from "@/components/SignalPath";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "HLM",
  url: "https://hlm.com",
  logo: "https://hlm.com/logo.png",
  description:
    "HLM builds intelligent revenue systems — combining paid traffic, automation, and AI to help operators grow predictably.",
  contactPoint: {
    "@type": "ContactPoint",
    email: "contato@highlevelmkt.com",
    telephone: "+351934071660",
    contactType: "sales",
  },
  knowsAbout: [
    "Revenue Systems",
    "Paid Traffic",
    "Marketing Automation",
    "AI Solutions",
    "Lead Generation",
    "Conversion Optimization",
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header — fixed, revealed on scroll */}
      <Header />

      {/* position: relative creates the stacking context SignalPath needs */}
      <main className="relative">
        <SignalPath />

        <div id="s-hero"><Hero /></div>
        <div id="s-scroll-seq"><ScrollSequence /></div>
        <SectionDivider />
        <div id="s-value-prop"><ValueProp /></div>
        <Services />
        <SectionDivider />
        <Differentiation />
        <div id="s-proof"><Proof /></div>
        <SectionDivider />
        <div id="s-cta"><CTA /></div>
      </main>
    </>
  );
}
