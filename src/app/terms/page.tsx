import type { Metadata } from "next";
import { LegalPage, Section, List, Callout } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The terms governing use of the KhulaGrow cultivation management platform, including subscriptions, data ownership and compliance responsibilities.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      intro="These terms govern your use of KhulaGrow, operated by SmartP1ck. By creating an account or using the platform, you agree to them."
    >
      <Section title="The service">
        <p>
          KhulaGrow is software that helps licensed cannabis cultivators capture, organise and export
          seed-to-harvest, inventory and compliance records. We provide the tools; you decide what to
          record and remain responsible for your operation.
        </p>
      </Section>

      <Section title="Your account">
        <List
          items={[
            "You must give accurate registration details and keep your login credentials secure.",
            "You are responsible for activity under your account and your team members' accounts.",
            "You must have the legal right and any licences required to cultivate and to keep the records you capture.",
            "Tell us promptly if you suspect unauthorised access — see our Security page for how.",
          ]}
        />
      </Section>

      <Section title="Acceptable use">
        <p>You agree not to misuse the service, including not to:</p>
        <List
          items={[
            "Use it for any unlawful purpose or to store unlawful content.",
            "Attempt to breach, probe or disrupt the platform's security or other customers' data.",
            "Share access with people outside your farm's team, or resell the service.",
          ]}
        />
      </Section>

      <Section title="Subscriptions & billing">
        <List
          items={[
            "KhulaGrow costs R1,500 per month per farm owner, covering the owner's whole team.",
            "New accounts start with a 3-day free trial; no card is required to begin.",
            "Payments are processed securely by Yoco. Renewals are manual — we remind you in the app before your month ends, and never debit you automatically.",
            "If a subscription lapses, your records remain safe and readable, but capturing new data is paused until you subscribe again.",
          ]}
        />
      </Section>

      <Section title="Your data belongs to you">
        <p>
          You own the cultivation, inventory and compliance records you create. We act only as the
          operator that stores and processes them to run the service, as described in our{" "}
          <a href="/privacy" className="font-medium text-brand-700 hover:underline">Privacy &amp; POPIA</a>{" "}
          notice. You can export your data at any time in PDF and Excel formats.
        </p>
      </Section>

      <Section title="Compliance responsibility">
        <Callout>
          KhulaGrow helps you keep the records a licensed cultivator needs, but it does not replace
          your legal obligations. You remain responsible for holding a valid SAHPRA licence, for the
          accuracy and completeness of what you record, and for meeting your own regulatory
          requirements. KhulaGrow is a record-keeping tool, not legal or regulatory advice.
        </Callout>
      </Section>

      <Section title="Availability">
        <p>
          We work to keep KhulaGrow available and reliable, and describe our approach on the{" "}
          <a href="/support" className="font-medium text-brand-700 hover:underline">Support &amp; SLA</a> and{" "}
          <a href="/security" className="font-medium text-brand-700 hover:underline">Security &amp; disaster-recovery</a>{" "}
          pages. The service is provided on a reasonable-efforts basis, and occasional maintenance or
          factors outside our control may affect availability.
        </p>
      </Section>

      <Section title="Limitation of liability">
        <p>
          To the extent permitted by law, KhulaGrow and SmartP1ck are not liable for indirect or
          consequential loss, or for loss arising from your own records being inaccurate or incomplete.
          Nothing in these terms limits any liability that cannot lawfully be limited.
        </p>
      </Section>

      <Section title="Ending your use">
        <p>
          You can stop using KhulaGrow at any time. Before you leave, export your records — they are
          yours to keep. We may suspend accounts that breach these terms, and will give reasonable
          notice where we can.
        </p>
      </Section>

      <Section title="Governing law">
        <p>
          These terms are governed by the laws of the Republic of South Africa. We may update them as
          the service evolves; the date at the top shows when they last changed.
        </p>
      </Section>
    </LegalPage>
  );
}
