import type { Metadata } from "next";
import { LegalPage, Section, List, Callout } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Data hosting & backups",
  description:
    "Where KhulaGrow stores your data, how it is encrypted, backed up and recoverable, and how you can export it at any time.",
  alternates: { canonical: "/data" },
};

export default function DataPage() {
  return (
    <LegalPage
      title="Data hosting & backups"
      intro="Where your records live, how they are protected in transit and at rest, and how they are backed up and portable."
    >
      <Section title="Where your data is hosted">
        <p>KhulaGrow runs on established managed cloud infrastructure:</p>
        <List
          items={[
            <><b>Database</b> — your records are stored in a managed PostgreSQL database provided by Neon, currently in Amazon Web Services&rsquo; US-East region.</>,
            <><b>Application</b> — the app and its APIs are delivered by Netlify, over a global content-delivery network for fast, reliable access from the field.</>,
            <><b>Payments</b> — handled by Yoco; card data never reaches our systems.</>,
          ]}
        />
      </Section>

      <Section title="Data residency">
        <Callout>
          Because our database region is in the United States, personal information is stored outside
          South Africa. This is a cross-border transfer under POPIA, covered in our{" "}
          <a href="/privacy" className="font-semibold underline">Privacy &amp; POPIA</a> notice. If your
          licence conditions require in-country data residency, contact us before subscribing so we can
          discuss options.
        </Callout>
      </Section>

      <Section title="Encryption">
        <List
          items={[
            "In transit — all traffic between your device and KhulaGrow is encrypted over HTTPS/TLS.",
            "At rest — data stored by our database and hosting providers is encrypted at the storage layer.",
            "Passwords are never stored in plain text — only as a secure one-way hash.",
          ]}
        />
      </Section>

      <Section title="Backups & recovery">
        <p>
          Our managed database platform keeps continuous backups with point-in-time recovery, so data
          can be restored to a recent moment in the event of an incident. This runs automatically and
          separately from the live database.
        </p>
        <p>
          For the wider incident and recovery approach — including how we handle an outage — see our{" "}
          <a href="/security" className="font-medium text-brand-700 hover:underline">Security &amp; disaster-recovery</a>{" "}
          page.
        </p>
      </Section>

      <Section title="Your data is portable">
        <p>
          You are never locked in. From within the app you can export cultivation logs, compliance
          packs, harvest and inventory records, financial summaries and an investor-ready portfolio as
          PDF or Excel at any time. You can also request a full export of your account&rsquo;s data.
        </p>
      </Section>

      <Section title="Separation between farms">
        <p>
          Each farm&rsquo;s records are scoped by role-based access controls, so team members only see
          the farms they belong to. Platform support access, when used to help you, is limited and
          recorded in your audit trail.
        </p>
      </Section>
    </LegalPage>
  );
}
