import { format, isPast, parseISO } from 'date-fns';
import { Calendar, User, AlertCircle } from 'lucide-react';

const priorityClass = { LOW: 'low', MEDIUM: 'medium', HIGH: 'high' };
const statusClass = { TODO: 'todo', IN_PROGRESS: 'in-progress', DONE: 'done' };
const statusLabel = { TODO: 'Todo', IN_PROGRESS: 'In Progress', DONE: 'Done' };

export default function TaskCard({ task, onClick }) {
  const isOverdue = task.dueDate && task.status !== 'DONE' && isPast(parseISO(task.dueDate));

  return (
    <div className="task-card" onClick={() => onClick(task)}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <span className={`badge badge-${priorityClass[task.priority]}`}>{task.priority}</span>
        <span className={`badge badge-${statusClass[task.status]}`}>{statusLabel[task.status]}</span>
      </div>
      <div className="task-card-title">{task.title}</div>
      {task.description && <div className="task-card-desc">{task.description}</div>}
      <div className="task-card-meta">
        <div className="task-card-assignee">
          <User size={12} />
          {task.assignee ? task.assignee.name : <span style={{ color: 'var(--text-dim)' }}>Unassigned</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {task.dueDate && (
            <span className={isOverdue ? 'overdue-tag' : 'task-card-assignee'}>
              {isOverdue && <AlertCircle size={11} />}
              <Calendar size={11} />
              {format(parseISO(task.dueDate), 'MMM d')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
