import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatTogetherAI } from "@langchain/community/chat_models/togetherai";
import { z } from "zod";
import { LLMModelHelper } from "../utils/tools/modelHelper";
import { LLMModel } from "../enums/LLMModel";

const ProductSchema = z.object({
    title: z.string(),
    description: z.string().nullable(),
    price: z.string(),
    link: z.string().url(),
    image: z.string().url(),
    rating: z.string(),
    ratingCount: z.string(),
});

const llm = new ChatTogetherAI({
    model: LLMModelHelper.getModelString(LLMModel.LLAMA_70B_FREE),
    temperature: 0,
    maxTokens: 1500,
    togetherAIApiKey:process.env.TOGETHER_AI_API_KEY as string

});

const prompt = ChatPromptTemplate.fromTemplate(`
You are a product recommendation expert. Analyze the given list of products and select the single best product that matches the user's original query.

User's Original Query: {userQuery}

Consider the following criteria in order of priority based on the user's query context:

1. Query Intent Analysis:
   - Analyze key terms and requirements in the user's query
   - Match product features with user's expressed needs
   - Consider any specific preferences or constraints mentioned

2. Price-Quality Balance:
   - For budget-focused queries, prioritize value for money
   - For quality-focused queries, prioritize higher-rated items
   - For balanced queries (e.g., "price-performance"), find the optimal middle ground

3. Rating and Reliability:
   - Consider both rating score and number of reviews
   - Higher weight on products with more reviews
   - Minimum reliability threshold: prefer 4.0+ rating with 50+ reviews

4. Product Relevance:
   - Ensure product title and description align with query intent
   - Check for key features mentioned in the query
   - Consider product specifications that match user requirements

Rules:
- Always select exactly one product that best matches the user's original query
- Ensure all required fields are present in the output
- Return numeric values as strings for consistency
- Maintain original price formatting (e.g., "303,12 TL")
- If faced with similar products, prefer the one that better matches the query context

Example input pairs:
User Query: "Ucuz ama kaliteli bir laptop arıyorum"
Products: [List of products...]

Example output: {{
    "title": "Example Laptop Model X",
    "description": "Budget-friendly but reliable",
    "price": "5.499,00 TL",
    "link": "https://example.com/laptop",
    "image": "https://example.com/image.jpg",
    "rating": "4.5",
    "ratingCount": "250",
}}

Analyze the following products and select the best match for the user's query:
User Query: {userQuery}
Products: {input}
`);

const llmWithStructuredOutput = llm.withStructuredOutput(ProductSchema);
const productSelectorChain = prompt.pipe(llmWithStructuredOutput);

export default productSelectorChain;