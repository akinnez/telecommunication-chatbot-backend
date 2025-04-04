import { OpenAIEmbeddings } from '@langchain/openai';
import { ChatOpenAI } from '@langchain/openai';
import { BufferMemory } from 'langchain/memory';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import type { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { retrieverTools } from './retrievalTool';
import { agentStream } from './agent';
import { toolCalling } from './toolCalling';

async function searchReviews(
  documents: Document[],
  apiKey: string,
  message: string,
) {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });
  const splitDocuments: Document[] =
    await textSplitter.splitDocuments(documents);
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: apiKey,
    model: 'text-embedding-3-small',
  });
  const vectorStore = new MemoryVectorStore(embeddings);
  await vectorStore.addDocuments(splitDocuments);

  const memory = new BufferMemory();
  const retrieve = retrieverTools(vectorStore);

  const model = new ChatOpenAI({
    openAIApiKey: apiKey,
    model: 'gpt-3.5-turbo',
    maxRetries: 3,
    timeout: 1000,
    n: 1,
    temperature: 0.5,
  });

  const graph = toolCalling(retrieve, model, memory);
  const agents = agentStream(graph, message);

  return agents;
}

export default searchReviews;
