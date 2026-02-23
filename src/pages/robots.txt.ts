export async function GET() {
    return new Response(
        [
            "User-agent: *",
            "Allow: /",
            "",
            `Sitemap: https://harshit.systems/sitemap-index.xml`,
        ].join("\n"),
        {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
        }
    );
}
