import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import type { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { retrieverTools } from './retrievalTool';
import { agentStream } from './agent';
import { toolCalling } from './toolCalling';
import { MessageContent } from '@langchain/core/messages';
import { SMALL_TALK_QA } from 'src/small-talk';
import { smalltalkTools } from './smallTalkTool';
import { embeddings, model } from './openAI';

async function searchReviews(
  documents: Document[],
  apiKey: string,
  message: string,
  thread_id: string,
) {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 400,
    chunkOverlap: 50,
  });
  const splitDocuments: Document[] =
    await textSplitter.splitDocuments(documents);

  const smallTalkStore = await MemoryVectorStore.fromTexts(
    SMALL_TALK_QA.map((item) => item.question),
    SMALL_TALK_QA,
    embeddings,
  );
  const vectorStore = new MemoryVectorStore(embeddings);
  await vectorStore.addDocuments(splitDocuments);
  const retrieve = retrieverTools(vectorStore);
  const smallTalkTools = smalltalkTools(smallTalkStore);

  const graph = toolCalling(smallTalkTools, retrieve, model);

  const agents = agentStream(graph, message, thread_id);

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
