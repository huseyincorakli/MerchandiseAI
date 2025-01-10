import puppeteer, { Browser } from 'puppeteer';

type SortOption = 'SCORE' | 'MOST_RECENT' | 'PRICE_BY_ASC' | 'PRICE_BY_DESC' | 'MOST_FAVOURITE' | 'MOST_RATED';

const buildUrl = (productName: string, pageNumber: number, sortType?: SortOption, priceRange?: string): string => {
    
    const params = new URLSearchParams();
    params.append('q', encodeURIComponent(productName));

    if (pageNumber > 1) {
        params.append('pi', pageNumber.toString());
    }

    if (sortType) {
        params.append('sst', sortType);
    }
    if (priceRange) {
        params.append('prc', priceRange);
    }

    return `https://www.trendyol.com/sr?${params.toString()}`;
};

async function scrapePage(
    browser: Browser,
    productName: string,
    pageNumber: number,
    sortType?: SortOption,
    priceRange?: string
) {
    const page = await browser.newPage();
    console.log('Chrome path:', await browser.browserContexts());
    await page.setDefaultNavigationTimeout(60000);
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    const url = buildUrl(productName, pageNumber, sortType, priceRange);
    console.log(`Loading page ${pageNumber}:`, url);

    try {
        await page.goto(url, { waitUntil: 'load' });

        const products = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.p-card-wrppr')).map((card) => {
                try {
                    const titleEl = card.querySelector('.prdct-desc-cntnr-ttl');
                    const nameEl = card.querySelector('.prdct-desc-cntnr-name');
                    const descEl = card.querySelector('.product-desc-sub-text');
                    const priceEl = card.querySelector('.prc-box-dscntd, .discount-basket-price, .prc-box-orgnl');
                    const linkEl = card.querySelector('a');
                    const imageEl = card.querySelector('.p-card-img');
                    const ratingEl = card.querySelector('.rating-score');
                    const ratingCountEl = card.querySelector('.ratingCount');

                    return {
                        title: `${titleEl?.textContent?.trim() || ''} ${nameEl?.textContent?.trim() || ''}`.trim(),
                        description: descEl?.textContent?.trim() || null,
                        price: priceEl?.textContent?.trim() || null,
                        link: linkEl?.href || null,
                        image: imageEl?.getAttribute('src') || null,
                        rating: ratingEl?.textContent?.trim() || null,
                        ratingCount: ratingCountEl?.textContent?.replace(/[()]/g, '').trim() || null,
                    };
                } catch {
                    return null;
                }
            }).filter(Boolean);
        });
        console.log(products);
        
        await page.close();
        return products;
    } catch (err) {
        console.error(`Failed to scrape page ${pageNumber}:`, err);
        await page.close();
        return [];
    }
}

export async function scrap(productName: string, pageNumber: number = 1, sortType?: SortOption, priceRange?: string) {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    });
    try {
        const pagesToScrape = pageNumber > 1 ? [pageNumber - 1, pageNumber] : [1, 2];

        const scrapePromises = pagesToScrape.map((pageNum) =>
            scrapePage(browser, productName, pageNum, sortType, priceRange)
        );

        const allProducts = (await Promise.all(scrapePromises)).flat();
        console.log(`Total products scraped: ${allProducts.length}`);

        return {
            products: allProducts,
            currentPage: pageNumber,
            pagesScraped: pagesToScrape,
            totalProducts: allProducts.length,
            hasNextPage: allProducts.length >= 48,
            sortType: sortType || 'default',
        };
    } finally {
        await browser.close();
    }
}




