import { BaseMessage } from '@langchain/core/messages';
import { END } from '@langchain/langgraph';

export function customToolsCondition(state: { messages: BaseMessage[] }) {
  const last = state.messages[state.messages.length - 1];

  // If message is from the AI and has tool calls, go to tools
  if (
    last.getType() === 'ai' &&
    'tool_calls' in last &&
    Array.isArray(last.tool_calls) &&
    last.tool_calls.length > 0
  ) {
    return 'tools';
  }

  return END;
}
