import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import type { Job, JobStatus } from '../types';
import StatusBadge from './StatusBadge';
import { useStore } from '../store/useStore';
import { allStatuses, canTransition } from '../utils/statusMachine';
import { Link } from 'react-router-dom';

export default function KanbanBoard() {
  const entities = useStore(s => s.entities);
  const changeStatus = useStore(s => s.changeStatus);
  if (!entities) return null;

  const grouped: Record<JobStatus, Job[]> = Object.fromEntries(allStatuses.map(s => [s, []])) as any;
  entities.jobs.forEach(j => { grouped[j.status].push(j); });

  function onDragEnd(result: DropResult) {
    if (!entities) return; // TS narrow
    const { draggableId, destination, source } = result;
    if (!destination) return;
    const to = destination.droppableId as JobStatus;
    const from = source.droppableId as JobStatus;
    if (to === from) return;
    const job = entities.jobs.find(j => j.id === draggableId);
    if (!job) return;
    if (!canTransition(job.status, to)) return;
    changeStatus(job.id, to);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {allStatuses.filter(s => s !== 'On Hold' && s !== 'Cancelled').map(status => (
          <Droppable droppableId={status} key={status}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="card p-3 min-h-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">{status}</div>
                  <div className="text-xs opacity-60">{grouped[status].length}</div>
                </div>
                <div className="space-y-2">
                  {grouped[status].map((j, idx) => (
                    <Draggable draggableId={j.id} index={idx} key={j.id}>
                      {(p) => (
                        <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps} className="p-3 rounded-lg bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                          <div className="flex items-center justify-between">
                            <Link to={`/jobs/${j.id}`} className="font-medium hover:underline">{j.jobNo}</Link>
                            <StatusBadge status={j.status} />
                          </div>
                          <div className="text-xs opacity-70">{entities.customers.find(c=>c.id===j.customerId)?.name}</div>
                          <div className="text-xs">{j.profileCode ?? 'Profile TBC'} • Qty {j.qty ?? 1}</div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}