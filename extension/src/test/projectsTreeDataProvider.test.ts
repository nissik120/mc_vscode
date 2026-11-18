import * as assert from 'assert';
import { Project } from '../projects/project';
import { ProjectService } from '../projects/projectService';
import { ProjectItem, ProjectsTreeDataProvider } from '../views/projectsTreeDataProvider';

class StaticProjectService implements ProjectService {
  public constructor(private readonly projects: readonly Project[]) {}

  public async getProjects(): Promise<readonly Project[]> {
    return this.projects;
  }
}

suite('ProjectsTreeDataProvider', () => {
  test('shows project names with folder icons', async () => {
    const provider = new ProjectsTreeDataProvider(
      new StaticProjectService([{ id: 'one', name: 'Example Project', description: 'Example description' }])
    );

    const children = await provider.getChildren();
    assert.strictEqual(children.length, 1);
    assert.ok(children[0] instanceof ProjectItem);
    assert.strictEqual(children[0].label, 'Example Project');
    assert.strictEqual(children[0].contextValue, 'sandbox.project');
    provider.dispose();
  });

  test('shows an empty state when there are no projects', async () => {
    const provider = new ProjectsTreeDataProvider(new StaticProjectService([]));

    const children = await provider.getChildren();
    assert.strictEqual(children.length, 1);
    assert.strictEqual(children[0].label, 'No projects yet');
    assert.strictEqual(children[0].contextValue, 'sandbox.emptyState');
    provider.dispose();
  });

  test('reports service errors and exposes a recoverable error state', async () => {
    let reportedMessage = '';
    const provider = new ProjectsTreeDataProvider(
      { getProjects: async (): Promise<readonly Project[]> => Promise.reject(new Error('Unavailable')) },
      async (message: string): Promise<string | undefined> => {
        reportedMessage = message;
        return undefined;
      }
    );

    const children = await provider.getChildren();
    assert.strictEqual(children[0].label, 'Unable to load projects');
    assert.match(reportedMessage, /Unavailable/);
    provider.dispose();
  });
});
