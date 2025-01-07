import puppeteer from "puppeteer";

export async function scrapeProduct(productUrl: string) {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        await page.goto(productUrl, {
            waitUntil: 'networkidle2'
        });

        const productData = await page.evaluate(() => {
            const title = document.querySelector('h1.pr-new-br')?.textContent?.trim();
            const price = document.querySelector('span.prc-dsc')?.textContent?.trim();
            const seller = document.querySelector('a.merchant-text')?.textContent?.trim();
            const rating = document.querySelector('div.pr-rnr-sm-p')?.textContent?.trim();
            
            const images = Array.from(document.querySelectorAll('.gallery-container .product-image-container img')).map(img => {
                const element = img as HTMLImageElement;
                return {
                    original: element.src, 
                    alt: element.alt, 
                    highRes: element.getAttribute('data-src') || element.src
                };
            });

            const zoomImages = Array.from(document.querySelectorAll('.js-image-zoom_zoomed-area')).map(div => {
                const element = div as HTMLDivElement;
                const bgImage = element.style.backgroundImage;
                const url = bgImage.replace(/^url\(['"](.+)['"]\)$/, '$1');
                return {
                    zoomUrl: url
                };
            });

            const detailsSection = document.querySelector('section[component-id="20"]');
            const description = detailsSection?.querySelector('.detail-border')?.textContent?.trim();
            
            const specifications = Array.from(detailsSection?.querySelectorAll('.detail-attr-item') || []).map(item => {
                const key = item.querySelector('.attr-name.attr-key-name-w')?.textContent?.trim();
                const value = item.querySelector('.attr-name.attr-value-name-w')?.textContent?.trim();
                
                return {
                    key,
                    value
                };
            }).filter(item => item.key && item.value);

            const reviews = Array.from(document.querySelectorAll('.review-card-container')).map(review => {
                const stars = review.querySelectorAll('.star-w .full').length;
                
                return {
                    author: review.querySelector('.review-card-owner')?.textContent?.trim(),
                    date: review.querySelector('.review-card-date')?.textContent?.trim(),
                    comment: review.querySelector('.review-card-comment-text')?.textContent?.trim(),
                    rating: stars,
                    likes: parseInt(review.querySelector('.reviews-like-button span')?.textContent?.replace(/[()]/g, '') || '0'),
                    seller: review.querySelector('.review-card-seller p')?.textContent?.trim()
                };
            });

            const alternativeSpecs = Array.from(detailsSection?.querySelectorAll('.detail-attr-container li') || []).map(item => {
                const spans = item.querySelectorAll('span');
                if (spans.length >= 2) {
                    return {
                        key: spans[0]?.textContent?.trim(),
                        value: spans[1]?.textContent?.trim()
                    };
                }
                return null;
            }).filter(Boolean);

            const allSpecifications = [...specifications, ...alternativeSpecs];

            return {
                title,
                price,
                seller,
                rating,
                description,
                specifications: allSpecifications,
                images, 
                zoomImages, 
                reviews
            };
        });

        await browser.close();
        return productData;

    } catch (error) {
        console.error('Hata oluştu:', error);
        throw error;
    }
}