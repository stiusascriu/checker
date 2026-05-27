export async function onRequestGet(context) {
    const requestUrl = new URL(context.request.url);
    const target = requestUrl.searchParams.get("url");
  
    if (!target) {
      return Response.json({ error: "Missing URL" }, { status: 400 });
    }
  
    const result = await crawl(target);
    return Response.json(result);
  }
  
  async function crawl(startUrl) {
    const origin = new URL(startUrl).origin;
    const queue = [startUrl];
    const visited = new Set();
  
    while (queue.length && visited.size < 5000) {
      const currentUrl = queue.shift();
  
      if (visited.has(currentUrl)) continue;
      visited.add(currentUrl);
  
      try {
        const res = await fetch(currentUrl, {
          headers: {
            "user-agent": "Mozilla/5.0 Promo Scanner"
          }
        });
  
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("text/html")) continue;
  
        const text = await res.text();
  
        if (text.includes("1€") || text.includes("1 €")) {
          return {
            found: true,
            url: currentUrl,
            checked: visited.size
          };
        }
  
        const links = [...text.matchAll(/href=["']([^"']+)["']/gi)];
  
        for (const match of links) {
          try {
            const link = new URL(match[1], currentUrl).href;
            const clean = link.split("#")[0];
  
            if (
              clean.startsWith(origin) &&
              !visited.has(clean) &&
              !queue.includes(clean)
            ) {
              queue.push(clean);
            }
          } catch {}
        }
  
        await new Promise(resolve => setTimeout(resolve, 300));
  
      } catch {}
    }
  
    return {
      found: false,
      checked: visited.size
    };
  }