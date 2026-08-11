import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const initialData = {
  unassigned: [
    { id: 'p-1', name: 'Alex Chen', role: 'Frontend' },
    { id: 'p-2', name: 'Samira Patel', role: 'Backend' },
    { id: 'p-3', name: 'Jordan Lee', role: 'UI/UX' },
  ],
  teams: [
    {
      id: 'team-1',
      name: 'Team Alpha',
      members: [{ id: 'p-4', name: 'Taylor Swift', role: 'Fullstack' }],
    },
    {
      id: 'team-2',
      name: 'Team Beta',
      members: [],
    },
  ],
};

export const TeamAllocationBoard = ({ onAllocationChange }) => {
  const [boardData, setBoardData] = useState(initialData);

  const handleOnDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const newData = JSON.parse(JSON.stringify(boardData));
    let movedItem;

    // Remove from source
    if (source.droppableId === 'unassigned') {
      [movedItem] = newData.unassigned.splice(source.index, 1);
    } else {
      const sourceTeam = newData.teams.find((t) => t.id === source.droppableId);
      [movedItem] = sourceTeam.members.splice(source.index, 1);
    }

    // Add to destination
    if (destination.droppableId === 'unassigned') {
      newData.unassigned.splice(destination.index, 0, movedItem);
    } else {
      const destTeam = newData.teams.find((t) => t.id === destination.droppableId);
      destTeam.members.splice(destination.index, 0, movedItem);
    }

    setBoardData(newData);
    if (onAllocationChange) onAllocationChange(newData);
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Team Allocation Board
      </h2>

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Unassigned Pool Column */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-3 text-indigo-600 dark:text-indigo-400">
              Unassigned Participants ({boardData.unassigned.length})
            </h3>
            <Droppable droppableId="unassigned">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3 min-h-[200px]"
                >
                  {boardData.unassigned.map((participant, index) => (
                    <Draggable key={participant.id} draggableId={participant.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="p-3 bg-gray-100 dark:bg-gray-700 rounded shadow-sm flex justify-between items-center cursor-grab"
                        >
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {participant.name}
                          </span>
                          <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded">
                            {participant.role}
                          </span>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* Dynamic Team Columns */}
          {boardData.teams.map((team) => (
            <div key={team.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-gray-100">
                {team.name} ({team.members.length} members)
              </h3>
              <Droppable droppableId={team.id}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3 min-h-[200px] border-2 border-dashed border-gray-200 dark:border-gray-700 p-2 rounded"
                  >
                    {team.members.map((member, index) => (
                      <Draggable key={member.id} draggableId={member.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="p-3 bg-indigo-50 dark:bg-gray-700 rounded shadow-sm flex justify-between items-center cursor-grab"
                          >
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {member.name}
                            </span>
                            <span className="text-xs px-2 py-1 bg-indigo-200 text-indigo-900 rounded">
                              {member.role}
                            </span>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default TeamAllocationBoard;
