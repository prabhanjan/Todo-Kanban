export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in-progress' | 'review' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  tags: string[];
  createdAt: number;
}

export interface ColumnDef {
  id: Status;
  title: string;
  color: string;
}

export interface AITaskSuggestion {
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  tags?: string[];
}
