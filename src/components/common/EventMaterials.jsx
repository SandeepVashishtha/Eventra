const EventMaterials = ({ materials }) => {
  if (!materials || materials.length === 0) return null;

  const getIcon = (type) => {
    if (type === 'pdf') return '📄';
    if (type === 'ppt') return '📊';
    if (type === 'doc') return '📝';
    if (type === 'video') return '🎥';
    return '📎';
  };

  const getColor = (type) => {
    if (type === 'pdf') return 'text-red-500 bg-red-50 dark:bg-red-900/20';
    if (type === 'ppt') return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
    if (type === 'doc') return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
    return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
          <span className="text-2xl">📚</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Event Resources</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Download materials from this event</p>
        </div>
      </div>
      <div className="space-y-3">
        {materials.map((material) => (
          <div key={material.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg text-xl ${getColor(material.type)}`}>
                {getIcon(material.type)}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{material.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${getColor(material.type)}`}>{material.type}</span>
                  <span className="text-xs text-gray-400">{material.size}</span>
                </div>
              </div>
            </div>
            <a href={material.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors duration-200">
              ⬇️ Download
            </a>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
        Materials shared by event organizers • For attendees only
      </p>
    </div>
  );
};

export default EventMaterials;