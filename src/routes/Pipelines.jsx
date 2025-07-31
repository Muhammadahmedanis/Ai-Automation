import { useEffect, useState, useRef } from "react";
import { usePipelineQuery } from "../reactQuery/hooks/usePipelineQuery";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Pipeline stages
const pipelineStages = [
  { name: "New", color: "bg-slate-300" },
  { name: "Discovery", color: "bg-[#ffbb74db]" },
  { name: "Evaluation", color: "bg-slate-300" },
  { name: "Proposal", color: "bg-[#ffbb74db]" },
  { name: "Negotiation", color: "bg-slate-300" },
  { name: "Commit", color: "bg-[#ffbb74db]" },
  { name: "Closed Won", color: "bg-green-300" },
  { name: "Closed Lost", color: "bg-red-300" },
];

// Draggable Lead Card Component
const SortableLeadCard = ({ lead, stage }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lead.id,
    data: {
      type: "lead",
      lead,
      stage,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group rounded-xl transition-all md:w-full w-60 hover:bg-gray-400 hover:text-white bg-white cursor-grab active:cursor-grabbing mb-3 h-32 flex-shrink-0"
    >
      <div className="flex items-center gap-3 px-4 py-2">
        <img
          src="/Boy.png"
          alt="Profile"
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{lead.Name}</p>
          <p className="text-xs group-hover:text-white text-gray-500 truncate">
            {lead.Title}
          </p>
        </div>
      </div>
      <div className="px-4 pb-2">
        <p className="text-xs group-hover:text-white text-gray-500 truncate">
          @ {lead.Company}
        </p>
        <p className="text-xs group-hover:text-white text-gray-500 truncate">
          {lead.Phone}
        </p>
        <p className="text-xs group-hover:text-white text-gray-500 truncate">
          {lead.Email}
        </p>
      </div>
    </div>
  );
};

// Static Lead Card for Drag Overlay
const LeadCard = ({ name, phone, email, title, company }) => {
  return (
    <div className="group rounded-xl transition-all md:w-40 w-full bg-white shadow-lg">
      <div className="flex items-center gap-3 px-4 py-3">
        <img src="/Boy.png" alt="Profile" className="w-10 h-10 rounded-full" />
        <div>
          <p className="">{name}</p>
          <p className="text-sm text-gray-500">
            {title} @ {company}
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-2 px-4">{phone}</p>
      <p className="text-sm text-gray-500 px-4 overflow-hidden text-ellipsis pb-4">
        {email}
      </p>
    </div>
  );
};

// Droppable Stage Container
const StageContainer = ({ stage, children, leadCount }) => {
  const scrollContainerRef = useRef(null);
  const [currentScrollIndex, setCurrentScrollIndex] = useState(0);
  const leadsPerView = 3; // Number of leads to show at once
  const leadHeight = 140; // Approximate height of each lead card including gap

  const { setNodeRef, isOver } = useDroppable({
    id: `stage-${stage.name}`,
    data: {
      type: "stage",
      stageName: stage.name,
    },
  });

  const canScrollUp = currentScrollIndex > 0;
  const canScrollDown = currentScrollIndex + leadsPerView < leadCount;

  const scrollUp = () => {
    if (canScrollUp) {
      const newIndex = Math.max(0, currentScrollIndex - leadsPerView);
      setCurrentScrollIndex(newIndex);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: newIndex * leadHeight,
          behavior: "smooth",
        });
      }
    }
  };

  const scrollDown = () => {
    if (canScrollDown) {
      const newIndex = Math.min(
        Math.max(0, leadCount - leadsPerView),
        currentScrollIndex + leadsPerView
      );
      setCurrentScrollIndex(newIndex);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: newIndex * leadHeight,
          behavior: "smooth",
        });
      }
    }
  };

  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const newIndex = Math.round(scrollTop / leadHeight);
    setCurrentScrollIndex(newIndex);
  };

  return (
    <div key={stage.name} className="flex justify-center">
      <div className="w-full md:max-w-[180px] flex flex-col items-center">
        <div
          className={`p-3 rounded-lg text-center ${stage.color} md:w-44 w-full h-10 flex items-center justify-center`}
        >
          {stage.name}
        </div>

        {/* Navigation Controls */}
        <div className="relative w-full">
          {/* Up Button */}
          {leadCount > leadsPerView && (
            <button
              onClick={scrollUp}
              disabled={!canScrollUp}
              className={`absolute left-1/2 transform -translate-x-1/2 z-8 w-[80%] h-6 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${
                canScrollUp
                  ? "text-white bg-[#16C47F] hover:bg-[#14b574] cursor-pointer shadow-lg"
                  : "bg-gradient-to-b from-gray-200 to-gray-300 text-gray-400 cursor-not-allowed"
              }`}
            >
              ↑
            </button>
          )}

          {/* Scrollable Container */}
          <div
            ref={(node) => {
              setNodeRef(node);
              scrollContainerRef.current = node;
            }}
            onScroll={handleScroll}
            className={`space-y-3 mt-3 p-1 rounded-lg w-full transition-colors overflow-y-auto scrollbar-hide ${
              isOver ? "bg-gray-200" : ""
            }`}
            style={{
              height: `${leadsPerView * leadHeight}px`,
              minHeight: `${leadsPerView * leadHeight}px`,
            }}
          >
            {children}
          </div>

          {/* Down Button */}
          {leadCount > leadsPerView && (
            <button
              onClick={scrollDown}
              disabled={!canScrollDown}
              className={`absolute left-1/2 transform -translate-x-1/2 z-8 w-[80%] h-6 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${
                canScrollDown
                  ? "text-white bg-[#FF9D23] hover:bg-[#e68a1f] cursor-pointer shadow-lg"
                  : "bg-gradient-to-b from-gray-200 to-gray-300 text-gray-400 cursor-not-allowed hover"
              }`}
            >
              ↓
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Pipelines = () => {
  const { allLeads, changeLeadStatus } = usePipelineQuery();
  const [leadsByStage, setLeadsByStage] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [activeLead, setActiveLead] = useState(null);
  const [activeStage, setActiveStage] = useState(null);

  // Set up sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // localStorage.removeItem("token")
    console.log("Initializing");
    if (allLeads?.leads) {
      console.log(allLeads.leads);
      // Group leads by their status (pipeline stage)
      const groupedLeads = allLeads.leads.reduce((acc, lead) => {
        const status = lead.Status;

        if (!acc[status]) {
          acc[status] = [];
        }

        acc[status].push(lead);
        return acc;
      }, {});

      console.log("Grouped Leads", groupedLeads); // Add this

      // Initialize empty arrays for stages with no leads
      pipelineStages.forEach((stage) => {
        if (!groupedLeads[stage.name]) {
          groupedLeads[stage.name] = [];
        }
      });

      setLeadsByStage(groupedLeads);
    }
  }, [allLeads]);

  // Handle drag start
  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    setActiveLead(active.data.current?.lead);
    setActiveStage(active.data.current?.stage);
  };

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) {
      // Dropped outside a droppable area
      setActiveId(null);
      setActiveLead(null);
      setActiveStage(null);
      return;
    }

    // Get the data from the active and over elements
    const activeData = active.data.current;
    const overData = over.data.current;

    // Check if we're dropping on a stage
    if (overData?.type === "stage") {
      const newStage = overData.stageName;
      const oldStage = activeStage;

      // Only proceed if the stage has changed
      if (newStage !== oldStage) {
        // Move lead to new stage
        setLeadsByStage((prev) => {
          const updatedLeads = { ...prev };

          // Find and remove lead from old stage
          const leadIndex = updatedLeads[oldStage].findIndex(
            (lead) => lead.id === active.id
          );
          if (leadIndex !== -1) {
            const [movedLead] = updatedLeads[oldStage].splice(leadIndex, 1);

            // Update lead status to new stage
            movedLead.status = newStage;

            // Add lead to new stage
            updatedLeads[newStage].push(movedLead);
          }

          return updatedLeads;
        });

        // Here you would typically call an API to update the lead's status
        console.log(`Moved lead ${active.id} from ${oldStage} to ${newStage}`);
        // Example API call (uncomment and adapt as needed):
        // updateLeadStatus(active.id, newStage);
        changeLeadStatus({ id: active.id, status: newStage });
      }
    }

    // Reset active states
    setActiveId(null);
    setActiveLead(null);
    setActiveStage(null);
  };

  // if (isLoading) return <p className="p-6">Loading leads...</p>
  // if (isError) return <p>Error fetching leads.</p>

  return (
    <div className="px-[10px] pt-[30px] bg-gray-100 min-h-screen overflow-x-auto flex justify-center">
      <div className="w-full max-w-[1600px]">
        <h1 className="text-3xl font-bold">Lead's Pipeline</h1>
        <p className="text-gray-500 mb-6">
          Monitor the current stage of each lead in the sales process.
        </p>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToWindowEdges]}
        >
          <div className="grid xl:grid-cols-8 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 justify-items-center">
            {pipelineStages.map((stage) => (
              <StageContainer
                key={stage.name}
                stage={stage}
                leadCount={leadsByStage[stage.name]?.length || 0}
              >
                <SortableContext
                  items={leadsByStage[stage.name]?.map((lead) => lead.id) || []}
                  strategy={verticalListSortingStrategy}
                >
                  {Array.isArray(leadsByStage[stage.name]) &&
                  leadsByStage[stage.name].length > 0 ? (
                    leadsByStage[stage.name].map((lead) => (
                      <SortableLeadCard
                        key={lead.id}
                        lead={lead}
                        stage={stage.name}
                      />
                    ))
                  ) : (
                    <div className="p-2 text-center text-gray-500 h-32 flex items-center justify-center">
                      No leads for this stage.
                    </div>
                  )}
                </SortableContext>
              </StageContainer>
            ))}
          </div>

          {/* Drag Overlay - shows while dragging */}
          <DragOverlay
            // adjustScale={true}
            modifiers={[restrictToWindowEdges]}
            dropAnimation={{
              duration: 250,
              easing: "cubic-bezier(0.2, 0, 0, 1)",
            }}
          >
            {activeId && activeLead ? (
              <LeadCard
                name={activeLead.Name}
                phone={activeLead.Phone}
                email={activeLead.Email}
                title={activeLead.Title}
                company={activeLead.Company}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default Pipelines;
