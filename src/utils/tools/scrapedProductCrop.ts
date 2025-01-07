export const processProductData = (scrapedProduct: any) => {
     const topReviews = [...scrapedProduct.reviews]
         .sort((a, b) => (b.likes || 0) - (a.likes || 0))
         .slice(0, 5);
 
     return {
         title: scrapedProduct.title,
         price: scrapedProduct.price,
         description: scrapedProduct.description,
         specifications: scrapedProduct.specifications,
         reviews: topReviews
     };
 };