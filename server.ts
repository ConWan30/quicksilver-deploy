import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { PromptTemplate } from '@langchain/core/prompts';

const app = new Hono();
app.use('*', logger());
app.use('*', cors());

const askSchema = z.object({
  q: z.string().min(1, 'Query parameter "q" is required'),
});

app.get('/ask', zValidator('query', askSchema), async (c) => {
  const { q } = c.req.valid('query');

  const llm = new ChatOpenAI({
    model: 'grok-beta',  // xAI model
    openAIApiKey: process.env.OPENAI_API_KEY,  // Your xAI key
    configuration: {
      baseURL: 'https://api.x.ai/v1',  // xAI endpoint
    },
  });

  try {
    const prompt = PromptTemplate.fromTemplate('Provide insights for gaming analytics: {query}');
    const chain = prompt.pipe(llm);
    const response = await chain.invoke({ query: q });
    return c.json({ response: response.content });
  } catch (error) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

const port = Number(process.env.SERVER_PORT || 8000);
console.log(`Server running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
