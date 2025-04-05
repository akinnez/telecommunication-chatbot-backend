import { BaseMessage } from '@langchain/core/messages';

import { v4 as uuidv4 } from 'uuid';

export async function agentStream(agent: any, message: any) {
  let inputs = { messages: [{ role: 'user', content: message }] };
  let lastMessage!: BaseMessage;

  const threadConfig = {
    configurable: { thread_id: uuidv4() },
    streamMode: 'values' as const,
  };

  for await (const step of await agent.stream(inputs, threadConfig)) {
    lastMessage = step.messages[step.messages.length - 1];
  }
  return lastMessage;
}
