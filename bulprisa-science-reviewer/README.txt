BulPriSA Science Speed-Round Reviewer (Grades 7-10)
===================================================

FILES
  main.tex         master file (compile this one)
  macros.tex       \qa, \verify, \confusion, \mnemonic and layout macros
  g7.tex ... g10.tex   one file per grade, organised Term > Topic
  rapidfire.tex    mixed-grade scenario drill, grouped Easy / Average / Difficult
  cheatsheets.tex  compact tables (SI units, periodic table, EM spectrum, Earth, ...)
  sources.tex      DepEd curriculum basis per grade + fact-check URLs

COMPILE
  Overleaf: New Project > Upload Project > upload all .tex files, set main.tex
            as the main document, compiler pdfLaTeX (default). Overleaf runs
            latexmk, so the "Items to verify" list fills in automatically.
  Local:    latexmk -pdf main.tex
            (or run pdflatex main.tex TWICE; the verify list and table of
            contents need the second run)
  Packages: geometry, multicol, enumitem, xcolor, tcolorbox, booktabs, array,
            amsmath, siunitx, mhchem, fancyhdr, hyperref, lmodern, microtype
            (all in TeX Live / MiKTeX full installs and on Overleaf).

HOW TO USE
  1. Card format:  Q: cue -> A: answer, with a tag: E easy, A average, D difficult.
     Cover the right half of each line, say the answer aloud, uncover, check.
  2. Orange "Common confusions" boxes are the likeliest multiple-choice
     distractors. Learn the one-line distinguisher, not just the terms.
  3. Suggested cycle: one grade per session -> Rapid Fire with a 20 s timer
     -> Cheat Sheets the night before.
  4. Anything tagged [VERIFY] is collected on the last page with its page
     number. Confirm those with your coach before the contest.
  5. Card counts per part are printed at the end of each grade section.

ASSUMPTIONS (from the user)
  Format: multiple choice (conceptual + application), ~20 s per question,
  all grades G7-G10 mixed. Grade 10 = MATATAG BOW core + K-12 MELC appendix.
