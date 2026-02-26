export const newsSchema = {
    type: "OBJECT",
    properties: {
        headline: { type: "STRING" },
        summary: { type: "STRING" },
        content: { type: "STRING" },
        tags: {
            type: "ARRAY",
            items: { type: "STRING" }
        },
        icon: {
            type: "STRING",
            enum: ["Bot", "Terminal", "Cpu", "Sparkles", "AlertTriangle", "Cloud", "Server", "Database", "Code"]
        },
        sources: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    title: { type: "STRING" },
                    url: { type: "STRING" }
                },
                required: ["title", "url"]
            }
        }
    },
    required: ["headline", "summary", "content", "tags", "icon", "sources"]
};

export const glossarySchema = {
    type: "OBJECT",
    properties: {
        terms: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    term: { type: "STRING" },
                    definition: { type: "STRING" }
                },
                required: ["term", "definition"]
            }
        }
    },
    required: ["terms"]
};
