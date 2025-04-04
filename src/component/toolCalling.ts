import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from '@langchain/core/messages';

import { MemorySaver, MessagesAnnotation } from '@langchain/langgraph';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { ChatOpenAI } from '@langchain/openai';
import { systemPrompt } from './systemPrompt';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { graphBuilder } from './graphBuilder';
import { ConversationChain } from 'langchain/chains';

export function toolCalling(
  retrieve: DynamicStructuredTool,
  llm: ChatOpenAI,
  memory: any,
) {
  async function queryOrRespond(state: typeof MessagesAnnotation.State) {
    const llmWithTools = llm.bindTools([retrieve]);
    const response = await llmWithTools.invoke(state.messages);
    console.log(response, state.messages);

    return { messages: [response] };
  }
  const tools = new ToolNode([retrieve]);

  async function generate(state: typeof MessagesAnnotation.State) {
    console.log(state);

    // Get generated ToolMessages
    let recentToolMessages = [];
    for (let i = state['messages'].length - 1; i >= 0; i--) {
      let message = state['messages'][i];
      if (message instanceof ToolMessage) {
        recentToolMessages.push(message);
      } else {
        break;
      }
    }
    let toolMessages = recentToolMessages.reverse();

    // Format into prompt
    const docsContent = toolMessages.map((doc) => doc.content).join('\n');
    const systemMessageContent = systemPrompt + '\n\n' + `${docsContent}`;

    const conversationMessages = state.messages.filter(
      (message) =>
        message instanceof HumanMessage ||
        message instanceof SystemMessage ||
        (message instanceof AIMessage && message.tool_calls.length == 0),
    );
    const prompt = [
      new SystemMessage(systemMessageContent),
      ...conversationMessages,
    ];
    console.log(prompt);
    // Run

    const chain = new ConversationChain({
      llm,
      memory,
    });
    const response = await chain.call(prompt);
    console.log(response);
    return { messages: [response] };
  }

  const checkpointer = new MemorySaver();
  return graphBuilder(queryOrRespond, tools, generate).compile({
    checkpointer,
  });
}
