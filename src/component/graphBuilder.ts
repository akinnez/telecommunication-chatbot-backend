import {
  END,
  MessagesAnnotation,
  START,
  StateGraph,
} from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { customToolsCondition } from './customeToolConditios';

export function graphBuilder(
  queryOrRespond: any,
  tools: ToolNode,
  generate: any,
) {
  const graphBuilder = new StateGraph(MessagesAnnotation)
    .addNode('queryOrRespond', queryOrRespond)
    .addNode('tools', tools)
    .addNode('generate', generate);

  graphBuilder.addConditionalEdges('queryOrRespond', customToolsCondition);

  graphBuilder
    .addEdge(START, 'queryOrRespond')
    .addEdge('tools', 'generate')
    .addEdge('generate', 'queryOrRespond')
    .addEdge('queryOrRespond', END);

  return graphBuilder;
}
