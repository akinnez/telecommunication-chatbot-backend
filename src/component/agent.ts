import { BaseMessage } from '@langchain/core/messages';

import { v4 as uuidv4 } from 'uuid';

export async function agentStream(graph: any, message: any) {
  let inputs = { messages: [{ role: 'user', content: message }] };
  let lastMessage!: BaseMessage;

  const threadConfig = {
    configurable: { thread_id: uuidv4() },
    streamMode: 'values' as const,
  };

  for await (const step of await graph.invoke(inputs, threadConfig)) {
    lastMessage = step.messages.at(-1);
  }

  return lastMessage;
}
