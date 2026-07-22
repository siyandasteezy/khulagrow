import type { Metadata } from "next";
import { LegalPage, Section, List, Callout } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Security & disaster recovery",
  description:
    "How KhulaGrow protects your account and data, controls access, and recovers from incidents.",
  alternates: { canonical: "/security" },
};

export default function SecurityPage() {
  return (
    <LegalPage
      title="Security & disaster recovery"
      intro="The measures that protect your account and records, and how we plan to keep the service running and recover if something goes wrong."
    >
      <Section title="Sign-in & sessions">
        <List
          items={[
            "Passwords are stored only as a secure one-way hash (bcrypt) — we can never see them.",
            "Sessions use signed, HTTP-only cookies that scripts on the page cannot read.",
            "All traffic is served over HTTPS/TLS.",
          ]}
        />
      </Section>

      <Section title="Access control">
        <p>
          KhulaGrow uses role-based access control. Owners and managers run the farm; supervisors and
          workers capture day-to-day records; inspectors get read-only access. Team members only reach
          the farms they belong to.
        </p>
        <p>
          Platform support access — used only to help you with a functional issue — is limited to our
          team and every action is written to your farm&rsquo;s audit trail under the individual who
          performed it.
        </p>
      </Section>

      <Section title="Audit trail">
        <p>
          Every meaningful action is recorded in an append-only audit trail: who did what, when, and to
          which record. This supports accountability for your own SAHPRA obligations and helps us
          investigate any security question.
        </p>
      </Section>

      <Section title="Payment security">
        <p>
          Subscription payments are handled entirely by Yoco, a licensed South African payment
          provider. Card details are entered on Yoco&rsquo;s secure checkout and never touch or get
          stored on KhulaGrow&rsquo;s systems.
        </p>
      </Section>

      <Section title="Infrastructure">
        <p>
          We build on established managed providers (Netlify for hosting, Neon for the database) that
          maintain their own physical and network security controls and certifications. This lets us
          inherit strong infrastructure security and focus on protecting your data within the app.
        </p>
      </Section>

      <Section title="Disaster recovery & business continuity">
        <List
          items={[
            "Your data is backed up continuously with point-in-time recovery, so it can be restored to a recent moment after an incident.",
            "The application and database run on redundant managed platforms designed to tolerate hardware failure.",
            "If a serious incident occurs, our priority order is: protect data integrity, restore read access to your records, then restore full service.",
            "We will keep affected customers informed through the app and by email while we work to restore service.",
          ]}
        />
        <p>
          Because your records remain readable even when new-data capture is affected, an outage does
          not put your existing compliance history out of reach.
        </p>
      </Section>

      <Section title="Reporting a vulnerability">
        <Callout>
          If you believe you have found a security issue, please email{" "}
          <a href="mailto:support@smartpick.co.za" className="font-semibold underline">support@smartpick.co.za</a>{" "}
          with the details. We take reports seriously, will acknowledge them, and ask that you give us a
          reasonable chance to fix an issue before disclosing it publicly.
        </Callout>
      </Section>
    </LegalPage>
  );
}
