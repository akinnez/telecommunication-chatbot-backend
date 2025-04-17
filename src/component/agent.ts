import { BaseMessage } from '@langchain/core/messages';

export async function agentStream(graph: any, message: any, thread_id: string) {
  let inputs = { messages: [{ role: 'user', content: message }] };
  let lastMessage!: BaseMessage;

  const threadConfig = {
    configurable: { thread_id: thread_id },
    streamMode: 'values' as const,
  };

  for await (const step of await graph.stream(inputs, threadConfig)) {
    lastMessage = step.messages.at(-1);
  }

  return lastMessage;
}
