import type { Metadata } from "next";
import { LegalPage, Section, List, Callout } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy & POPIA",
  description:
    "How KhulaGrow collects, uses, stores and protects personal information, and how we meet the Protection of Personal Information Act (POPIA).",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy & POPIA"
      intro="KhulaGrow is a cultivation record-keeping platform operated by SmartP1ck. This notice explains what personal information we process, why, and how we meet our obligations under South Africa's Protection of Personal Information Act (POPIA)."
    >
      <Section title="Who is responsible for your information">
        <p>
          KhulaGrow is operated by SmartP1ck (&ldquo;we&rdquo;, &ldquo;us&rdquo;). We are the
          responsible party for the account information you give us, and the operator (processor)
          for the cultivation and compliance records you capture on behalf of your farm.
        </p>
        <p>
          Our Information Officer can be reached at{" "}
          <a href="mailto:support@smartpick.co.za" className="font-medium text-brand-700 hover:underline">
            support@smartpick.co.za
          </a>
          . Please route any privacy request or complaint there.
        </p>
      </Section>

      <Section title="Information we process">
        <List
          items={[
            <><b>Account information</b> — your name, email address, phone number and password (stored only as a secure hash, never in plain text).</>,
            <><b>Operational &amp; compliance records</b> — the farm, area, batch, harvest, inventory, task, inspection, sensor and document data you and your team capture. This is your data; we process it to provide the service.</>,
            <><b>Payment information</b> — subscription payments are processed by Yoco. We receive confirmation of payment and amounts, but never see or store your card number.</>,
            <><b>Technical information</b> — basic logs needed to run and secure the service (for example, sign-in events in the audit trail, and error diagnostics).</>,
          ]}
        />
      </Section>

      <Section title="Why we process it (lawful basis)">
        <List
          items={[
            "To perform our contract with you — providing the platform, your records, and support.",
            "To meet our own legal obligations, and to help you meet your record-keeping obligations as a licensed cultivator.",
            "For our legitimate interest in keeping the service secure, reliable and improving over time.",
            "Where required, with your consent — which you may withdraw at any time.",
          ]}
        />
      </Section>

      <Section title="The POPIA conditions">
        <p>We process personal information in line with the eight POPIA conditions for lawful processing:</p>
        <List
          items={[
            "Accountability — we take responsibility for meeting these conditions.",
            "Processing limitation — we collect only what we need, lawfully and fairly.",
            "Purpose specification — we collect for the specific purposes described here.",
            "Further processing limitation — we do not use your information for unrelated purposes.",
            "Information quality — we help you keep records accurate and up to date.",
            "Openness — this notice documents what we do.",
            "Security safeguards — see our Security & disaster-recovery information.",
            "Data subject participation — you can access, correct and delete your information.",
          ]}
        />
      </Section>

      <Section title="Who we share it with">
        <p>We do not sell your information or share it for advertising. We use a small number of trusted sub-processors to run the service:</p>
        <List
          items={[
            <><b>Neon</b> — managed PostgreSQL database hosting where your records are stored.</>,
            <><b>Netlify</b> — application hosting and content delivery.</>,
            <><b>Yoco</b> — South African payment processing for subscriptions.</>,
          ]}
        />
        <p>
          We may also disclose information where the law requires it, or to a regulator such as SAHPRA
          where you have authorised it or it is legally required.
        </p>
      </Section>

      <Section title="Where your information is hosted (cross-border transfer)">
        <Callout>
          Your records are currently hosted in the United States (Amazon Web Services, US-East region)
          via our database provider, and delivered globally through our hosting provider&rsquo;s network.
          This means personal information is transferred outside South Africa. We rely on the
          protections offered by these providers and, where applicable, your consent, in line with
          section 72 of POPIA. Full detail is on our{" "}
          <a href="/data" className="font-semibold underline">Data hosting &amp; backups</a> page.
        </Callout>
      </Section>

      <Section title="How long we keep it">
        <p>
          We keep your records for as long as your account is active, and for any period you need them
          to meet your own regulatory obligations. You can export your data at any time, and request
          deletion — subject to any records we are legally required to retain.
        </p>
      </Section>

      <Section title="Your rights">
        <p>Under POPIA you have the right to:</p>
        <List
          items={[
            "Ask what personal information we hold about you and get a copy.",
            "Ask us to correct or update information that is inaccurate.",
            "Ask us to delete information, where we are not required to keep it.",
            "Object to processing in certain circumstances, and withdraw consent.",
            "Complain to the Information Regulator (South Africa).",
          ]}
        />
        <p>
          To exercise any of these, email{" "}
          <a href="mailto:support@smartpick.co.za" className="font-medium text-brand-700 hover:underline">
            support@smartpick.co.za
          </a>
          . You may also lodge a complaint with the Information Regulator (South Africa) at{" "}
          <a href="https://inforegulator.org.za" target="_blank" rel="noopener" className="font-medium text-brand-700 hover:underline">
            inforegulator.org.za
          </a>
          .
        </p>
      </Section>

      <Section title="Cookies & local storage">
        <p>
          We use a single secure sign-in cookie to keep you logged in, and your browser&rsquo;s local
          storage to let you capture data offline in the field and sync it later. We do not use
          third-party advertising or cross-site tracking cookies.
        </p>
      </Section>

      <Section title="Changes to this notice">
        <p>
          We may update this notice as the service evolves. The date at the top shows when it last
          changed, and material changes will be communicated in the app.
        </p>
      </Section>
    </LegalPage>
  );
}
