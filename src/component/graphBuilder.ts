import {
  END,
  MessagesAnnotation,
  START,
  StateGraph,
} from '@langchain/langgraph';
import { ToolNode, toolsCondition } from '@langchain/langgraph/prebuilt';

export function graphBuilder(
  queryOrRespond: any,
  tools: ToolNode,
  generate: any,
) {
  const graphBuilder = new StateGraph(MessagesAnnotation)
    .addNode('queryOrRespond', queryOrRespond)
    .addNode('tools', tools)
    .addNode('generate', generate);

  graphBuilder.addConditionalEdges('queryOrRespond', toolsCondition, {
    END,
    tools: 'tools',
  });

  graphBuilder
    .addEdge(START, 'queryOrRespond')
    .addEdge('tools', 'generate')
    .addEdge('generate', END);

  return graphBuilder;
}
