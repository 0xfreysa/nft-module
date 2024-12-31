import {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources";

export type ChatMessage = Array<ChatCompletionMessageParam>;
export type ChatTool = ChatCompletionTool;
