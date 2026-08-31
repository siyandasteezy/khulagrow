import { P, H2, H3, UL, OL, Checklist, Callout, Verify, GuideLink, AppLink } from "@/components/Article";

export const SECTIONS = [
  { id: "who-needs-one", label: "Who needs a cultivation licence" },
  { id: "before-you-apply", label: "Before you apply" },
  { id: "site", label: "Site & facility" },
  { id: "security", label: "Security" },
  { id: "people", label: "People & responsibility" },
  { id: "sops", label: "SOPs and written procedures" },
  { id: "records", label: "Records you must keep" },
  { id: "application", label: "Assembling the application" },
  { id: "after", label: "After the licence is granted" },
  { id: "mistakes", label: "Where applications come unstuck" },
];

export default function Guide() {
  return (
    <>
      <P>
        Most cultivation licence applications in South Africa don&apos;t fail on the science.
        They fail on evidence. The applicant can grow the plant, but can&apos;t yet show a
        regulator a controlled site, a named responsible person, written procedures, and a
        record-keeping system that would still make sense to a stranger two years from now.
      </P>
      <P>
        This checklist is organised the way a grow actually gets ready — site first, then
        security, then people, then paper — rather than the order the forms happen to be in.
        Work down it, and by the time you sit down to complete the application, most of the
        answers already exist.
      </P>

      <Callout>
        This guide is written for growers preparing an application. It is not legal advice, and
        it does not replace the current application pack and guidelines published by SAHPRA.
        Confirm every form, fee and timeline against the regulator&apos;s own current documents
        before you submit.
      </Callout>

      <H2 id="who-needs-one">Who needs a cultivation licence</H2>
      <P>
        Cannabis in South Africa sits under more than one regime, and which one applies to you
        depends on what you are growing and what you intend to do with it. Cultivation of
        cannabis for medicinal purposes falls to the South African Health Products Regulatory
        Authority (SAHPRA). Low-THC hemp for industrial and agricultural use is handled
        separately, under the Department of Agriculture, Land Reform and Rural Development.
      </P>
      <P>
        Choosing wrong is expensive — different application, different fee, different facility
        expectations, different records. If you are not certain which side of the line your
        crop sits on, read{" "}
        <GuideLink slug="hemp-permit-vs-medicinal-licence">
          hemp permit vs medicinal cannabis licence
        </GuideLink>{" "}
        before going any further with this checklist.
      </P>

      <H2 id="before-you-apply">Before you apply: the four things that gate everything else</H2>
      <OL
        items={[
          <>
            <strong>A specific site.</strong> Not a region, not &ldquo;a farm near
            Bela-Bela&rdquo; — an identified property with an address, GPS coordinates, and a
            legal right to use it (title deed, lease, or written landowner consent).
          </>,
          <>
            <strong>A named responsible person.</strong> A real individual, with relevant
            qualifications or experience, who carries accountability for the operation.
          </>,
          <>
            <strong>Money for the whole runway.</strong> Application fees, facility build,
            security installation, and the months between submission and a granted licence
            during which you are spending and not selling.
          </>,
          <>
            <strong>An off-take plan.</strong> A licence to cultivate is not a licence to sell
            to anyone you like. Know who is legally allowed to receive your product before you
            plant.
          </>,
        ]}
      />

      <H2 id="site">Site &amp; facility</H2>
      <P>
        The site section of an application is where a regulator forms their first impression of
        whether you are serious. Photographs, a site plan and a facility layout do more work
        here than prose.
      </P>
      <Checklist
        title="Site evidence"
        items={[
          "Physical address and GPS coordinates of every cultivation area on the property.",
          "Proof of your right to occupy — title deed, signed lease, or landowner consent letter.",
          "A site plan showing boundaries, access points, buildings and the cultivation footprint.",
          "A facility layout showing each growing area, storage, drying/curing, waste and quarantine zones.",
          "Zoning or municipal use confirmation where the local authority requires it.",
          "Water source and, where required, a water use authorisation.",
          "Electricity supply and backup — a controlled environment that loses power loses a crop.",
          "Photographs of the actual site as it stands, dated.",
        ]}
      />
      <Callout>
        Draw the layout so that a stranger can trace a plant&apos;s path through it: propagation
        → vegetative → flowering → harvest → drying → storage → dispatch, with waste and
        quarantine branching off. If your layout can&apos;t be read that way, the traceability
        story will be hard to tell later too.
      </Callout>

      <H2 id="security">Security</H2>
      <P>
        Security expectations scale with what you are growing. A high-THC medicinal facility is
        held to a materially higher standard than a low-THC hemp field, and the regulator will
        want to see that controls are physical and enforced, not aspirational.
      </P>
      <Checklist
        title="Security controls to have in place"
        items={[
          "Perimeter control — fencing, gates, and a single controlled point of entry.",
          "Access control into the cultivation and storage areas, restricted to authorised people.",
          "A visitor register: who entered, when, escorted by whom, and why.",
          "CCTV covering entry points, cultivation areas, storage and destruction points.",
          <>Footage retained for the required period — <Verify>confirm the current minimum retention period</Verify> against SAHPRA&apos;s guideline.</>,
          "Intrusion detection and a monitored alarm response arrangement.",
          "Secure, lockable storage for harvested material, separate from general farm storage.",
          "A written procedure for theft, diversion or loss — including who is notified and how fast.",
        ]}
      />

      <H2 id="people">People &amp; responsibility</H2>
      <P>
        Regulators licence organisations, but they hold people accountable. Your application
        needs to make clear who carries which responsibility, and to show that the people
        touching the crop are competent and vetted.
      </P>
      <UL
        items={[
          <><strong>Responsible person.</strong> CV, qualifications, and a written statement of what they are accountable for.</>,
          <><strong>Organogram.</strong> Who reports to whom, and who may authorise what — particularly destruction and dispatch.</>,
          <><strong>Screening.</strong> Background and criminal record checks for staff with access to the crop and storage.</>,
          <><strong>Training records.</strong> Evidence that each staff member has been trained on the SOPs relevant to their role, signed and dated.</>,
          <><strong>Deputies.</strong> Named alternates for the responsible person — inspections don&apos;t wait for someone to come back from leave.</>,
        ]}
      />

      <H2 id="sops">SOPs and written procedures</H2>
      <P>
        Standard operating procedures are the single largest block of work in an application,
        and the one applicants most often underestimate. Each SOP should say what is done, who
        does it, how it is recorded, and what happens when it goes wrong.
      </P>
      <H3>The SOP set most cultivation applications need</H3>
      <UL
        items={[
          "Propagation and cloning — sourcing, mother plant management, batch creation.",
          "Cultivation — irrigation, feeding, integrated pest management, environmental control.",
          "Pesticide and agrochemical use — what is permitted, application, withholding periods.",
          "Harvesting, drying and curing.",
          "Waste handling and destruction — method, witnessing, recording.",
          "Storage and stock control, including reconciliation.",
          "Security, access control and incident response.",
          "Sanitation, hygiene and pest control in buildings.",
          "Equipment calibration and maintenance.",
          "Record-keeping, data integrity and document control.",
          "Recall or product withdrawal.",
          "Deviation, incident and corrective action (CAPA) handling.",
          "Staff training and competency assessment.",
        ]}
      />
      <Callout>
        Version-control every SOP: a document number, a version, an effective date, and an
        approver. An inspector who finds two versions of the same procedure in circulation will
        assume — reasonably — that nobody is following either.
      </Callout>

      <H2 id="records">Records you must keep</H2>
      <P>
        This is the part that outlives the application. A licence is granted on the strength of
        a plan; it is kept on the strength of records. The practical test is whether you can
        take any unit of harvested material and walk it backwards to the seed or clone it came
        from, with dates, people and inputs attached at every step.
      </P>
      <Checklist
        title="The traceability spine"
        items={[
          "Every batch has a unique code, a source (seed lot or mother plant), a strain and a start date.",
          "Plant counts at every stage, with movements between areas recorded.",
          "Every input applied — water, nutrient, pesticide, fungicide — with product, rate, date and operator.",
          "Environmental conditions for controlled areas.",
          "Every plant destroyed: how many, why, by what method, witnessed by whom.",
          "Harvest weights, wet and dry, tied to the originating batch.",
          "Inventory lots with storage location, status, and every movement in or out.",
          "Stock reconciliation at a fixed interval, with variances explained.",
          "An audit trail showing who recorded or changed each entry, and when.",
        ]}
      />
      <P>
        Paper does satisfy this in principle. In practice it fails at the reconciliation step —
        the moment someone has to add up six months of notebooks under time pressure during an
        inspection. This is precisely the job{" "}
        <AppLink href="/#features">KhulaGrow</AppLink> was built for: batch codes, input logs,
        destruction records and a tamper-evident audit trail captured in the tunnel on a phone,
        and exported as a compliance pack in one tap.
      </P>

      <H2 id="application">Assembling the application</H2>
      <OL
        items={[
          <>Download the current application pack and guideline directly from SAHPRA — <Verify>confirm the current form reference and version</Verify> rather than reusing a copy someone emailed you.</>,
          <>Confirm the current application fee and payment method — <Verify>fees are revised periodically; check the current schedule</Verify>.</>,
          <>Build an evidence index: one numbered list mapping each requirement to the document that answers it. Attach it as the first page.</>,
          <>Have the responsible person review the full pack before submission, not just their own section.</>,
          <>Keep a complete copy of exactly what you submitted, with the submission date and any reference number.</>,
          <>Expect questions. Nominate one person to own the correspondence so nothing is answered twice, differently.</>,
        ]}
      />
      <Callout>
        Budget realistically for the wait. Between submission, queries, a site inspection and a
        decision, this is a matter of many months rather than weeks —{" "}
        <Verify>confirm current turnaround expectations</Verify> before you commit to a planting
        schedule or an investor timeline.
      </Callout>

      <H2 id="after">After the licence is granted</H2>
      <UL
        items={[
          "Diarise the licence expiry and start the renewal well before it — a lapsed licence stops the operation.",
          "Log any material change to the site, the responsible person or the scope, and notify the regulator where required.",
          "Keep running the records from day one. A licence granted on a clean plan and followed by six months of gaps is worse than no records at all.",
          "Run an internal mock inspection at least annually. It is far cheaper to find your own gaps.",
          <>Know what an inspector will actually look at — see <GuideLink slug="what-sahpra-inspectors-check">what SAHPRA inspectors actually check</GuideLink>.</>,
        ]}
      />

      <H2 id="mistakes">Where applications come unstuck</H2>
      <UL
        items={[
          <><strong>Generic SOPs.</strong> Templates bought online, still describing someone else&apos;s facility. Reviewers recognise them instantly.</>,
          <><strong>A site that only exists on paper.</strong> Applying before the facility is built, then failing the inspection that follows.</>,
          <><strong>Security designed for the budget, not the risk.</strong> Cameras that don&apos;t cover the destruction point; a gate that stands open all day.</>,
          <><strong>No named accountability.</strong> A responsible person who is a consultant on a retainer and has never been on site.</>,
          <><strong>Record-keeping deferred.</strong> &ldquo;We&apos;ll set that up once we&apos;re licensed&rdquo; — the single most common and most expensive assumption in the sector.</>,
        ]}
      />
      <P>
        If you are working with a licence consultant, this checklist is still worth walking
        yourself: the parts they cannot do for you — the site, the people, the daily records —
        are the parts that determine whether the licence survives its first inspection.
      </P>
    </>
  );
}
