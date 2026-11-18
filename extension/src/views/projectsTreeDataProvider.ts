import * as vscode from 'vscode';
import { Project } from '../projects/project';
import { ProjectService } from '../projects/projectService';

type ProjectTreeElement = ProjectItem | EmptyStateItem | ErrorStateItem;

export class ProjectsTreeDataProvider implements vscode.TreeDataProvider<ProjectTreeElement>, vscode.Disposable {
  private readonly changeEmitter = new vscode.EventEmitter<ProjectTreeElement | undefined>();
  public readonly onDidChangeTreeData = this.changeEmitter.event;

  public constructor(
    private readonly projectService: ProjectService,
    private readonly reportError: (message: string) => Thenable<string | undefined> = vscode.window.showErrorMessage
  ) {}

  public refresh(): void {
    this.changeEmitter.fire(undefined);
  }

  public getTreeItem(element: ProjectTreeElement): vscode.TreeItem {
    return element;
  }

  public async getChildren(element?: ProjectTreeElement): Promise<ProjectTreeElement[]> {
    if (element) {
      return [];
    }

    try {
      const projects = await this.projectService.getProjects();
      return projects.length === 0 ? [new EmptyStateItem()] : projects.map((project) => new ProjectItem(project));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      void this.reportError(`Sandbox could not load projects: ${message}`);
      return [new ErrorStateItem()];
    }
  }

  public dispose(): void {
    this.changeEmitter.dispose();
  }
}

export class ProjectItem extends vscode.TreeItem {
  public constructor(readonly project: Project) {
    super(project.name, vscode.TreeItemCollapsibleState.None);
    this.id = project.id;
    this.description = project.description;
    this.tooltip = project.description ?? project.name;
    this.contextValue = 'sandbox.project';
    this.iconPath = new vscode.ThemeIcon('folder');
    this.command = {
      command: 'sandbox.openProject',
      title: 'Open Project',
      arguments: [project]
    };
  }
}

class EmptyStateItem extends vscode.TreeItem {
  public constructor() {
    super('No projects yet', vscode.TreeItemCollapsibleState.None);
    this.description = 'Create a project when scaffolding is available.';
    this.contextValue = 'sandbox.emptyState';
    this.iconPath = new vscode.ThemeIcon('info');
  }
}

class ErrorStateItem extends vscode.TreeItem {
  public constructor() {
    super('Unable to load projects', vscode.TreeItemCollapsibleState.None);
    this.description = 'Use Refresh Projects to try again.';
    this.contextValue = 'sandbox.errorState';
    this.iconPath = new vscode.ThemeIcon('warning');
  }
}
