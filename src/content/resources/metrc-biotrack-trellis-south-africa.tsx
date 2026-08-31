import { P, H2, H3, UL, Checklist, Callout, GuideLink, AppLink } from "@/components/Article";

export const SECTIONS = [
  { id: "why-searching", label: "Why growers search for these" },
  { id: "metrc", label: "Metrc is a government system" },
  { id: "biotrack-trellis", label: "BioTrack, Trellis and the seed-to-sale category" },
  { id: "mismatches", label: "Five mismatches for a SA grow" },
  { id: "what-to-look-for", label: "What to look for instead" },
  { id: "khulagrow", label: "Where KhulaGrow fits" },
];

export default function Guide() {
  return (
    <>
      <P>
        Search for cannabis cultivation software and the results are overwhelmingly American:
        Metrc, BioTrack, Trellis, and a long tail of platforms built around them. It is a
        reasonable place to start looking, and a poor place to end up — because almost all of
        that software exists to satisfy a regulatory model South Africa does not have.
      </P>

      <H2 id="why-searching">Why South African growers search for these names</H2>
      <P>
        The instinct is sound: a licensed grow needs traceability, and the US market has been
        buying traceability software for a decade. The problem is that the American products
        are shaped by a specific mandate — state-run track-and-trace — rather than by the
        general problem of running a compliant farm.
      </P>

      <H2 id="metrc">Metrc is a government system, not a product you can buy</H2>
      <P>
        Metrc is the clearest case. It is a state track-and-trace system: individual US states
        contract it, and licensees in those states are <em>required</em> to report into it,
        usually with RFID tags on plants and packages. Licensees don&apos;t choose Metrc, and
        the compliance value comes entirely from the state mandate behind it.
      </P>
      <P>
        South Africa has no equivalent central track-and-trace system for cannabis cultivation.
        SAHPRA&apos;s expectation is that you keep complete, contemporaneous, auditable records
        and can produce them — not that you file them into a national database in real time.
        Adopting a system designed for mandatory state reporting gives you the overhead of that
        model without the thing that made it worth carrying.
      </P>

      <H2 id="biotrack-trellis">BioTrack, Trellis and the seed-to-sale category</H2>
      <P>
        BioTrack and Trellis are commercial products rather than government systems, so they
        are at least purchasable. But they are still built for the North American operator:
        dispensary and retail modules, US state compliance reporting, integrations with US
        point-of-sale and payment stacks, pricing in dollars, and support in US business hours.
      </P>
      <P>
        For a South African cultivation-only licence holder, a large share of that product is
        surface area you pay for, learn around, and never use.
      </P>

      <H2 id="mismatches">Five mismatches that matter on a South African farm</H2>
      <H3>1. The compliance model is the wrong one</H3>
      <P>
        US platforms optimise for pushing data into a state system. You need to pull an evidence
        pack out for an inspector — batch genealogy, input registers, witnessed destruction
        records, reconciliation. Those are different jobs, and the second one is often a weak
        export screen in a product built for the first.
      </P>
      <H3>2. Connectivity assumptions</H3>
      <P>
        Retail-oriented software assumes a counter, a desktop and a stable connection. A tunnel
        in Limpopo assumes none of those. If your team cannot log an irrigation or a pest scout
        with no signal and have it sync later, the records simply won&apos;t get captured — and
        uncaptured records are the actual failure mode, not bad software.
      </P>
      <H3>3. Currency, tax and cost reporting</H3>
      <P>
        Cost-per-gram in dollars is not a report you can hand an investor or an accountant here.
        Inputs, labour and yields need to be in rand, with local conventions, without an export
        and a spreadsheet in between.
      </P>
      <H3>4. Terminology and structure</H3>
      <P>
        Rooms, licences, package tags and state-specific plant categories don&apos;t map cleanly
        onto blocks, tunnels and beds — or onto the way a SAHPRA licence describes a site. Every
        mismatch becomes a workaround, and every workaround is a place records go wrong.
      </P>
      <H3>5. Support, data residency and cost</H3>
      <P>
        Dollar pricing on a per-user or per-plant basis scales badly against a rand-denominated
        farm budget, US-hours support does not help at 06:00 SAST, and POPIA makes it worth
        knowing exactly where your data sits and who can reach it.
      </P>

      <Callout>
        None of this makes those platforms bad software. It makes them software for a different
        regulatory market. The question is not which is the best cannabis platform in the world
        — it is which one produces the evidence pack a SAHPRA inspector will ask you for.
      </Callout>

      <H2 id="what-to-look-for">What to look for instead</H2>
      <Checklist
        title="Evaluation checklist for a South African cultivation operation"
        items={[
          "Batch genealogy from seed or clone to inventory lot, with stage history and photo evidence.",
          "Input registers — irrigation, nutrients, pesticides, labour — with costs in rand.",
          "Witnessed waste and destruction records, with method and reason.",
          "Inspection records and compliance deadlines with due-date alerts.",
          "A tamper-evident audit trail: who recorded or changed what, and when.",
          "Genuinely offline field capture that syncs, not just a responsive web page.",
          "Role-based access, including read-only access for an inspector.",
          "One-tap PDF and Excel exports of a complete compliance pack.",
          "Rand pricing, local support hours, and a clear answer on data hosting.",
          "Free data export — no lock-in on records you are legally required to keep.",
        ]}
      />
      <P>
        Score any platform against that list before you look at the demo. Most of the
        international options will pass the first four and fail the rest.
      </P>

      <H2 id="khulagrow">Where KhulaGrow fits</H2>
      <P>
        KhulaGrow was built for that checklist specifically: South African cultivators, SAHPRA
        record-keeping, phones in the field rather than desktops in an office, and rand costs
        throughout. It is cultivation-first — there is no US dispensary module to pay for — and
        the export is the point rather than an afterthought.
      </P>
      <UL
        items={[
          <><strong>Offline-first field capture.</strong> Log irrigation, feeding, pests and labour with no signal; entries queue on the phone and sync automatically.</>,
          <><strong>Seed-to-lot traceability.</strong> Unique batch codes, per-plant tags, stage history and a photo timeline.</>,
          <><strong>Compliance surface.</strong> Inspection records, destruction registers, document vault with expiry warnings, tamper-evident audit trail.</>,
          <><strong>Reports that leave the building.</strong> PDF and Excel compliance packs and investor-ready cultivation portfolios, in one tap.</>,
          <><strong>Whole team on one subscription</strong> — managers, supervisors, workers and inspectors included.</>,
        ]}
      />
      <P>
        If you are still at the licensing stage, start with the{" "}
        <GuideLink slug="sahpra-cultivation-licence-checklist">
          SAHPRA cultivation licence checklist
        </GuideLink>{" "}
        — and if you already hold a licence, the fastest way to test any platform is to ask
        whether it can produce what{" "}
        <GuideLink slug="what-sahpra-inspectors-check">an inspector will actually ask for</GuideLink>.
        You can{" "}
        <AppLink href="/login">try KhulaGrow free</AppLink> and trace your first batch the same
        afternoon.
      </P>
    </>
  );
}
