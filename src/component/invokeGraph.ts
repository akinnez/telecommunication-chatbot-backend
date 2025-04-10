import { v4 as uuidv4 } from 'uuid';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';

type InvokeOptions = {
  graph: any;
  message: string;
  sessionId?: string; // Optional session key
  stream?: boolean;
  onToken?: (message: BaseMessage) => void; // Optional streaming handler
};

export async function invokeWithMemory({
  graph,
  message,
  sessionId,
  stream = false,
  onToken,
}: InvokeOptions): Promise<BaseMessage[]> {
  let messages = { messages: [new HumanMessage({ content: message })] };
  //   let inputs = { messages: [{ role: 'user', content: input }] };
  const thread_id = sessionId ?? uuidv4();

  const config = {
    configurable: {
      thread_id, // 🧠 key used for LangGraph memory
    },
    streamMode: stream ? ('values' as const) : undefined,
  };

  let lastMessage!: BaseMessage;
  let newMessage = [];

  //   if (stream) {
  //     for await (const step of await graph.stream(messages, config)) {
  //       for (const msg of step.messages) {
  //         if (msg) {
  //           lastMessage = msg;
  //           onToken?.(msg); // Emit streamed token
  //         }
  //       }
  //     }
  //   } else {
  //     const result = await graph.invoke(messages, config);
  //     console.log(result.messages);

  //     for (const msg of result.messages) {
  //       lastMessage = msg;
  //     }
  //   }

  const results = [];
  for await (const step of await graph.stream(messages, {
    configurable: { thread_id: sessionId },
  })) {
    for (const msg of step) {
      results.push(msg.message);
    }
  }
  return results;
  //   return lastMessage;
}
