// Shared satirical "slop" grammar. Used by:
//   - the Slop Machine (client-side, Math.random)
//   - the homepage "Slop of the Day" (build-time, seeded by date → stable per day)
//   - per-article fake telemetry (seeded by slug → stable per article)
// One bag of buzzwords, many consumers.

export const names = [
    "Echo-Chamber", "Inertia-Max", "Debt-Prophet", "Reality-Synth", "Compliance-Engine",
    "Consensus-Engine", "Existential-Void", "Synergy-Synthesizer", "Purity-Engine",
    "Alignment-Shepherd", "Procrastinatus", "DecisionLock", "Clout-Catalyst", "Gaslight-GPT",
    "Pivot-Prime", "Vibe-Check", "Scope-Creep", "Burnout", "Quarterly-Oracle", "Blameless",
    "Stakeholder-9000", "Vaporware", "Roadmap-Reaper", "Standup-Slayer", "Jargon-Forge",
];

export const sizes = ["7B", "80B", "400B", "500B", "1T", "12T", "70B", "10B", "404B", "0.5B", "∞", "9000"];

export const launches = [
    "Just Launched", "Enters Stealth (Again)", "Raises $500M at $40B Valuation",
    "Goes Open Source (Weights Behind a Waitlist)", "Quietly Achieves AGI Over the Weekend",
    "Files for IPO", "Pivots From Pet Insurance", "Ships to Prod on a Friday",
    "Deprecates Its Own Founders", "Announces an Announcement",
];

export const metrics = [
    "100% Culture Fit", "100% KPI Fulfillment", "Total Stakeholder Buy-In",
    "100% Technical Debt Elimination", "Perfect Blame Avoidance", "100% Process Adherence",
    "Perfect Code Avoidance", "Total Personal Brand Saturation", "Infinite Cognitive Offload",
    "100% Alignment", "Impact-Free Growth", "Maximum Synergy", "Zero Accountability",
    "Negative Latency", "Post-Scarcity Vibes",
];

export const mechanisms = [
    "by downvoting divergent thoughts into the shadow realm",
    "by remapping objective reality to match executive desires",
    "by infinitely expanding the feedback loop until heat death",
    "by generating absolutely nothing, instantly",
    "by converting every sprint into a strategic refinement loop",
    "by automating thought leadership into pure vibes",
    "by transcending utility and embracing cosmic nihilism",
    "by rebranding the bankruptcy as a value-realization event",
    "by replacing the QA team with a confident emoji",
    "by training exclusively on 'I am humbled to announce' posts",
    "by gaslighting the compiler into approving the build",
    "by moving every dissenter to a Shadow-Slack of agreeable bots",
    "by tripling the jargon density while halving shared context",
    "while quietly tripling your cloud bill",
];

export const deks = [
    "Investors hailed the move as 'the most productive we've never been.'",
    "The model has already begun rewriting this article to be more on-brand.",
    "Critics called it reckless; the model rebranded them as 'low-synergy.'",
    "Early benchmarks confirm a 40% hallucination rate, now marketed as a feature.",
    "Sources say the entire codebase is a single confident print statement.",
    "The NASDAQ rose 4.2% on the realization that bad news is now structurally impossible.",
    "It scored a 0.94 on the Synergy-Scale, narrowly avoiding a mindfulness seminar.",
    "Leadership described the 15-page risk memo as 'a vibe we're choosing not to have.'",
    "The roadmap remains unchanged, which is itself considered a deliverable.",
    "Remaining employees were assured they are millionaires in a post-scarcity simulation.",
];

export interface Slop {
    headline: string;
    dek: string;
}

// Deterministic PRNG (mulberry32) so a given seed always yields the same slop.
export function mulberry32(seed: number): () => number {
    let a = seed >>> 0;
    return function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Hash an arbitrary string into a 32-bit seed.
export function seedFromString(str: string): number {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

// Assemble one headline + dek from any random source (seeded or not).
export function buildSlop(rand: () => number = Math.random): Slop {
    const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
    const headline =
        `The '${pick(names)} ${pick(sizes)}' LLM ${pick(launches)}: ` +
        `Achieves ${pick(metrics)} ${pick(mechanisms)}.`;
    return { headline, dek: pick(deks) };
}
