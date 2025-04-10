import { OpenAIEmbeddings } from '@langchain/openai';
import { ChatOpenAI } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import type { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { retrieverTools } from './retrievalTool';
import { agentStream } from './agent';
import { toolCalling } from './toolCalling';
import { MessageContent } from '@langchain/core/messages';
import { SMALL_TALK_QA } from 'src/small-talk';
import { smalltalkTools } from './smallTalkTool';

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

  const smallTalkStore = await MemoryVectorStore.fromTexts(
    SMALL_TALK_QA.map((item) => item.question),
    SMALL_TALK_QA,
    new OpenAIEmbeddings({
      openAIApiKey: apiKey,
      model: 'text-embedding-3-small',
    }),
  );
  const vectorStore = new MemoryVectorStore(embeddings);
  await vectorStore.addDocuments(splitDocuments);
  const retrieve = retrieverTools(vectorStore);
  const smallTalkTools = smalltalkTools(smallTalkStore);

  const model = new ChatOpenAI({
    openAIApiKey: apiKey,
    model: 'gpt-3.5-turbo',
    maxRetries: 3,
    timeout: 10000,
    n: 1,
    temperature: 0.7,
  });

  const graph = toolCalling(smallTalkTools, retrieve, model);

  const agents = agentStream(graph, message);

  const payload: {
    id: string;
    response: MessageContent;
  } = {
    id: (await agents).id,
    response: (await agents).content,
  };
  return payload;
}

export default searchReviews;
