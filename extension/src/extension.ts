import * as vscode from 'vscode';
import { registerCommands } from './commands/registerCommands';
import { MockProjectService } from './projects/mockProjectService';
import { ProjectsTreeDataProvider } from './views/projectsTreeDataProvider';

/** Creates and registers the Phase 1 extension composition root. */
export function activate(context: vscode.ExtensionContext): void {
  const projectService = new MockProjectService();
  const projectsTreeDataProvider = new ProjectsTreeDataProvider(projectService);

  context.subscriptions.push(
    projectsTreeDataProvider,
    vscode.window.registerTreeDataProvider('sandbox.myProjects', projectsTreeDataProvider)
  );

  registerCommands(context, projectsTreeDataProvider);
}

export function deactivate(): void {
  // All registered resources are disposed through ExtensionContext subscriptions.
}
