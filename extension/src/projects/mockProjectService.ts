import { Project } from './project';
import { ProjectService } from './projectService';

const MOCK_PROJECTS: readonly Project[] = [
  {
    id: 'mock-inventory-dashboard',
    name: 'Inventory Dashboard',
    description: 'Vanilla JavaScript and Bootstrap prototype'
  },
  {
    id: 'mock-event-planner',
    name: 'Event Planner',
    description: 'Concept and interface exploration'
  }
];

/** Deterministic Phase 1 data source with no filesystem, network, or account dependency. */
export class MockProjectService implements ProjectService {
  public async getProjects(): Promise<readonly Project[]> {
    return MOCK_PROJECTS;
  }
}
