import type { Metadata } from "next";
import { LegalPage, Section, List, Callout } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Support & SLA",
  description:
    "How to reach KhulaGrow support, our response-time targets, availability approach and maintenance practices.",
  alternates: { canonical: "/support" },
};

export default function SupportPage() {
  return (
    <LegalPage
      title="Support & service commitments"
      intro="How to get help, what response times to expect, and the commitments we make around availability and communication."
    >
      <Section title="How to reach us">
        <List
          items={[
            <>Email <a href="mailto:support@smartpick.co.za" className="font-medium text-brand-700 hover:underline">support@smartpick.co.za</a> — the fastest way to reach us.</>,
            "The in-app How-it-works guide, for step-by-step help getting set up.",
            "With your permission, our team can securely look at your farm alongside you to resolve a functional issue.",
          ]}
        />
      </Section>

      <Section title="Support hours">
        <p>
          We provide support during South African business hours (08:00–17:00 SAST, Monday to Friday,
          excluding public holidays). Messages sent outside these hours are picked up the next business
          day.
        </p>
      </Section>

      <Section title="Response-time targets">
        <p>We aim to acknowledge and respond to support requests within these targets, by severity:</p>
        <List
          items={[
            <><b>Critical</b> — the service is unavailable or data capture is broken for your farm: same business day.</>,
            <><b>High</b> — an important feature is not working, but there is a workaround: within 1 business day.</>,
            <><b>Normal</b> — questions, minor issues and requests: within 2 business days.</>,
          ]}
        />
        <p className="text-xs text-gray-400">
          These are response targets — the time to a first meaningful reply — not guaranteed
          resolution times, which depend on the issue.
        </p>
      </Section>

      <Section title="Availability">
        <p>
          KhulaGrow runs on redundant managed infrastructure and we work to keep it available around
          the clock. Because the app also works offline, your team can keep capturing records in the
          field during a brief interruption, and entries sync automatically once connectivity returns.
        </p>
      </Section>

      <Section title="Maintenance & incident communication">
        <List
          items={[
            "We schedule any disruptive maintenance outside business hours where possible, and give notice in the app.",
            "During a significant incident we keep affected customers informed by email and in the app until it is resolved.",
            "After a major incident we review what happened and what we changed to prevent a recurrence.",
          ]}
        />
      </Section>

      <Section title="Your data during an incident">
        <Callout>
          Even if new-data capture is interrupted, your existing records stay readable and exportable.
          Our recovery approach is described on the{" "}
          <a href="/security" className="font-semibold underline">Security &amp; disaster-recovery</a> page.
        </Callout>
      </Section>

      <Section title="Enterprise arrangements">
        <p>
          Need a formal service-level agreement, in-country data residency or specific commitments for
          your operation? Email{" "}
          <a href="mailto:support@smartpick.co.za" className="font-medium text-brand-700 hover:underline">
            support@smartpick.co.za
          </a>{" "}
          and we&rsquo;ll work through your requirements.
        </p>
      </Section>
    </LegalPage>
  );
}
