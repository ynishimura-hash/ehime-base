// Native fetch in Node 18+

async function testFetch(url) {
    console.log(`Testing URL: ${url}`);
    try {
        const siteRes = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        console.log(`Status: ${siteRes.status}`);
        if (!siteRes.ok) throw new Error(`Failed to fetch: ${siteRes.statusText}`);

        const html = await siteRes.text();
        console.log(`HTML Length: ${html.length}`);

        // Simple HTML text extraction (same as route.ts)
        let text = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "")
            .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gm, "");
        text = text.replace(/<[^>]+>/g, "\n");
        const cleanText = text.replace(/\s+/g, " ").trim().substring(0, 500); // Check first 500 chars

        console.log('--- Extracted Text Preview ---');
        console.log(cleanText);
        console.log('------------------------------');

    } catch (error) {
        console.error('Error:', error);
    }
}

testFetch('https://www.hellowork.mhlw.go.jp/kensaku/GECA110010.do?screenId=GECA110010&action=kyujinhyoBtn&kJNo=1301006539161&kJKbn=1');
