import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import { QueryGrader } from '../utils/graders/query_grader';
import { scrap } from "../utils/scrapers/scrap";
import productSelectorChain from "../chains/productSelectorChain";
import queryAnalysChain from "../chains/queryAnalysChain";
import { mapCategoryToSortType } from "../utils/tools/categoryToSortType";
import { compressProductData } from "../utils/tools/compressProductData";
import { QueryInput, AnalysisOutput, ScrapingOutput, FinalOutput } from "../types/productRecommendedTypes";
import { turkishToEnglish } from "../utils/tools/turkishLetterConverter";


// 1. Query Analysis Chain
const queryAnalysisChain = RunnableSequence.from([
    new RunnablePassthrough(),
    async (input: QueryInput): Promise<AnalysisOutput> => {
        console.log("Query input:", typeof input.query);
        
        const q= turkishToEnglish(input.query);
        const prediction = await queryAnalysChain.invoke({ input: q });
        console.log("prediction",prediction);
        
        const grader = new QueryGrader();
        const result = grader.gradeOutput(prediction);
        console.log("grade",result);
        
        return {
            prediction,
            isValid: result.isValid,
            originalQuery: q
        };
    }
]);

// 2. Product Scraping Chain
const scrapingChain = RunnableSequence.from([
    new RunnablePassthrough(),
    async (input: AnalysisOutput): Promise<ScrapingOutput> => {
        if (!input.isValid) {
            throw new Error("Invalid query format");
        }

        if (input.prediction.category === 'irrelevant') {
            return {
                isIrrelevant: true,
                message: input.prediction.description,
                originalQuery: input.originalQuery
            };
        }

        const params = {
            productName: input.prediction.productName,
            pageNumber: 1,
            sortType: mapCategoryToSortType(input.prediction.category),
            priceRange: input.prediction.price
        };

        const scrapResult = await scrap(
            params.productName,
            params.pageNumber,
            params.sortType as any,
            params.priceRange
        );

        if (!scrapResult.products || scrapResult.products.length === 0) {
            throw new Error("No products found");
        }
        debugger
        return {
            scrapResult,
            params,
            originalQuery: input.originalQuery
        };
    }
]);

// 3. Product Selection Chain
const productSelectionChain = RunnableSequence.from([
    new RunnablePassthrough(),
    async (input: ScrapingOutput): Promise<FinalOutput> => {
        if (input.isIrrelevant) {
            throw new Error(input.message || "Irrelevant query");
        }

        

        // Compress and normalize the products data
        const compressedProducts = compressProductData(input.scrapResult.products);
        const minifiedJson = JSON.stringify(compressedProducts).replace(/\s+/g, '');

        const bestProduct = await productSelectorChain.invoke({
            input: minifiedJson,
            userQuery: input.originalQuery.trim()
        });

        return {
            recommendation: bestProduct,
            metadata: {
                scraping: {
                    parameters: input.params,
                    totalProducts: input.scrapResult.totalProducts,
                    products:input.scrapResult.products
                }
            }
        };
    }
]);

// Combine all chains
const mainChain = RunnableSequence.from([
    queryAnalysisChain,
    scrapingChain,
    productSelectionChain
]);

export async function runRecommendationChain(query: string) {
    try {
        const result = await mainChain.invoke({ query });
        console.log("Final result:", result);
        
        return {
            success: true,
            ...result,
            query: {
                original: query
            }
        };
    } catch (error) {
        if (error.message === "Irrelevant query") {
            return {
                success: true,
                isIrrelevant: true,
                message: error.message
            };
        }
        throw error;
    }
}