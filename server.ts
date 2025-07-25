import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const app = new Hono();
app.use('*', logger());
app.use('*', cors());

const askSchema = z.object({
  q: z.string().min(1, 'Query parameter "q" is required'),
});

app.get('/ask', zValidator('query', askSchema), async (c) => {
  const { q } = c.req.valid('query');

  try {
    const llm = new ChatOpenAI({
      model: 'grok',  // xAI model (standard Grok)
      openAIApiKey: process.env.OPENAI_API_KEY,  // Your xAI key
      configuration: {
        baseURL: 'https://api.x.ai/v1',  // xAI endpoint
      },
    });

    const response = await llm.invoke(q);
    return c.json({ response: response.content });
  } catch (error) {
    console.error('Error in /ask:', error);
    return c.json({ error: 'Failed to process query', details: String(error) }, 500);
  }
});

app.get('/', async (c) => {
  return c.json({ status: 'QuickSilver is running', version: '1.0.0' });
});

const port = Number(process.env.PORT || 8080);
const host = '0.0.0.0';
console.log(`Server running on ${host}:${port}`);

export default {
  port,
  host,
  fetch: app.fetch,
};
