import * as vscode from 'vscode';
import { Project } from '../projects/project';
import { ProjectsTreeDataProvider } from '../views/projectsTreeDataProvider';

export function registerCommands(
  context: vscode.ExtensionContext,
  projectsTreeDataProvider: ProjectsTreeDataProvider
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('sandbox.createProject', async (): Promise<void> => {
      await vscode.window.showInformationMessage(
        'Project creation will be implemented in a later phase. No files were created.'
      );
    }),
    vscode.commands.registerCommand('sandbox.openProject', async (project?: Project): Promise<void> => {
      const subject = project?.name ? ` “${project.name}”` : '';
      await vscode.window.showInformationMessage(
        `Opening${subject} will be implemented in a later phase. No project was opened.`
      );
    }),
    vscode.commands.registerCommand('sandbox.refreshProjects', (): void => {
      projectsTreeDataProvider.refresh();
    }),
    vscode.commands.registerCommand('sandbox.showWelcome', async (): Promise<void> => {
      await vscode.window.showInformationMessage(
        'Welcome to Sandbox. This Phase 1 extension lists mock projects and has no account or backend connection.'
      );
    })
  );
}
