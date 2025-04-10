import { DynamicStructuredTool, tool } from '@langchain/core/tools';
import { VectorStore } from '@langchain/core/vectorstores';
import { z } from 'zod';

const retrieveSchema = z.object({ query: z.string() });

export function smalltalkTools(
  smallTalkStore: VectorStore,
): DynamicStructuredTool<any> {
  const retrieve = tool(
    async ({ query }) => {
      const results = await smallTalkStore.similaritySearch(query, 1);
      return results?.[0]?.metadata?.answer || 'Hey! 😊 How can I help?';
    },
    {
      name: 'smalltalk_tool',
      description:
        'Use this tool when the user is greeting or doing small talk (e.g., hello, how are you, hi).',
      schema: retrieveSchema,
    },
  );

  return retrieve;
}
