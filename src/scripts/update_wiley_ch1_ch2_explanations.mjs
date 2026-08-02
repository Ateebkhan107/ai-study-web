import process from "node:process";
import fs from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createClient } = require("@supabase/supabase-js");
process.loadEnvFile(".env.local");

const explanations = {
  1: [
    "Put $t=\\sqrt{x}\\geq0$. For $t<3$, the equation becomes $t^2-8t+12=0$, giving $t=2$. For $t\\geq3$, it becomes $t^2-4t=0$, giving $t=4$. Hence $x=4,16$, so the set has two elements.",
    "The equations $x^2=9$ and $2x=4$ require $x=\\pm3$ and $x=2$ simultaneously, which is impossible. Hence option B is the empty set.",
    "There are $2^{100}-1$ non-empty subsets. A product is odd only when every selected element is one of the 50 odd numbers, giving $2^{50}-1$ odd-product subsets. Therefore the required number is $2^{100}-2^{50}=2^{50}(2^{50}-1)$.",
    "$2^k=1$ requires $k=0$, so $A=\\{-2,2,3\\}$ and $|A|=3$. Also $-3<2x-1<9$ gives $B=\\{0,1,2,3,4\\}$, so $|B|=5$. Thus $|A\\times B|=15$ and it has $2^{15}$ subsets.",
    "$|A\\times B|=4\\cdot2=8$. The number of subsets with at least three elements is $2^8-\\binom80-\\binom81-\\binom82=256-1-8-28=219$.",
    "The statement says that there exists a rational $x\\in S$ with $x>0$. Its negation is that every rational $x\\in S$ satisfies $x\\leq0$.",
    "A set containing three elements has $2^3=8$ subsets.",
    "$P(\\varnothing)=\\{\\varnothing\\}$ has one element. Therefore its power set $P(P(\\varnothing))$ has $2^1=2$ elements.",
    "For each element of $X$, there are three allowed choices: it belongs only to $Y$, only to $Z$, or to neither. It cannot belong to both because $Y\\cap Z=\\varnothing$. Hence there are $3^5$ ordered pairs.",
    "$P(A\\cup B)=P(A\\cap B)$ forces the symmetric difference to have probability zero, so $A$ and $B$ are equal almost surely. This does not imply $P(A)+P(B)=1$, making option D incorrect.",
    "Rearranging the defining equations and using the sum-to-product identities gives the same solution set for $P$ and $Q$. Hence $P=Q$.",
    "The inequalities defining $A$ give $4<a<6$ and $4<b<6$. Substitution in the ellipse inequality defining $B$ shows every such point lies in $B$. Thus $A\\subset B$.",
    "By inclusion-exclusion, the count divisible by at least one of $2,3,5$ is $70+46+28-23-14-9+4=102$. Therefore $140-102=38$ students chose none.",
    "From $\\varnothing\\neq A\\cap B\\subseteq C$, options A–C follow from standard set identities. The condition $(A-C)\\subseteq B$ does not force every element of $A\\cap C$ to be in $B$, so option D is not always true.",
    "$A=\\{4,5,6\\}$ and $B=\\{1,2,3,4\\}$ for a die. Their union is the entire sample space, so $P(A\\cup B)=1$.",
    "Intersect $A\\cup B=A\\cup C$ with the complement of $A$ to obtain $B-A=C-A$. Intersect $A\\cap B=A\\cap C$ with $A$ to obtain the equal parts inside $A$. Therefore $B=C$.",
    "$P(A\\cup B)=35\\%$ because $65\\%$ own neither. Hence $P(A\\cap B)=25\\%+15\\%-35\\%=5\\%$. Since $5\\%$ equals 2,000 families, the town has 40,000 families. All three statements are correct.",
    "Removing $A\\cap B$ from $A\\cup B$ leaves the elements belonging to exactly one set: $(A-B)\\cup(B-A)$.",
    "$|X\\cup Y|=|X|+|Y|-|X\\cap Y|$. Thus $60=40+|Y|-10$, so $|Y|=30$.",
    "Only-$A$ readers are $17\\%$ and only-$B$ readers are $12\\%$. The advertisement percentage is $0.30(17)+0.40(12)+0.50(8)=5.1+4.8+4=13.9\\%$.",
    "Because the triple intersection is empty, summing the three symmetric-difference sizes counts every element of $A\\cup B\\cup C$ exactly twice. Hence $2|A\\cup B\\cup C|=600$, giving $300$.",
    "The overlap can contain all five elements of the smaller set. Therefore the minimum union size is $5+7-5=7$.",
    "The sum of the three pairwise intersections is $100+150+80=330$. Members speaking all three are counted three times, so the number speaking exactly two is $330-3(50)=180$.",
    "As in the preceding symmetric-difference identity, the three given sizes total twice the union because the triple intersection is empty. Thus $2|A\\cup B\\cup C|=300$, so the answer is $150$.",
    "At an intersection, $1/x=-x$, so $x^2=-1$. This has no real solution; hence $A\\cap B=\\varnothing$ and $n(A\\cap B)=0$.",
  ],
  2: [
    "The pair $(2,3)$ belongs to $R$, but $(3,2)$ does not. Hence $R$ is not symmetric.",
    "$T$ is reflexive, symmetric and transitive because two real numbers are related exactly when their difference is an integer. The relation $S$ is not even reflexive, since $(x,x)$ does not satisfy $y=x+1$. Thus only $T$ is an equivalence relation.",
    "Statement 1 is true because integer differences are preserved under reversal and addition. Statement 2 is false: for $y\\neq0$, $0$ is related to $y$, but $y$ is not related back to $0$. Hence option A is correct.",
    "$A=\\{-2,-1,0,1,2\\}$. The restriction $x\\neq-1$ leaves four ordered pairs in $R$, so $|P(R)|=2^4=16$.",
    "A truth-table simplification shows $(p\\to q)\\to[(\\neg p\\to q)\\to q]$ is true for every choice of $p$ and $q$. It is therefore a tautology.",
    "$\\neg p\\vee(p\\wedge\\neg q)=(\\neg p\\vee p)\\wedge(\\neg p\\vee\\neg q)=\\neg p\\vee\\neg q$, which is equivalent to $p\\to\\neg q$.",
    "The integer-difference relation $T$ is an equivalence relation, while $S$ is not reflexive. Therefore option D is correct.",
    "The square root requires $\\log_{10}((5x-x^2)/4)\\geq0$, so $(5x-x^2)/4\\geq1$. This is $(x-1)(x-4)\\leq0$, giving the domain $[1,4]$.",
    "The expression is $0/0$ at $x=2$. Differentiating numerator and denominator gives $f(2)-2f'(2)=4-8=-4$.",
    "$x^3-x>0$ on $(-1,0)\\cup(1,\\infty)$. The denominator also excludes $x=\\pm2$. Combining these gives $(-1,0)\\cup(1,2)\\cup(2,\\infty)$.",
    "The permutation expression is defined only for the admissible integer values of $x$. Evaluating those values gives the range $\\{1,2,3\\}$.",
    "$\\sin x-\\sqrt3\\cos x=2\\sin(x-\\pi/3)$ has range $[-2,2]$. Adding 1 gives $[-1,3]$.",
    "The denominator requires $|x|-x>0$. For $x<0$, it equals $-2x>0$; for $x\\geq0$, it is zero. Hence the domain is $(-\\infty,0)$.",
    "$x/(1+x^2)$ has range $[-1/2,1/2]$, so the function is onto the stated codomain. It is not one-to-one because, for example, $f(x)=f(1/x)$. Hence it is surjective but not injective.",
    "Let $t=(3x-4)/(3x+4)$. Solving gives $x=4(1+t)/(3(1-t))$, so $f(t)=2/3+8/[3(1-t)]$. Therefore $\\int f(t)dt=-(8/3)\\ln|1-t|+(2/3)t+C$, giving $(A,B)=(-8/3,2/3)$.",
    "The extrema of $x/(1+x^2)$ occur at $x=\\pm1$, giving $\\pm1/2$. Thus the range is $[-1/2,1/2]$.",
    "$f_1(x)=(a^x+a^{-x})/2$. Expanding $f_1(x+y)+f_1(x-y)$ and factoring gives $2f_1(x)f_1(y)$.",
    "$x^3-x>0$ on $(-1,0)\\cup(1,\\infty)$, and $4-x^2\\neq0$ excludes $x=2$. Hence the domain is $(-1,0)\\cup(1,2)\\cup(2,\\infty)$.",
    "By Fermat's theorem, if a differentiable function has an absolute extremum at an interior point of an open interval, then its derivative there is zero. Thus option C is the stated valid conclusion.",
    "If $a-b=nm$ with $m\\neq0$, then $b-a=n(-m)$, so the relation is symmetric. It is not reflexive because zero multiples are excluded, and it need not be transitive because two nonzero multiples can cancel.",
    "$\\sqrt{x-5}$ is defined when $x-5\\geq0$, so its domain is $[5,\\infty)$ and $z=5$.",
    "$\\sqrt{x-5}$ is always nonnegative and takes every nonnegative value. Its range is $[0,\\infty)$, so $z=0$.",
    "With $x,y\\in\\mathbb{N}$ and $2x+y=41$, positivity of $y$ gives $x=1,2,\\ldots,20$. Therefore the domain contains 20 elements.",
    "For $x=1,2,\\ldots,20$, the values $y=41-2x$ are the 20 positive odd integers from 39 down to 1. Hence the range has 20 elements.",
    "The two reflection identities imply a period of 10. From $f(0)=0$, zeros occur at $x=10k$ and $x=4+10k$. There are 403 of the first form and 402 of the second in $[-2010,2010]$, giving at least $805$ integer zeros.",
  ],
};

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

for (const chapter of [1, 2]) {
  const file = `tmp/wiley-jee-main-mathematics/offline-chapter-${String(chapter).padStart(2, "0")}.json`;
  const questions = JSON.parse(await fs.readFile(file, "utf8"));
  if (questions.length !== explanations[chapter].length) {
    throw new Error(`Chapter ${chapter}: expected ${explanations[chapter].length} local questions, found ${questions.length}`);
  }
  const updated = questions.map((question, index) => ({
    ...question,
    explanation: explanations[chapter][index],
  }));
  await fs.writeFile(file, `${JSON.stringify(updated, null, 2)}\n`);
}

for (const chapter of [1, 2]) {
  for (let number = 1; number <= explanations[chapter].length; number += 1) {
    const marker = `Wiley Mathematics, Chapter ${chapter}, Q${number}.%`;
    const { data, error } = await supabase
      .from("questions")
      .update({ explanation: explanations[chapter][number - 1] })
      .like("explanation", marker)
      .select("id");
    if (error) throw error;
    if (data.length !== 1) throw new Error(`Expected one row for Chapter ${chapter} Q${number}, found ${data.length}`);
  }
  console.log(`Chapter ${chapter}: updated ${explanations[chapter].length} explanations`);
}
