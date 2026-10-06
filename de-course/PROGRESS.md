# PROGRESS

## Status

| Phase | State |
|---|---|
| Phase 0 — toolchain | Done. TeX Live 2023 (pdfTeX 1.40.25), latexmk 4.83, biber 2.19, pgfplots 1.18.1; Python 3.11 with SymPy 1.14, NumPy 2.4, SciPy 1.17, Matplotlib 3.11. |
| Phase 1 — scaffold | Done. Stub compiles; `make check` clean. Smoke test of every environment, macro, cross-reference, citation, and a pgfplots slope field passed with zero warnings. |
| Phase 2 — Ch 0–8 | Done (student asked for Ch 0 through the end of Part II in one go). Each chapter compiled with `make check` clean; every example, problem, and figure verified privately with SymPy/SciPy in the scratchpad (not in the repo). 104-page PDF. |
| **Next** | Ch 9 — Structure theory of linear equations (waiting for `next`). |

## Chapters

| Ch | Title | Status | Notes |
|---|---|---|---|
| 0 | Prerequisites check | done, verified | partial fractions proved via Bézout; Euler from series; diagonalization |
| 1 | What a differential equation is | done, verified | three notations; solutions need intervals; Clairaut envelope |
| 2 | Modeling | done, verified | one lemma + shift solves all; 2 VERIFY |
| 3 | Separable equations | done, verified | rigorous separation theorem; Lipschitz zeros never reached |
| 4 | Linear first-order, integrating factor | done, verified | global existence; superposition; transients |
| 5 | Exact equations | done, verified | exactness test on rectangles; angle-form counterexample |
| 6 | Substitution methods | done, verified | substitution principle; Bernoulli n=1/2 non-uniqueness; Riccati |
| 7 | Autonomous equations | done, verified | phase-line theorems proved; harvesting saddle-node; 2 Putnam |
| 8 | Existence and uniqueness | done, verified | Picard–Lindelöf (2 proofs), Gronwall, blow-up alternative |
| 9 | Structure theory of linear equations | not started | |
| 10 | Constant coefficients | not started | |
| 11 | Nonhomogeneous equations | not started | |
| 12 | Cauchy–Euler equations | not started | |
| 13 | Oscillations | not started | |
| 14 | Laplace transform | not started | |
| 15 | Power series at ordinary points | not started | |
| 16 | Frobenius method | not started | |
| 17 | Bessel and Legendre | not started | |
| 18 | Linear systems | not started | |
| 19 | Nonhomogeneous systems | not started | |
| 20 | Nonlinear systems | not started | |
| 21 | Limit cycles, Poincaré–Bendixson | not started | |
| 22 | Bifurcations and chaos | not started | |
| 23 | One-step numerical methods | not started | |
| 24 | Stability and stiffness | not started | |
| 25 | PDE classification, Fourier series | not started | |
| 26 | Separation of variables, Sturm–Liouville | not started | |
| 27 | Characteristics, Burgers | not started | |
| 28 | Competition problems | not started | |

## Open `% VERIFY` items

Citation details I could not confirm (network access to the books was blocked;
chapter-level citations were confirmed by search where noted in the commit log):

- Rudin, 3rd ed.: theorem numbers 9.28 (implicit function thm), 3.50 (Mertens),
  9.35–9.36 (determinants), 9.41–9.42 (mixed partials; differentiation under the
  integral), 7.10/7.12/7.15 (M-test; uniform limits; completeness of C(X)).
- Tenenbaum & Pollard: scope of Ch. 1; titles of Lessons 7, 8, 10.
  (Lessons 9, 11, 62 were confirmed.)
- Simmons, 2nd ed.: section numbers for orthogonal trajectories and falling
  bodies (Ch. 13 §§69–70 were confirmed).
- Teschl: §1.3 title; §2.7 title (Peano); printed numbering of Lemmas 2.5/2.7
  (Thm 2.2 = Picard–Lindelöf was confirmed).
- Coddington & Levinson Ch. 1 contains Peano's theorem.
- Arnold Ch. 4 title "Proofs of the Main Theorems".
- Strogatz §4.3 covers ghosts/bottlenecks.
- Boyce & DiPrima 10e: location of homogeneous/Bernoulli/Riccati exercises.
- Attribution of the snowplow problem to R. P. Agnew (1942).

## Decisions log

- PDE notation: subscript partials allowed as a fourth notation in Ch 25–27
  only, introduced with conversions in Ch 25 (see CLAUDE.md rule 1).
- Systems (Ch 18–22): Newton dot, `\dot{\mathbf{x}} = A\mathbf{x}`;
  subscripts there are components, never derivatives.

## Student weak spots

(Only mistakes the student has actually made in submitted work. Empty until
the first review.)
