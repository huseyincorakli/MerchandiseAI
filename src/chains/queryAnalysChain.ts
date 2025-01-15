import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatTogetherAI } from "@langchain/community/chat_models/togetherai";
import { z } from "zod";
import { LLMModelHelper } from "../utils/tools/modelHelper";
import { LLMModel } from "../enums/LLMModel";

const CombinedSchema = z.object({
    category: z.enum(["top_rated", "economic", "favorite", "score", "irrelevant"]),
    productName: z.string(),
    price: z.string().nullable(),
    currency: z.string().nullable(),
    description:z.string().nullable(),
});

const llm = new ChatTogetherAI({
    model: LLMModelHelper.getModelString(LLMModel.LLAMA_70B_FREE),
    temperature: 0,
    maxTokens: 1500,
    togetherAIApiKey:process.env.TOGETHER_AI_API_KEY as string
});

const prompt = ChatPromptTemplate.fromTemplate(`
Analyze e-commerce queries and extract structured information.
Categories: economic (budget-focused), top_rated (highly-rated), favorite (popular), score (highest-rated), irrelevant (non-shopping)
Rules:
- Convert plural products to singular
- Format prices as "min-max", "0-max", or "min-∞"
- Use currency codes: TRY, USD, EUR, GBP
- For irrelevant queries: set all fields null except category and description
- Description should only be written in irrelavent cases, in non-irrelavent cases it should be absolutely null
- Description should explain why if query is irrelevant
- If productName consists of 2 or more words, put a + sign between them instead of a space
-You should not use ‘.’ or ‘,’ to define the price range, you should use 1000-2000.
-if the product name contains a brand, take brand+productname

Example inputs and expected outputs:

Example input: "200 TL altında bir nike ayakkabı arıyorum"
Example output: {{
    "category": "favorite",
    "productName": "nike+ayakkabı",
    "price": "0-200",
    "currency": "TRY",
    "description":"null"
}}

Example input: "en çok satan apple telefon kılıfları hangileri"
Example output: {{
    "category": "favorite",
    "productName": "apple+telefon+kılıfı",
    "price": null,
    "currency": null,
    "description":"null"
}}
Example input: "Mavi renkli bir kase satın almak istiyorum"
Example output: {{
    "category": "favorite",
    "productName": "mavi+kase",
    "price": null,
    "currency": null,
    "description":"null"
}}

Example input: "en yüksek puanlı telefonlar"
Example output: {{
    "category": "score",
    "productName": "telefon",
    "price": null,
    "currency": null,
    "description":"null"
}}

Example input: "bugün hava nasıl"
Example output: {{
    "category": "irrelevant",
    "productName": "none",
    "price": null,
    "currency": null,
    "description":"Üzgünüm hava durumu bilgisi veremem."
}}

Analyze the following query and provide structured output: {input}
`);

const llmWithStructuredOutput = llm.withStructuredOutput(CombinedSchema);
const queryAnalysChain = prompt.pipe(llmWithStructuredOutput);

export default queryAnalysChain;