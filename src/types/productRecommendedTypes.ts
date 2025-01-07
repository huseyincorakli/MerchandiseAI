 interface QueryInput {
    query: string;
}

interface AnalysisOutput {
    prediction: any;
    isValid: boolean;
    originalQuery: string;
}

interface ScrapingOutput {
    scrapResult?: any;
    params?: any;
    isIrrelevant?: boolean;
    message?: string;
    originalQuery: string;
}

interface FinalOutput {
    recommendation: any;
    metadata: {
        scraping: {
            parameters: any;
            totalProducts: number;
            products: any[];
        }
    }
}

export {QueryInput, AnalysisOutput, ScrapingOutput, FinalOutput};