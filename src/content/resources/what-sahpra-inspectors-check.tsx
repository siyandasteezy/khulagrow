import { P, H2, H3, UL, OL, Checklist, Callout, Verify, GuideLink, AppLink } from "@/components/Article";

export const SECTIONS = [
  { id: "shape", label: "The shape of an inspection" },
  { id: "documents", label: "1. Documents and authority" },
  { id: "walkthrough", label: "2. The site walk-through" },
  { id: "security", label: "3. Security" },
  { id: "records", label: "4. Records — the long part" },
  { id: "reconciliation", label: "5. Stock reconciliation" },
  { id: "people", label: "6. People and training" },
  { id: "findings", label: "How findings are written up" },
  { id: "prepare", label: "Preparing properly" },
];

export default function Guide() {
  return (
    <>
      <P>
        Inspections are not a quiz. An inspector arrives with a structure, works through it, and
        writes down the difference between what your documents say you do and what your site and
        records show you actually did. Almost every finding lives in that gap.
      </P>
      <P>
        What follows is the order an inspection usually runs in, and what each stage is really
        testing. <Verify>Confirm the current inspection scope and notice period</Verify> against
        SAHPRA&apos;s published guidance — this guide describes the practical pattern, not a
        regulatory instrument.
      </P>

      <H2 id="shape">The shape of an inspection</H2>
      <OL
        items={[
          <><strong>Opening meeting.</strong> Scope, timing, who will accompany the inspector.</>,
          <><strong>Documents and authority.</strong> Licence, responsible person, SOP set.</>,
          <><strong>Site walk-through.</strong> Following the plant&apos;s path through the facility.</>,
          <><strong>Security.</strong> Access, cameras, storage, incident handling.</>,
          <><strong>Records.</strong> Sampling batches and tracing them end to end.</>,
          <><strong>Reconciliation.</strong> Does the stock on the shelf match the stock on the system?</>,
          <><strong>People.</strong> Training records, and asking staff what they actually do.</>,
          <><strong>Closing meeting.</strong> Preliminary findings, and your right to respond.</>,
        ]}
      />
      <Callout>
        The opening and closing meetings matter more than people expect. Take your own notes.
        If a finding rests on a misunderstanding, the closing meeting is the cheapest place in
        the world to correct it.
      </Callout>

      <H2 id="documents">1. Documents and authority</H2>
      <P>
        The first test is whether the operation is being run by the people and under the terms
        the licence says.
      </P>
      <Checklist
        title="Have these at hand, current and versioned"
        items={[
          "The licence itself, in date, with its conditions.",
          "The responsible person's appointment, qualifications and current contact details.",
          "The organogram, matching the people actually on site.",
          "The complete SOP set — each with a document number, version, effective date and approver.",
          "The document control register showing which version is current and who approved it.",
          "Records of any notified change to site, scope or responsible person.",
        ]}
      />
      <P>
        <strong>The gap this finds:</strong> superseded SOPs still in circulation, a responsible
        person who has left, or a facility that has expanded into areas the licence never
        covered.
      </P>

      <H2 id="walkthrough">2. The site walk-through</H2>
      <P>
        The inspector follows the crop: propagation, vegetative, flowering, harvest, drying,
        storage, dispatch — with waste and quarantine off to the side. They are checking that
        the facility matches the layout you submitted, and that the physical flow makes
        contamination and mix-ups unlikely.
      </P>
      <UL
        items={[
          "Are areas identified, and does the identification match your records and batch labels?",
          "Is every batch physically labelled and traceable to a code in the system?",
          "Are quarantine and waste areas genuinely separate and controlled?",
          "Is drying and curing space controlled, monitored and recorded?",
          "Is storage secure, organised, and consistent with your inventory records?",
          "Is the housekeeping consistent with the sanitation SOP you just handed over?",
        ]}
      />
      <P>
        <strong>The gap this finds:</strong> an unlabelled tray, a batch in a room your records
        say it left last week, a quarantine area being used for general storage.
      </P>

      <H2 id="security">3. Security</H2>
      <P>
        Security is checked as installed and operating, not as designed. Expect the camera
        coverage to be viewed on the day, and expect to be asked to retrieve historical footage
        for a specific date and time.
      </P>
      <Checklist
        title="Security checks that commonly produce findings"
        items={[
          "Cameras covering the destruction point, storage and entry — not just the gate.",
          <>Footage actually retrievable for the required retention period — <Verify>confirm the current minimum retention</Verify>.</>,
          "Access control that is enforced: no propped doors, no shared codes for the storage room.",
          "A visitor register that is filled in, including for contractors and deliveries.",
          "Alarm system armed, tested, with a documented response arrangement.",
          "A written and followed procedure for theft, loss or diversion.",
        ]}
      />
      <P>
        <strong>The gap this finds:</strong> a system that was compliant on installation day and
        has quietly degraded — a failed camera nobody logged, an unlocked storeroom because the
        key kept getting lost.
      </P>

      <H2 id="records">4. Records — the long part</H2>
      <P>
        This is where most of the inspection time goes, and where most findings are written.
        The method is simple and hard to fake: the inspector picks a batch, or picks a lot in
        storage, and asks you to trace it in both directions.
      </P>
      <H3>Forwards, from a batch</H3>
      <UL
        items={[
          "Where did this batch start — seed lot or mother plant?",
          "How many plants, and what happened to each stage transition?",
          "Every input applied: product, rate, date, operator.",
          "What was destroyed along the way, why, by what method, witnessed by whom?",
          "What was harvested, wet and dry weight, and into which lot?",
        ]}
      />
      <H3>Backwards, from a lot in storage</H3>
      <UL
        items={[
          "Which batch or batches does this lot come from?",
          "Where has it been stored, and what movements are recorded?",
          "Does the recorded weight match the weight in front of us?",
          "Who recorded each entry, and has anything been changed after the fact?",
        ]}
      />
      <Callout>
        The last question is the one paper records handle worst. An inspector who sees a
        corrected figure with no indication of who changed it, when, or why, has found a data
        integrity issue — which is treated far more seriously than an honest gap.
      </Callout>
      <P>
        A tamper-evident audit trail answers this by construction rather than by argument.
        In <AppLink href="/#compliance">KhulaGrow</AppLink>, every entry carries the user and
        timestamp that created it, corrections are recorded rather than overwritten, and the
        whole trace for a batch or a lot exports as a PDF while the inspector is still sitting
        at the table.
      </P>

      <H2 id="reconciliation">5. Stock reconciliation</H2>
      <P>
        The inspector will want the numbers to close: opening stock, plus harvest, minus
        dispatch, minus destruction, equals what is on the shelf. Variance is not automatically
        a finding — <em>unexplained</em> variance is.
      </P>
      <UL
        items={[
          "Reconciliation performed at a fixed, documented interval — not improvised for the inspection.",
          "Moisture loss during drying and curing accounted for and explained.",
          "Destruction quantities matching the witnessed destruction records.",
          "Dispatch quantities matching the receiving party's documentation.",
          "Any variance investigated, with the investigation written down.",
        ]}
      />

      <H2 id="people">6. People and training</H2>
      <P>
        Expect the inspector to speak to staff directly — often a worker rather than a manager —
        and to ask a simple question like &ldquo;what do you do if you find a diseased
        plant?&rdquo; The answer is compared against the SOP.
      </P>
      <UL
        items={[
          "Training records signed and dated, mapped to the SOPs relevant to each role.",
          "Refresher training after an SOP is revised — a new version with no retraining is a finding waiting to happen.",
          "Staff able to describe their own tasks in terms that match the written procedure.",
          "Screening records for staff with crop and storage access.",
        ]}
      />

      <H2 id="findings">How findings are written up</H2>
      <P>
        Findings are typically graded by how much risk they carry, and the grade drives how fast
        you must respond. <Verify>Confirm the current classification and response deadlines</Verify>{" "}
        in SAHPRA&apos;s inspection guidance.
      </P>
      <P>
        Your response matters as much as the finding. A good response states the root cause,
        the immediate correction, the preventive action, the person accountable and the date —
        and then attaches evidence that it actually happened. A response that says
        &ldquo;staff have been reminded&rdquo; invites the same finding next time.
      </P>

      <H2 id="prepare">Preparing properly</H2>
      <OL
        items={[
          <>Run a mock inspection annually, following this exact sequence, with someone who did not write the SOPs.</>,
          <>Pick three batches at random and trace them end to end. Time how long it takes. That number is your real readiness score.</>,
          <>Fix the retrieval problem before the record problem — records you cannot produce in the room count as records you do not have.</>,
          <>Keep a standing inspection pack: licence, SOP index, organogram, training matrix, last reconciliation, last CAPA log.</>,
          <>Close out old findings and keep the evidence. The first thing checked at the next inspection is the last one.</>,
        ]}
      />
      <P>
        If you are still assembling the underlying system, start with the{" "}
        <GuideLink slug="sahpra-cultivation-licence-checklist">
          SAHPRA cultivation licence checklist
        </GuideLink>{" "}
        — the records section there is the same spine an inspector will pull on.
      </P>
    </>
  );
}
