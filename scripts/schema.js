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
        }
    },
    required: ["headline", "summary", "content", "tags", "icon"]
};
