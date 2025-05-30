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

export function toolCalling(
  smalltalk: DynamicStructuredTool,
  retrieve: DynamicStructuredTool,
  llm: ChatOpenAI,
) {
  async function queryOrRespond(state: typeof MessagesAnnotation.State) {
    const llmWithTools = llm.bindTools([retrieve, smalltalk]);
    const response = await llmWithTools.invoke(state.messages);
    return { messages: [response] };
  }

  const tools = new ToolNode([retrieve, smalltalk]);

  async function generate(state: typeof MessagesAnnotation.State) {
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
    const docsContent = toolMessages.map((doc) => doc.content).join('\n');

    if (!docsContent.trim()) {
      return {
        messages: [
          new AIMessage(
            "Hmm, I couldn't find any relevant telecom info to help with that. 📡 Could you rephrase or ask about specific services?",
          ),
        ],
      };
    }

    const conversationMessages = state.messages.filter(
      (message) =>
        message instanceof HumanMessage ||
        message instanceof SystemMessage ||
        (message instanceof AIMessage && message.tool_calls.length == 0),
    );

    const systemMessageContent = systemPrompt + '\n\n' + `${docsContent}`;

    const prompt = [
      new SystemMessage(systemMessageContent),
      ...conversationMessages,
    ];

    // Run

    const response = await llm.invoke(prompt);

    return { messages: [response] };
  }

  const checkpointer = new MemorySaver();
  return graphBuilder(queryOrRespond, tools, generate).compile({
    checkpointer,
  });
}
