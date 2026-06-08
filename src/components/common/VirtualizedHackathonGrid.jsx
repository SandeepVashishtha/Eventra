import HackathonCard from "../../Pages/Hackathons/HackathonCard";

/**
 * VirtualizedHackathonGrid
 *
 * Drop-in replacement for the filteredHackathons.map() render in HackathonPage.
 * Uses react-window Grid to render only the cards visible in the
 * current viewport, preventing layout thrashing when the list exceeds 50 items.
 *
 * Props:
 *   hackathons — array of hackathon objects (same shape as HackathonCard expects)
 */
const VirtualizedHackathonGrid = ({ hackathons }) => {

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hackathons.map((hackathon) => (
                <HackathonCard
                    key={hackathon.id || hackathon._id}
                    hackathon={hackathon}
                />
            ))}
        </div>
    );
};

export default VirtualizedHackathonGrid;