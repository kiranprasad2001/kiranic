// The Kiranic network — the family of sites under *.kiranic.com.
// Source of truth for the /network hub page (and, eventually, the shared
// cross-product "network strip"). Grouped by cluster.
//
// NOTE: blurbs for `arc` and `unigrabs` are best-guess placeholders — their
// repos don't carry descriptions. Easy to correct in one place.

export interface Product {
    name: string;
    url: string;          // live subdomain
    repo: string;         // github repo slug (under kiranprasad2001/)
    blurb: string;
    tags: string[];
    confirm?: boolean;    // true = copy is a placeholder worth confirming
}

export interface Cluster {
    key: string;
    title: string;
    note: string;
    products: Product[];
}

export const network: Cluster[] = [
    {
        key: "transit",
        title: "Transit",
        note: "Getting around the GTA, three different ways.",
        products: [
            { name: "GTA", url: "https://gta.kiranic.com", repo: "gta", blurb: "Real-time transit tracking for the Greater Toronto Area.", tags: ["TypeScript", "Vite", "Maps"] },
            { name: "JATA", url: "https://jata.kiranic.com", repo: "jata", blurb: "Just Another Transit App — arrivals in your pocket.", tags: ["React Native", "Expo"] },
            { name: "TTC", url: "https://ttc.kiranic.com", repo: "ttc", blurb: "One-tap SMS links for live TTC stop arrival times.", tags: ["HTML", "SMS"] },
        ],
    },
    {
        key: "learning",
        title: "Learning",
        note: "Made for teaching a kid on the move — built for spotty transit signal.",
        products: [
            { name: "Shashi", url: "https://shashi.kiranic.com", repo: "shashi", blurb: "Bite-size lessons to teach my kid during transit rides.", tags: ["JavaScript", "Education"] },
            { name: "Translate", url: "https://translate.kiranic.com", repo: "translate", blurb: "Language practice for the daycare commute.", tags: ["JavaScript", "i18n"] },
            { name: "French", url: "https://french.kiranic.com", repo: "learnFrench", blurb: "A personal French-learning journey.", tags: ["Python"] },
        ],
    },
    {
        key: "tools",
        title: "Tools & Experiments",
        note: "Demos, utilities, and things that needed a subdomain.",
        products: [
            { name: "CCM Tool", url: "https://kiran-ccm-tool.kiranic.com", repo: "kiran-ccm-tool", blurb: "Demo CCM tool — generate documents, policies & letters.", tags: ["TypeScript", "CCM"] },
            { name: "ARC", url: "https://arc.kiranic.com", repo: "arc", blurb: "An experiment, currently going by ARC.", tags: ["Next.js"], confirm: true },
            { name: "Unigrabs", url: "https://unigrabs.kiranic.com", repo: "unigrabs", blurb: "A work-in-progress experiment.", tags: ["TypeScript"], confirm: true },
            { name: "Links", url: "https://links.kiranic.com", repo: "links", blurb: "A small hub of my links around the web.", tags: ["HTML"] },
        ],
    },
];

// Flat list (handy for status pings / counts).
export const allProducts: Product[] = network.flatMap((c) => c.products);
