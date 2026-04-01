import Hero from "@/components/Hero";
import ScrollSequence from "@/components/ScrollSequence";
import SectionDivider from "@/components/SectionDivider";
import ValueProp from "@/components/ValueProp";
import Services from "@/components/Services";
import Differentiation from "@/components/Differentiation";
import Proof from "@/components/Proof";
import CTA from "@/components/CTA";

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
    email: "hello@hlm.com",
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
      <main>
        <Hero />
        <ScrollSequence />
        <SectionDivider />
        <ValueProp />
        <Services />
        <SectionDivider />
        <Differentiation />
        <Proof />
        <SectionDivider />
        <CTA />
      </main>
    </>
  );
}
