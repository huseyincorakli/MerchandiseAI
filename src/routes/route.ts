import express, { Request, Response } from 'express';
import { runRecommendationChain } from '../graph/productRecommend';
import { turkishToEnglish } from '../utils/tools/turkishLetterConverter';
import { scrapeProduct } from '../utils/scrapers/scrap_product';
import { processProductData } from '../utils/tools/scrapedProductCrop';
import { detailedAnalysisChain } from '../chains/productDetailsChain';

const router = express.Router();

router.get('/product-recommendation', async (req: Request, res: Response) => {
    let query = req.query.q as string;
    if (!query) {
        res.status(400).json({ error: "Query parameter is required" });
        return;
    }
    query = turkishToEnglish(query);
    try {
        const response = await runRecommendationChain(query);

        res.json({
            response
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



router.get('/analys-product', async (req: Request, res: Response) => {
    let url = req.query.q as string;
    let userQuery = req.query.uq as string;
    if (!url || !userQuery) {
        res.status(400).json({ error: "parameters is required" });
        return;
    }
    const response = await scrapeProduct(url)
    var data = processProductData(response);
    
    var ai_message= await detailedAnalysisChain.invoke({
        productDetails: {data},
        userQuery: {userQuery}
    }) as  string;
    res.json({
        ai_message,
        response
    });


});



export default router;