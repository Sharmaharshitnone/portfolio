import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";

export async function GET(context: APIContext) {
    const logs = await getCollection("logs");

    return rss({
        title: "Harshit Sharma — Engineering Logs",
        description:
            "Daily and weekly engineering updates on systems programming, competitive programming, and web architecture.",
        site: context.site ?? "https://harshit.systems",
        items: logs
            .sort(
                (a, b) =>
                    b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
            )
            .map((log) => ({
                title: log.data.title,
                pubDate: log.data.pubDate,
                link: `/logs/${log.id}/`,
                categories: log.data.tags,
            })),
        customData: `<language>en-us</language>`,
    });
}
