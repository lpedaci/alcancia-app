<p align="center">
  <img src="public/favicon.svg" width="72" height="72" alt="Alcancía logo: a white piggy bank on an indigo square with rounded corners">
</p>

<h1 align="center">Alcancía</h1>

<p align="center">
  A personal finance simulator where people learn by using a virtual wallet with fictitious money,<br>
  for organizations, classrooms and products.
</p>

<p align="center">
  <a href="https://github.com/lpedaci/alcancia-app/actions/workflows/deploy.yml"><img alt="CI and deploy status" src="https://img.shields.io/github/actions/workflow/status/lpedaci/alcancia-app/deploy.yml?branch=main&label=CI"></a>
  <a href="https://lpedaci.github.io/alcancia-app/"><img alt="Deployed on GitHub Pages" src="https://img.shields.io/github/deployments/lpedaci/alcancia-app/github-pages?label=GitHub%20Pages"></a>
  <img alt="React version" src="https://img.shields.io/github/package-json/dependency-version/lpedaci/alcancia-app/react">
  <img alt="TypeScript version" src="https://img.shields.io/github/package-json/dependency-version/lpedaci/alcancia-app/dev/typescript">
  <img alt="Vite version" src="https://img.shields.io/github/package-json/dependency-version/lpedaci/alcancia-app/dev/vite">
  <img alt="Tailwind CSS version" src="https://img.shields.io/github/package-json/dependency-version/lpedaci/alcancia-app/dev/tailwindcss">
  <img alt="Node 22 or later" src="https://img.shields.io/badge/node-%E2%89%A5%2022-informational">
  <img alt="Accessibility target: WCAG 2.2 AA" src="https://img.shields.io/badge/target-WCAG%202.2%20AA-informational">
</p>

<p align="center">
  <a href="https://lpedaci.github.io/alcancia-app/"><strong>Demo</strong></a> ·
  <a href="https://lpedaci.github.io/alcancia-app/#/login?demo=mariana"><strong>Sign in as Mariana</strong></a> ·
  <a href="docs/README.md">Documentation (Spanish)</a> ·
  <a href="CLAUDE.md">Specification (Spanish)</a> ·
  <a href="README.md">Español</a>
</p>

> [!IMPORTANT]
> **Educational content. Not financial advice or an investment recommendation.** All money in the app is fictitious, and the people, entities and merchants in the demo are made up.

> [!NOTE]
> The app interface is in Spanish (Argentina). The landing page is also available in English; the rest of the app will be translated in phase B.

<p align="center">
  <img src="docs/readme/wallet-desktop-and-phone.webp" width="900" alt="Mariana's wallet on a computer and on a phone. On the computer: the side menu, the suggested mission 'El préstamo tentador', the greeting with level 6 and the next unlock, the available balance of $ 1.372.112,09 with its purchasing power, and the pockets. On the phone: the same screen in one column, with the bottom navigation bar.">
</p>

## What it is and what problem it solves

Many people learn about money after making mistakes with real money: paying the card minimum, taking a loan because the installment looks small, or leaving their salary idle while inflation eats it. Alcancía lets people make those mistakes earlier and for free. Learners do not enter a course: they enter their wallet. They get a practice salary, pay, budget, save, put their balance to work, decide about credit and invest. Each action teaches something at the moment it happens.

The same wallet works in three contexts: an **organization** offering it to its people as a benefit and training, a **higher education institution** for students aged 18 or over, and an **existing product**, such as a wallet or finance app, that embeds it for its users.

What sets it apart: **simulated time** (advance a day, a week or a month to see yields, installments and inflation); sections **unlock through financial behavior**, not clicks (Invest opens with an emergency fund and no expensive debt); decisions **leave a mark** on the wallet (a loan shows up in your debts and blocks investing until it is paid); the content is **Argentine** and grounded in official sources (BCRA, CNV, INDEC); and the organization **never sees anyone's finances**, only aggregated learning progress.

## How people learn

Learning starts from action. The person does something in the wallet, gets a short explanation right when they need it, can jump to the exact part of the guide that explains it, and returns to the same screen without losing anything. Then they practice it in a mission with consequences and prove it in the level challenge, which unlocks the next section.

```mermaid
flowchart LR
  accTitle: Alcancía learning cycle
  accDescr: An action in the wallet triggers a just-in-time card. From the card, the person goes to the exact part of the guide and returns to the original screen. Then come the mission with consequences, the level challenge and the unlock of the next section, which brings new actions.
  A[Action in the wallet] --> B[Just-in-time card]
  B --> C["See it in the guide<br/>(exact part)"]
  C --> D[Back to the screen<br/>with its state intact]
  D --> E[Mission with consequences]
  E --> F[Level challenge]
  F --> G[Unlock]
  G -->|new actions| A
```

The cycle follows Kolb's (1984) experiential learning: concrete experience (the action), reflective observation (the card and its question), conceptualization (the guide) and active experimentation (the mission). The card appears at the moment of need (Gottfredson & Mosher, 2011), which suits adults with little time (Knowles et al., 2015).

| Level | Section | What people learn | Opens with |
| --- | --- | --- | --- |
| 0 | Open your account | Welcome, diagnostic and basic security | First sign-in |
| 1 | Account | Payslip; your brain and money | Finishing level 0 |
| 2 | Pay | Wallets and fintech, transfers and QR; scams | Mission 1 and the level 1 challenge |
| 3 | Budget | Budget and small recurring expenses | 10 categorized movements and the level 2 challenge |
| 4 | Pockets and goals | Emergency fund | A month closed in the green and the level 3 challenge |
| 5 | Card and loans | Debt order, credit card and total financial cost, getting out of debt, installments or cash | The level 4 challenge |
| 6 | Yield | Inflation, rates (nominal, effective, real), term deposits, inflation-indexed deposits and money market funds | Emergency fund created and the level 5 challenge |
| 7 | Invest | Saving vs. investing, investor profile and broker, capital markets, CEDEARs | **Four conditions:** an emergency fund of at least 3 months of expenses, no high-rate debt, the level 6 challenge and the investor profile test |

There are nine assessment types, each with feedback per option, including a **case with decisions** where each choice leads to a consequence. Impact is measured with Kirkpatrick levels 1 to 3.

## Role walkthroughs

<table>
  <tr>
    <td width="50%" valign="top">
      <img src="docs/readme/role-participant.webp" alt="Diego's home at level 2, Pay: the active mission, the available balance of $ 459.477,09 with its purchasing power, quick actions and the next unlock, Budget.">
      <h3>Participant</h3>
      <p>Uses the wallet. Diego starts at level 2 on his phone; Mariana is at level 6.</p>
      <p><a href="https://lpedaci.github.io/alcancia-app/#/login?demo=diego">Sign in as Diego</a> · <a href="https://lpedaci.github.io/alcancia-app/#/login?demo=mariana">Sign in as Mariana</a></p>
    </td>
    <td width="50%" valign="top">
      <img src="docs/readme/role-tutor.webp" alt="Kevin's tutor dashboard: 80 % participation, modules completed, challenge average and weekly challenges met, and a 'to attend' list with deadlines and people who have not started a module.">
      <h3>Tutor</h3>
      <p>Supports cohorts with learning progress, most-missed questions and inquiries. Never sees amounts.</p>
      <p><a href="https://lpedaci.github.io/alcancia-app/#/login?demo=kevin">Sign in as Kevin</a></p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <img src="docs/readme/role-admin.webp" alt="Julieta's L&D admin dashboard: invited and active people, diagnostics completed and modules read, and a review list noting that two cohorts have fewer than 5 people so their figures are hidden.">
      <h3>L&D and Benefits admin</h3>
      <p>Sets up the program, imports people from CSV with row-by-row validation and follows adoption in aggregate.</p>
      <p><a href="https://lpedaci.github.io/alcancia-app/#/login?demo=julieta">Sign in as Julieta</a></p>
    </td>
    <td width="50%" valign="top">
      <img src="docs/readme/role-sponsor.webp" alt="Ricardo's impact report: 80 % active, satisfaction 4.6 out of 5, 17 points of improvement and 78 % with a budget, with reaction and behavior details. Aggregated figures only.">
      <h3>Sponsor</h3>
      <p>Reads the read-only, exportable impact report, with no individual data.</p>
      <p><a href="https://lpedaci.github.io/alcancia-app/#/login?demo=ricardo">Sign in as Ricardo</a></p>
    </td>
  </tr>
</table>

## Three contexts and the integrated mode

The same wallet works for **teams, classrooms and products**: an organization offers it to its people (Andina Servicios S.A. in the demo), a higher-education institution to its students aged 18 or over (Instituto Superior Ceibo), or a finance app integrates it for its users (Hornero). The wallet, levels, missions and privacy stay the same; role names, how people come in and which panels exist change. In the demo, "View as" asks for the context first and then the person, and each panel only sees its own organization's data.

The **integrated mode** is shown with **Hornero**, a fictitious wallet made for the demo, with its own brand and the label "Fictitious demo brand" (it does not refer to any real brand). Hornero shows the person's savings through its brand idea: a nest that grows little by little and a nest that holds. Alcancía opens inside it with no second sign-in, and Hornero stays in the menu to go back. The partner only gets progress notices, never amounts.

<table>
  <tr>
    <td width="50%"><img src="docs/readme/hornero-home.webp" alt="Home of Hornero, a fictitious wallet with its own sunset-colored brand: the 'Fictitious demo brand' label, the 'Your nest grows' and 'A nest that holds' cards, and the 'Open Alcancía' button."></td>
    <td width="50%"><img src="docs/readme/hornero-wallet.webp" alt="Mariana's wallet opened inside Hornero: the side menu shows 'Back to Hornero' with the 'Fictitious demo brand' label, above 'Your progress', and the top bar keeps the fictitious-money notice."></td>
  </tr>
</table>

## Accessibility

The target is **WCAG 2.2 AA**. Checked automatically on every change: no axe errors on 71 screens at 375 and 1280 px, no horizontal overflow at 6 widths (320 to 1440 px), one `h1` per screen, AA contrast for every color token pair, and "Why it matters" visible even with the companion muted. **Not verified yet:** a full screen reader walkthrough and a Lighthouse audit. Until then, the app does not claim conformance; it is the target.

## Sources, credits and authorship

Content is grounded in official Argentine sources: BCRA, CNV, INDEC, BYMA, Caja de Valores and argentina.gob.ar. **Rates and inflation in the scenario are example values**, not current ones.

Design and development: **Lourdes Pedaci, Experience Designer (Learning and UX/UI)**. Finance content is based on material by Lic. Kevin Giampieri for the workshop "Del aula al primer trabajo". Demo profile photos: "Designed by Magnific" ([magnific.com](https://www.magnific.com/)).

**License:** all rights reserved. The finance content belongs to its authors.

### References

Gottfredson, C., & Mosher, B. (2011). *Innovative performance support: Strategies and practices for learning in the workflow*. McGraw-Hill.

Kirkpatrick, J. D., & Kirkpatrick, W. K. (2016). *Kirkpatrick's four levels of training evaluation*. ATD Press.

Knowles, M. S., Holton, E. F., III, & Swanson, R. A. (2015). *The adult learner: The definitive classic in adult education and human resource development* (8th ed.). Routledge.

Kolb, D. A. (1984). *Experiential learning: Experience as the source of learning and development*. Prentice Hall.

World Wide Web Consortium. (2023). *Web Content Accessibility Guidelines (WCAG) 2.2*. https://www.w3.org/TR/WCAG22/
