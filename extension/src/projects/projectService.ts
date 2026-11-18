import { Project } from './project';

/** Boundary for obtaining projects; later phases can replace this with local or remote services. */
export interface ProjectService {
  getProjects(): Promise<readonly Project[]>;
}
