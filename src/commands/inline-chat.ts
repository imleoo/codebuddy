import { formatText } from "../utils/utils";
import { EventGenerator } from "./event-generator";
import * as vscode from "vscode";

export class InLineChat extends EventGenerator {
  selectedCode: string | undefined;
  constructor(action: string, context: vscode.ExtensionContext) {
    super(action, context);
  }

  getCurrentActiveEditorCode(): string | undefined {
    const editor = vscode.window.activeTextEditor;
    return editor ? editor?.document?.getText() : undefined;
  }

  formatResponse(comment: string): string {
    return formatText(comment);
  }

  async createPrompt(selectedCode: string): Promise<string> {
    const x = await this.getUserInLineChat();
    let context = this.getCurrentActiveEditorCode() ?? "";
    const fullPrompt = `${x} ${selectedCode} \n Here is the code context ${context}`;
    return fullPrompt;
  }
}
