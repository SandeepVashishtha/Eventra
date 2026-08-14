import { useMemo, useState } from "react";
import { FolderPlus, Search } from "lucide-react";
import BookmarkCollectionCard from "./BookmarkCollectionCard";
import {
  createCollection,
  renameCollection,
  deleteCollection,
  searchCollections,
  sortCollections,
} from "../../utils/bookmarkCollectionUtils";

const BookmarkCollections = ({
  collections = [],
  onCollectionsChange,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [newCollectionName, setNewCollectionName] = useState("");
  const [expandedCollectionId, setExpandedCollectionId] = useState(null);

  const filteredCollections = useMemo(() => {
    const searched = searchCollections(collections, searchQuery);
    return sortCollections(searched);
  }, [collections, searchQuery]);

  const handleCreate = () => {
    if (!newCollectionName.trim()) return;

    const updated = createCollection(
      collections,
      newCollectionName.trim()
    );

    onCollectionsChange?.(updated);
    setNewCollectionName("");
  };

  const handleRename = (collection) => {
    const name = window.prompt(
      "Rename collection",
      collection.name
    );

    if (!name || !name.trim()) return;

    const updated = renameCollection(
      collections,
      collection.id,
      name.trim()
    );

    onCollectionsChange?.(updated);
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Delete this collection?"
    );

    if (!confirmed) return;

    const updated = deleteCollection(
      collections,
      id
    );

    onCollectionsChange?.(updated);
  };

  const handleView = (collection) => {
    setExpandedCollectionId((prev) =>
      prev === collection.id ? null : collection.id
    );
  };

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg p-6">

      {/* Header */}

      <div className="flex items-center gap-3 mb-6">

        <FolderPlus
          size={28}
          className="text-indigo-600"
        />

        <div>

          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Bookmark Collections
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Organize your saved events into collections.
          </p>

        </div>

      </div>

      {/* Create Collection */}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">

        <input
          type="text"
          placeholder="Collection name..."
          value={newCollectionName}
          onChange={(e) =>
            setNewCollectionName(e.target.value)
          }
          className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          onClick={handleCreate}
          className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition"
        >
          Create
        </button>

      </div>

      {/* Search */}

      <div className="relative mb-8">

        <Search
          size={18}
          className="absolute left-3 top-3.5 text-slate-400"
        />

        <input
          type="text"
          placeholder="Search collections..."
          value={searchQuery}
          onChange={(e) =>
            setSearchQuery(e.target.value)
          }
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
        />

      </div>

      {/* Collection Grid */}

      {filteredCollections.length === 0 ? (
        <div className="text-center py-12">

          <FolderPlus
            size={56}
            className="mx-auto text-slate-400 mb-4"
          />

          <h3 className="text-lg font-semibold text-slate-700 dark:text-white">
            No Collections Found
          </h3>

          <p className="text-slate-500 mt-2">
            Create your first bookmark collection to organize events.
          </p>

        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {filteredCollections.map((collection) => (
            <BookmarkCollectionCard
              key={collection.id}
              collection={collection}
              expanded={expandedCollectionId === collection.id}
              onRename={handleRename}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}

        </div>
      )}

    </section>
  );
};

export default BookmarkCollections;