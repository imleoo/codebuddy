import markdownit from "markdown-it";
import * as vscode from "vscode";
import {
  APP_CONFIG,
  COMMON,
  generativeAiModels,
} from "../application/constant";
import Anthropic from "@anthropic-ai/sdk";
import { Memory } from "../memory/base";

type GetConfigValueType<T> = (key: string) => T | undefined;

export const formatText = (text?: string): string => {
  if (text) {
    const md = markdownit();
    const renderedText = md.render(text);
    return renderedText;
  }
  return "";
};

export const getConfigValue: GetConfigValueType<any> = <T>(
  key: string,
): T | undefined => {
  return vscode.workspace.getConfiguration().get<T>(key);
};

export const vscodeErrorMessage = (error: string, metaData?: any) => {
  return vscode.window.showErrorMessage(error);
};

export const getLatestChatHistory = (key: string) => {
  let chatHistory = Memory.has(key) ? Memory.get(key) : [];
  if (chatHistory?.length > 3) {
    chatHistory = chatHistory.slice(-3);
  }
  return chatHistory;
};

export const resetChatHistory = (model: string) => {
  switch (model) {
    case generativeAiModels.ANTHROPIC:
      Memory.set(COMMON.ANTHROPIC_CHAT_HISTORY, []);
      break;
    case generativeAiModels.GEMINI:
      Memory.set(COMMON.GEMINI_CHAT_HISTORY, []);
      break;
    case generativeAiModels.GROQ:
      Memory.set(COMMON.GROQ_CHAT_HISTORY, []);
      break;
    default:
      break;
  }
};

export const getXGroKBaseURL = () => {
  return "https://api.x.ai/";
};

export const createAnthropicClient = (apiKey: string, baseURL?: string) => {
  if (baseURL) {
    return new Anthropic({
      apiKey,
      baseURL,
    });
  }
  return new Anthropic({
    apiKey,
  });
};

export const getGenerativeAiModel = (): string | undefined => {
  return getConfigValue("generativeAi.option");
};

export function getUri(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  pathList: string[],
) {
  return webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, ...pathList));
}

// This function generates a random 32-character string (nonce) using alphanumeric characters
// A nonce is a unique, random value used for security purposes, typically to prevent replay attacks
// and ensure script integrity when using Content Security Policy (CSP)
export const getNonce = () => {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

export const handleError = (error: unknown, message?: string): void => {
  const errorMessage = error instanceof Error ? error.message : "Unknown Error";
  vscode.window.showErrorMessage(`${message}, ${errorMessage}`);
};

export const handleWarning = (message?: string, args?: string): void => {
  vscode.window.showWarningMessage(`${message}, ${args}`);
};

export const showInfoMessage = (message?: string): void => {
  vscode.window.showInformationMessage(`${message}`);
};

/**
 * Retrieves the Gemini API key from the application configuration, which is required for code indexing.
 * @returns {string} The API key.
 */
/**
 * Retrieves the API key and model name based on the provided model identifier.
 * @param {string} model - The identifier of the model (e.g., "gemini", "groq", "anthropic").
 * @returns {APIKeyConfig} An object containing the API key and the model name.
 * @throws {Error} If the API key is not found in the configuration.
 */
export const getAPIKeyAndModel = (
  model: string,
): { apiKey: string; model?: string } => {
  const {
    geminiKey,
    groqApiKey,
    groqModel,
    anthropicApiKey,
    geminiModel,
    anthropicModel,
  } = APP_CONFIG;
  let apiKey: string | undefined;
  let modelName: string | undefined;

  const lowerCaseModel = model.toLowerCase();

  switch (lowerCaseModel) {
    case "gemini":
      apiKey = getConfigValue(geminiKey);
      modelName = getConfigValue(geminiModel);
      break;
    case "groq":
      apiKey = getConfigValue(groqApiKey);
      modelName = getConfigValue(groqModel);
      break;
    case "anthropic":
      apiKey = getConfigValue(anthropicApiKey);
      modelName = getConfigValue(anthropicModel);
      break;
    default:
      throw new Error(`Unsupported model: ${model}`);
  }

  if (!apiKey) {
    throw new Error(
      `API key not found for model: ${model}. Please add the API key in the extension configuration.`,
    );
  }

  return { apiKey, model: modelName };
};

export const generateQueryString = (query: string) =>
  `q=${encodeURIComponent(query)}`;
