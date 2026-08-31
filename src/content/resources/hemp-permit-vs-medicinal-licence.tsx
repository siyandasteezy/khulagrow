import { P, H2, H3, UL, Checklist, Callout, Verify, GuideLink, AppLink } from "@/components/Article";

export const SECTIONS = [
  { id: "short-answer", label: "The short answer" },
  { id: "two-regulators", label: "Two regulators, two regimes" },
  { id: "thc-line", label: "The THC line" },
  { id: "decide", label: "Which one do you need?" },
  { id: "compare", label: "What differs in practice" },
  { id: "records", label: "The records gap" },
  { id: "both", label: "Can you hold both?" },
];

export default function Guide() {
  return (
    <>
      <P>
        This is the question that costs new South African growers the most money and the most
        time — usually because it gets answered after the shade cloth is already up. A hemp
        permit and a medicinal cannabis cultivation licence are not two tiers of the same
        thing. They are different applications, to different regulators, under different laws,
        with very different expectations of your facility and your paperwork.
      </P>

      <Callout>
        This guide explains the practical difference so you can work out which application you
        are actually preparing. It is not legal advice — confirm the current position with the
        relevant regulator or a licensing specialist before committing capital.
      </Callout>

      <H2 id="short-answer">The short answer</H2>
      <UL
        items={[
          <><strong>Growing low-THC cannabis as an agricultural crop</strong> — for fibre, seed, grain or hemp-derived products — sits with the Department of Agriculture, Land Reform and Rural Development (DALRRD) as a hemp permit.</>,
          <><strong>Growing cannabis for medicinal purposes</strong> — material intended for medicines, or for any pharmaceutical supply chain — sits with SAHPRA as a cultivation licence.</>,
          <><strong>The determining factor is the crop and its intended use</strong>, not the size of your farm or how much you plan to invest.</>,
        ]}
      />

      <H2 id="two-regulators">Two regulators, two regimes</H2>
      <H3>DALRRD — hemp as an agricultural crop</H3>
      <P>
        The hemp permit treats cannabis as farming. The regulator&apos;s interest is in the
        cultivar you plant, the THC content of what you harvest, where the field is, and where
        the crop goes. The framing is agricultural: seed provenance, field location, crop
        testing, disposal of non-compliant crop.
      </P>
      <H3>SAHPRA — cannabis as a health product input</H3>
      <P>
        The medicinal cultivation licence treats cannabis as the starting material for a
        medicine. The regulator&apos;s interest is pharmaceutical: a controlled facility,
        documented procedures, trained and accountable people, unbroken traceability, secure
        storage, and quality standards on the harvested material. The bar is substantially
        higher, and the cost of clearing it is substantially higher too.
      </P>

      <H2 id="thc-line">The THC line</H2>
      <P>
        Hemp is defined by a THC threshold in the growing plant. Cultivars must sit under that
        limit, and the crop is tested to confirm it. Cross the line and the crop is no longer
        hemp — regardless of what you intended when you planted it.
      </P>
      <Callout>
        <Verify>Confirm the current THC threshold and the permitted-cultivar list</Verify> with
        DALRRD before buying seed. Both have been revised since the hemp framework was
        introduced, and buying seed against an out-of-date list is a common and unrecoverable
        mistake — the crop, not the paperwork, is what fails.
      </Callout>
      <P>
        This is also why the &ldquo;we&apos;ll start as hemp and upgrade later&rdquo; plan
        rarely works. A field planted to a certified low-THC cultivar, in an open field, with
        no access control, is not a facility that can be converted into a licensed medicinal
        site by filing a different form.
      </P>

      <H2 id="decide">Which one do you need?</H2>
      <Checklist
        title="You are probably looking at a hemp permit if…"
        items={[
          "The crop is going into fibre, seed, grain, or hemp-derived consumer products.",
          "You will plant a certified low-THC cultivar from an approved list.",
          "The operation is field-scale agriculture, not a controlled indoor environment.",
          "Your buyers are processors, not pharmaceutical manufacturers.",
        ]}
      />
      <Checklist
        title="You are looking at a SAHPRA cultivation licence if…"
        items={[
          "The material is intended for medicinal use or for a pharmaceutical supply chain.",
          "You are growing high-THC cultivars.",
          "Your buyer is a licensed manufacturer, or you intend to export into a medicinal market.",
          "You are building a controlled, access-restricted facility rather than planting a field.",
        ]}
      />
      <P>
        If both lists partly describe you, that is a signal to get specialist advice before
        spending, not a signal to pick the cheaper application and hope.
      </P>

      <H2 id="compare">What differs in practice</H2>
      <H3>Facility</H3>
      <P>
        A hemp permit does not demand a pharmaceutical-grade facility. A medicinal licence
        effectively does: defined zones, controlled access, secure storage, separation of
        waste and quarantine, and a layout that supports traceability. The full site and
        security expectations are set out in the{" "}
        <GuideLink slug="sahpra-cultivation-licence-checklist">
          SAHPRA cultivation licence checklist
        </GuideLink>.
      </P>
      <H3>Security</H3>
      <P>
        Hemp fields are farmed like other crops. Medicinal sites carry perimeter control,
        access control, CCTV, alarm response and visitor registers — a capital cost item that
        catches many first-time applicants by surprise.
      </P>
      <H3>Cost and lead time</H3>
      <P>
        Both the application fees and the realistic time-to-decision differ materially between
        the two routes. <Verify>Confirm current fees and turnaround times</Verify> for whichever
        route applies to you — and budget for the gap between spending and first revenue, which
        is where most under-capitalised applications die.
      </P>
      <H3>Testing and disposal</H3>
      <P>
        Hemp carries crop testing against the THC threshold, with a defined consequence if the
        crop exceeds it. Medicinal cultivation carries quality testing on harvested material and
        a documented, witnessed destruction process for anything that fails.
      </P>

      <H2 id="records">The records gap</H2>
      <P>
        Here is the difference that matters most after the licence is granted, and the one
        least visible at application time.
      </P>
      <P>
        A hemp permit largely asks: what did you plant, where, and where did it go? That is
        record-keeping a competent farm office can carry.
      </P>
      <P>
        A medicinal cultivation licence asks a harder question, continuously: for any given
        gram in storage, show me the plant it came from, the batch that plant belonged to, every
        input applied to it, every person who touched it, every movement between areas, and the
        reconciliation that proves nothing went missing. That is not a filing task. It is a
        system.
      </P>
      <Checklist
        title="What the medicinal route adds to your daily paperwork"
        items={[
          "Per-batch genealogy from seed or clone through to lot.",
          "Input registers — irrigation, nutrients, pesticides — with rates, dates and operators.",
          "Witnessed destruction records with method and reason.",
          "Inventory lots with status and every movement in or out.",
          "Periodic stock reconciliation with explained variances.",
          "A tamper-evident audit trail of who recorded or changed what.",
        ]}
      />
      <P>
        <AppLink href="/#compliance">KhulaGrow</AppLink> is built around exactly that spine —
        which is why growers on the medicinal route tend to adopt it during the application, not
        after the first inspection.
      </P>

      <H2 id="both">Can you hold both?</H2>
      <P>
        Yes — operations do run a hemp block alongside a licensed medicinal facility. The
        condition is genuine separation: separate areas, separate storage, separate stock
        records, and no ambiguity about which regime a given plant or lot sits under. If your
        records cannot answer &ldquo;which permit does this batch belong to?&rdquo; instantly,
        you have created a compliance problem rather than a second revenue line.
      </P>
      <P>
        Once you know which route you are on, the next step is understanding how it will be
        examined:{" "}
        <GuideLink slug="what-sahpra-inspectors-check">
          what SAHPRA inspectors actually check on a cultivation site
        </GuideLink>.
      </P>
    </>
  );
}
