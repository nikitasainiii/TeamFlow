import TaskCard from './TaskCard';

const COLUMNS = [
  { id: 'TODO', label: 'To Do', dotClass: 'col-dot-todo' },
  { id: 'IN_PROGRESS', label: 'In Progress', dotClass: 'col-dot-progress' },
  { id: 'DONE', label: 'Done', dotClass: 'col-dot-done' },
];

import { Plus } from 'lucide-react';

export default function KanbanBoard({ tasks, onTaskClick, onAddTask }) {
  return (
    <div className="kanban">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id);
        return (
          <div key={col.id} className="kanban-col">
            <div className="kanban-col-header">
              <h3>
                <span className={`col-dot ${col.dotClass}`}></span>
                {col.label}
              </h3>
              <span className="col-count">{colTasks.length}</span>
            </div>
            <div className="kanban-col-body">
              {colTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                  No tasks
                </div>
              ) : (
                colTasks.map(task => (
                  <TaskCard key={task.id} task={task} onClick={onTaskClick} />
                ))
              )}
              {onAddTask && (
                <button 
                  onClick={() => onAddTask(col.id)}
                  style={{ width: '100%', padding: '8px', marginTop: '12px', background: 'transparent', border: '1px dashed var(--border)', borderRadius: '6px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem' }}
                >
                  <Plus size={14} /> Add Task
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
