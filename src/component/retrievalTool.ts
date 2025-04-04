import { DynamicStructuredTool, tool } from '@langchain/core/tools';
import { VectorStore } from '@langchain/core/vectorstores';
import { z } from 'zod';

const retrieveSchema = z.object({ query: z.string() });

export function retrieverTools(store: VectorStore): DynamicStructuredTool<any> {
  const retrieve = tool(
    async ({ query }) => {
      const retrievedDocs = await store.similaritySearch(query, 0);
      const serialized = retrievedDocs
        .map(
          (doc) =>
            `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`,
        )
        .join('\n');
      return [serialized, retrievedDocs];
    },
    {
      name: 'retrieve',
      description: 'Retrieve information related to a query.',
      schema: retrieveSchema,
      responseFormat: 'question_and_answer',
    },
  );
  return retrieve;
}
