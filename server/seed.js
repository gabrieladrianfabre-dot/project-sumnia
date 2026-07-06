// Seed content so filtering and KaTeX rendering can be tested end to end.
// String.raw keeps the LaTeX readable (no double-escaped backslashes).

const r = String.raw

const SEED_ITEMS = [
  {
    title: 'Irreducible Fraction',
    branch: 'Math',
    topic: 'Algebra',
    year: 1959,
    source: 'IMO 1959, Problem 1',
    problem: r`Prove that the fraction $\dfrac{21n+4}{14n+3}$ is irreducible for every natural number $n$.`,
    solution: r`Suppose $d$ divides both the numerator and the denominator. Then $d$ divides any integer combination of them:

$$3(14n+3) - 2(21n+4) = 42n + 9 - 42n - 8 = 1.$$

So $d \mid 1$, which forces $d = 1$. Since the greatest common divisor of $21n+4$ and $14n+3$ is $1$ for every natural $n$, the fraction is irreducible. $\blacksquare$`,
  },
  {
    title: 'Nested Radical Limit',
    branch: 'Math',
    topic: 'Algebra',
    year: null,
    source: 'Classic olympiad training problem',
    problem: r`Evaluate the infinite nested radical
$$x = \sqrt{2 + \sqrt{2 + \sqrt{2 + \cdots}}}.$$`,
    solution: r`Assuming the limit exists, the expression under the first radical equals $x$ itself, so

$$x = \sqrt{2 + x} \implies x^2 - x - 2 = 0 \implies (x-2)(x+1) = 0.$$

Since $x > 0$, we get $x = 2$.

To justify convergence: the sequence $a_1 = \sqrt{2}$, $a_{k+1} = \sqrt{2 + a_k}$ is increasing and bounded above by $2$ (induction: if $a_k < 2$ then $a_{k+1} = \sqrt{2+a_k} < \sqrt{4} = 2$), so it converges — and the limit must satisfy the fixed-point equation above.`,
  },
  {
    title: 'Minimum of a Symmetric Sum',
    branch: 'Math',
    topic: 'Algebra',
    year: null,
    source: 'AM–GM classic (appears in many national olympiads)',
    problem: r`Let $a, b, c$ be positive reals. Prove that
$$\frac{a}{b} + \frac{b}{c} + \frac{c}{a} \ge 3,$$
with equality if and only if $a = b = c$.`,
    solution: r`By the AM–GM inequality applied to the three positive numbers $\frac{a}{b}, \frac{b}{c}, \frac{c}{a}$:

$$\frac{\frac{a}{b} + \frac{b}{c} + \frac{c}{a}}{3} \ge \sqrt[3]{\frac{a}{b} \cdot \frac{b}{c} \cdot \frac{c}{a}} = \sqrt[3]{1} = 1.$$

Multiplying by $3$ gives the result. AM–GM is an equality exactly when all terms are equal, i.e. $\frac{a}{b} = \frac{b}{c} = \frac{c}{a}$. Calling this common ratio $t$, multiplying the three gives $t^3 = 1$, so $t = 1$ and hence $a = b = c$.`,
  },
  {
    title: 'Sum of a Telescoping Product',
    branch: 'Math',
    topic: 'Algebra',
    year: 2002,
    source: 'AMC 12 2002 (adapted)',
    problem: r`Compute
$$\sum_{k=1}^{99} \frac{1}{k(k+1)}.$$`,
    solution: r`Use partial fractions: $\dfrac{1}{k(k+1)} = \dfrac{1}{k} - \dfrac{1}{k+1}$. The sum telescopes:

$$\sum_{k=1}^{99} \left( \frac{1}{k} - \frac{1}{k+1} \right) = 1 - \frac{1}{100} = \frac{99}{100}.$$`,
  },
  {
    title: 'Maximum Range of a Projectile',
    branch: 'Physics',
    topic: 'Kinematics',
    year: null,
    source: 'Standard olympiad mechanics (F=ma exam style)',
    problem: r`A projectile is launched from level ground with speed $v_0$ at angle $\theta$ above the horizontal. Ignoring air resistance, find the angle $\theta$ that maximizes the horizontal range, and the maximum range itself.`,
    solution: r`Decompose the motion. Time of flight comes from the vertical motion:

$$t_f = \frac{2 v_0 \sin\theta}{g}.$$

The range is horizontal velocity times flight time:

$$R = v_0 \cos\theta \cdot t_f = \frac{2 v_0^2 \sin\theta\cos\theta}{g} = \frac{v_0^2 \sin 2\theta}{g}.$$

$R$ is maximized when $\sin 2\theta = 1$, i.e. $\theta = 45^\circ$, giving

$$R_{\max} = \frac{v_0^2}{g}.$$`,
  },
  {
    title: 'The Bird Between Two Trains',
    branch: 'Physics',
    topic: 'Kinematics',
    year: null,
    source: 'Classic problem, attributed to the von Neumann anecdote',
    problem: r`Two trains, $60\ \text{km}$ apart, drive toward each other at $30\ \text{km/h}$ each. A bird starts at one train and flies back and forth between them at $60\ \text{km/h}$ until the trains meet. What total distance does the bird fly?`,
    solution: r`Rather than summing the infinite geometric series of legs, find the total time. The trains close at $30 + 30 = 60\ \text{km/h}$, so they meet after

$$t = \frac{60\ \text{km}}{60\ \text{km/h}} = 1\ \text{h}.$$

The bird flies at constant speed for that whole hour, so its total distance is

$$d = 60\ \text{km/h} \times 1\ \text{h} = 60\ \text{km}.$$

(Summing the series gives the same answer — the shortcut is the point of the problem.)`,
  },
  {
    title: 'Total Distance of a Bouncing Ball',
    branch: 'Physics',
    topic: 'Kinematics',
    year: null,
    source: 'Physics olympiad training set',
    problem: r`A ball is dropped from height $h$. Each bounce returns it to a fraction $e^2 h$ of the previous height, where $e$ is the coefficient of restitution ($0 < e < 1$). Find the total distance travelled before the ball comes to rest.`,
    solution: r`The ball falls $h$, then for each subsequent bounce rises and falls $e^2$ times the previous height. With $k = e^2$:

$$D = h + 2kh + 2k^2h + 2k^3h + \cdots = h + 2kh \sum_{n=0}^{\infty} k^n = h + \frac{2kh}{1-k}.$$

Substituting back $k = e^2$:

$$D = h\,\frac{1 + e^2}{1 - e^2}.$$

Check: as $e \to 0$ (no bounce), $D \to h$; as $e \to 1$, $D \to \infty$, as expected.`,
  },
  {
    title: 'Balancing Glucose Combustion',
    branch: 'Chemistry',
    topic: 'Chemical Equations',
    year: null,
    source: 'Chemistry olympiad qualifier (standard)',
    problem: r`Balance the combustion of glucose:
$$\mathrm{C_6H_{12}O_6 + O_2 \longrightarrow CO_2 + H_2O}$$`,
    solution: r`Balance carbon first: $6\,\mathrm{CO_2}$. Then hydrogen: $12$ H atoms give $6\,\mathrm{H_2O}$. Now count oxygen on the right: $6(2) + 6(1) = 18$; glucose supplies $6$, so $\mathrm{O_2}$ must supply $12$, i.e. $6\,\mathrm{O_2}$:

$$\mathrm{C_6H_{12}O_6 + 6\,O_2 \longrightarrow 6\,CO_2 + 6\,H_2O}$$

Final check — C: $6=6$, H: $12=12$, O: $6+12=18=12+6$. Balanced.`,
  },
  {
    title: 'Permanganate–Chloride Redox',
    branch: 'Chemistry',
    topic: 'Chemical Equations',
    year: null,
    source: 'IChO training problem (classic redox)',
    problem: r`Balance the redox reaction in acidic solution:
$$\mathrm{KMnO_4 + HCl \longrightarrow KCl + MnCl_2 + Cl_2 + H_2O}$$`,
    solution: r`Use half-reactions. Reduction: $\mathrm{MnO_4^- + 8H^+ + 5e^- \to Mn^{2+} + 4H_2O}$. Oxidation: $\mathrm{2Cl^- \to Cl_2 + 2e^-}$.

Multiply to match electrons (10): $2 \times$ reduction, $5 \times$ oxidation, then reassemble with spectator ions:

$$\mathrm{2\,KMnO_4 + 16\,HCl \longrightarrow 2\,KCl + 2\,MnCl_2 + 5\,Cl_2 + 8\,H_2O}$$

Check — K: $2=2$; Mn: $2=2$; Cl: $16 = 2 + 4 + 10$; H: $16 = 16$; O: $8 = 8$. Balanced.`,
  },
  {
    title: 'Limiting Reagent in Ammonia Synthesis',
    branch: 'Chemistry',
    topic: 'Chemical Equations',
    year: 2019,
    source: 'National chemistry olympiad, stoichiometry round (adapted)',
    problem: r`For the Haber process $\mathrm{N_2 + 3\,H_2 \longrightarrow 2\,NH_3}$, a reactor is charged with $56\ \mathrm{g}$ of $\mathrm{N_2}$ and $10\ \mathrm{g}$ of $\mathrm{H_2}$. Which reagent is limiting, and what mass of ammonia can form?`,
    solution: r`Convert to moles: $n_{\mathrm{N_2}} = \frac{56}{28} = 2\ \mathrm{mol}$, $n_{\mathrm{H_2}} = \frac{10}{2} = 5\ \mathrm{mol}$.

The stoichiometry needs $3$ mol $\mathrm{H_2}$ per mol $\mathrm{N_2}$, so $2$ mol $\mathrm{N_2}$ would need $6$ mol $\mathrm{H_2}$ — but only $5$ mol is available. **Hydrogen is limiting.**

From $5$ mol $\mathrm{H_2}$: $n_{\mathrm{NH_3}} = \frac{2}{3} \times 5 = \frac{10}{3}\ \mathrm{mol}$, so

$$m_{\mathrm{NH_3}} = \frac{10}{3} \times 17 \approx 56.7\ \mathrm{g}.$$`,
  },
]

export function seedIfEmpty(store) {
  if (store.listItems().length > 0) return
  for (const item of SEED_ITEMS) store.createItem({ ...item, repoId: 'vault' })
  console.log(`Seeded ${SEED_ITEMS.length} items`)
}
