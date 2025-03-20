import * as vscode from "vscode";
import { Logger } from "../infrastructure/logger/logger";
import { Orchestrator } from "./../agents/orchestrator";

export class VSCodeSecretStorage {
  private readonly context: vscode.ExtensionContext;
  private readonly logger: Logger;
  private readonly orchestrator: Orchestrator;
  private static instance: VSCodeSecretStorage;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.logger = new Logger("VSCodeSecretStorage");
    this.orchestrator = Orchestrator.getInstance();
  }

  static getInstance(context: vscode.ExtensionContext) {
    if (!VSCodeSecretStorage.instance) {
      VSCodeSecretStorage.instance = new VSCodeSecretStorage(context);
    }
    return VSCodeSecretStorage.instance;
  }

  async get(key: string): Promise<string | undefined> {
    try {
      return await this.context.secrets.get(key);
    } catch (error) {
      this.logger.error(`Error retrieving secret for key: ${key}`, error);
      return undefined;
    }
  }

  async store(key: string, value: string): Promise<void> {
    try {
      if (value?.length > 0) {
        await this.context.secrets.store(key, value);
      }
    } catch (error) {
      this.logger.error(`Error storing secret for key: ${key}`, error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.context.secrets.delete(key);
    } catch (error) {
      this.logger.error(`Error deleting secret for key: ${key}`, error);
      throw error;
    }
  }

  onDidChange(): vscode.Disposable {
    return this.context.secrets.onDidChange((event) => {
      if (event.key.length > 0) {
        this.orchestrator.handleStatus({
          type: "onSecretChange",
          data: event.key,
          timestamp: new Date().toISOString(),
        });
      }
    });
  }
}
