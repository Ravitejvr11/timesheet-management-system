export interface Project {
  id: number;
  name: string;
  code: string;
  clientName: string;
  isBillable: boolean;
  description?: string;
}

export enum ProjectStatus {
  Active = 1,
  Inactive = 2,
  Deleted = 3,
}
