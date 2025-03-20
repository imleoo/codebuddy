import * as markdownit from "markdown-it";
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
    return md.render(text);
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
export const getGeminiAPIKey = (): string => {
  const { geminiKey } = APP_CONFIG;
  const apiKey = getConfigValue(geminiKey);
  if (!apiKey) {
    console.error("Gemini API Key is required for code indexing");
    throw new Error("Gemini API Key is required for code indexing");
  }
  return apiKey;
};
