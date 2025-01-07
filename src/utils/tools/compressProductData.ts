export function compressProductData(products: any[]) {
    return products.map(p => ({
        t: p.title?.trim(),                    // title
        d: p.description?.trim() || null,      // description
        p: p.price?.trim(),                    // price
        l: p.link,                             // link
        i: p.image,                            // image
        r: p.rating || null,                   // rating
        rc: p.ratingCount || null,             // ratingCount
        pg: p.page                             // page
    }));
}