import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { PromptTemplate } from '@langchain/core/prompts';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const askSchema = z.object({
  q: z.string().min(1, 'Query parameter "q" is required'),
});

app.get('/ask', async (req, res) => {
  try {
    const { q } = askSchema.parse(req.query);

    const llm = new ChatOpenAI({
      model: 'grok-beta',  // xAI model
      openAIApiKey: process.env.OPENAI_API_KEY,  // Your xAI key
      configuration: {
        baseURL: 'https://api.x.ai/v1',  // xAI endpoint
      },
    });

    const prompt = PromptTemplate.fromTemplate('Provide insights for: {query}');
    const chain = prompt.pipe(llm);
    const response = await chain.invoke({ query: q });

    res.json({ response: response.content });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const port = process.env.SERVER_PORT || 8000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
