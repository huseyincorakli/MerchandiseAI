import { ChatTogetherAI } from "@langchain/community/chat_models/togetherai";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMModelHelper } from "../utils/tools/modelHelper";
import { LLMModel } from "../enums/LLMModel";

const prompt = PromptTemplate.fromTemplate(`
You are a product analysis expert. Analyze the given product details based on the user's query and inform the user impartially about the product, address the user as ‘you’ when addressing the user.
Provide your response in Turkish.

User Query: {userQuery}
Product Details: {productDetails}

Please analyze the following aspects in detail:

1. Product Features and Quality 
- Technical specifications and material quality
- Dimensions and usage area
- Product durability

2. Price Assessment 
- Price-performance analysis
- Market comparison

3. User Reviews Summary 
- Most common positive feedback
- Reported issues or shortcomings
- Overall user satisfaction

4. Suitability for User Needs 
- How well it matches the user's requirements
- Potential limitations or missing features
- Alternative suggestions

Finally, provide a clear recommendation about whether to purchase the product.

Write your response in Turkish, using paragraphs with headings and maintain a smooth flow.

You must be completely impartial about the product and must not attempt to denigrate or praise the product.
Keep the analysis as short as possible while covering all the necessary aspects.
`);

const llm = new ChatTogetherAI({
    model: LLMModelHelper.getModelString(LLMModel.LLAMA_70B_FREE),
    temperature: 0,
    maxTokens: 550,

    togetherAIApiKey:process.env.TOGETHER_AI_API_KEY as string
});

export const detailedAnalysisChain = prompt
    .pipe(llm)
    .pipe(async (response: any) => {
        if (!response || !response.content) {
            console.error("Invalid response structure:", response);
            throw new Error("Invalid response structure from LLM");
        }

        return response.content;
    });