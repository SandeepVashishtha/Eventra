/**
 * Example Components Using Guard
 *
 * This file demonstrates practical usage patterns for the Guard component
 * in real Eventra scenarios. Use these as templates for refactoring.
 */

import Guard from '../auth/Guard';
import { ROLES, PERMISSIONS } from '../../config/roles';

// ============================================================================
// Example 1: Event Card with Conditional Actions
// ============================================================================

/**
 * EventCard - Shows event details with role-based action buttons
 *
 * Demonstrates:
 * - Different permissions for different user roles
 * - Custom fallback UI for authentication requirement
 * - Self-contained permission logic for each action
 */
export function EventCard({ event, onEdit, onDelete, onRegister }) {
  return (
    <div className="event-card p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Event Info (Public) */}
      <h3 className="text-lg font-bold">{event.title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{event.description}</p>
      <p className="text-xs text-gray-500 mt-2">
        {event.date} • {event.location}
      </p>

      {/* Actions Section */}
      <div className="mt-4 flex gap-2">
        {/* Register - Anyone authenticated */}
        <Guard
          requireAuth={true}
          fallback={
            <button
              disabled
              className="px-3 py-1 bg-gray-300 text-gray-600 rounded text-sm"
              title="Login to register"
            >
              Register (Login Required)
            </button>
          }
        >
          <button
            onClick={() => onRegister(event.id)}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Register
          </button>
        </Guard>

        {/* Edit - Organizers and Admins */}
        <Guard requireRoles={[ROLES.ORGANIZER, ROLES.ADMIN]}>
          <button
            onClick={() => onEdit(event.id)}
            className="px-3 py-1 bg-amber-500 text-white rounded text-sm hover:bg-amber-600"
          >
            Edit
          </button>
        </Guard>

        {/* Delete - Admins only */}
        <Guard
          requireRole={ROLES.ADMIN}
          fallback={
            <button
              disabled
              className="px-3 py-1 bg-gray-300 text-gray-600 rounded text-sm"
              title="Admin only"
            >
              Delete
            </button>
          }
        >
          <button
            onClick={() => onDelete(event.id)}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Delete
          </button>
        </Guard>
      </div>
    </div>
  );
}

// ============================================================================
// Example 2: Admin Dashboard with Nested Guards
// ============================================================================

/**
 * AdminDashboard - Shows different sections based on user permissions
 *
 * Demonstrates:
 * - Nested guards for complex authorization
 * - Different fallback UIs
 * - Combining roles and permissions
 */
export function AdminDashboard() {
  return (
    <Guard
      requireRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}
      fallback={
        <div className="p-6 text-center text-red-600">
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p>You don't have admin permissions.</p>
        </div>
      }
    >
      <div className="space-y-6">
        {/* User Management - Available to all admins */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">User Management</h2>
          <UserManagementSection />
        </div>

        {/* Event Moderation - Requires specific permission */}
        <Guard
          requirePermissions={[PERMISSIONS.MODERATE_CONTENT]}
          fallback={
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-700">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Event moderation tools unavailable - insufficient permissions
              </p>
            </div>
          }
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Event Moderation</h2>
            <EventModerationSection />
          </div>
        </Guard>

        {/* System Config - SUPER_ADMIN only */}
        <Guard
          requireRole={ROLES.SUPER_ADMIN}
          fallback={null}
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border-2 border-red-500">
            <h2 className="text-xl font-bold mb-4 text-red-600">System Configuration</h2>
            <SystemConfigSection />
          </div>
        </Guard>
      </div>
    </Guard>
  );
}

// ============================================================================
// Example 3: Dashboard Route - Conditional Rendering
// ============================================================================

/**
 * DashboardPage - Shows different dashboards based on user role
 *
 * Demonstrates:
 * - Role-based page layout
 * - Fallback to user dashboard
 * - Clean alternative to ternary checks
 */
export function DashboardPage() {
  return (
    <div>
      {/* Show admin dashboard for admins/super-admins */}
      <Guard
        requireRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}
        fallback={<UserDashboard />}
      >
        <AdminDashboardContent />
      </Guard>
    </div>
  );
}

// ============================================================================
// Example 4: Analytics View with Permission Levels
// ============================================================================

/**
 * AnalyticsDashboard - Shows different analytics based on permissions
 *
 * Demonstrates:
 * - Multiple guards in sequence
 * - Requiring both role AND permission
 * - Graceful degradation for lower permissions
 */
export function AnalyticsDashboard() {
  return (
    <Guard
      requireRoles={[ROLES.ORGANIZER, ROLES.ADMIN]}
      fallback={
        <div className="p-6 text-center">
          <p className="text-gray-600">Analytics available to organizers and admins only.</p>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Basic metrics - Available to all organizers */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-bold mb-4">Event Statistics</h3>
          <BasicEventMetrics />
        </div>

        {/* Advanced analytics - Requires specific permission */}
        <Guard
          requirePermissions={[PERMISSIONS.VIEW_ANALYTICS]}
          fallback={null}
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4">Advanced Analytics</h3>
            <AdvancedEventMetrics />
          </div>
        </Guard>

        {/* System-wide analytics - ADMIN only with analytics permission */}
        <Guard
          requireRole={ROLES.ADMIN}
          requirePermissions={[PERMISSIONS.VIEW_ANALYTICS]}
          requirePermissionsMatch="all"
          fallback={null}
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4">System Analytics</h3>
            <SystemWideMetrics />
          </div>
        </Guard>
      </div>
    </Guard>
  );
}

// ============================================================================
// Example 5: Modal/Dialog with Authorization
// ============================================================================

/**
 * DeleteConfirmDialog - Shows different content based on permissions
 *
 * Demonstrates:
 * - Guard wrapping modal content
 * - Preventing unauthorized actions from showing UI
 * - Fallback with explanation
 */
export function DeleteConfirmDialog({ item, onConfirm, onCancel, requiredRole = ROLES.ADMIN }) {
  return (
    <Guard
      requireRole={requiredRole}
      fallback={
        <div className="p-6 text-center">
          <h3 className="text-lg font-bold text-red-600 mb-2">Authorization Required</h3>
          <p className="text-gray-600 mb-4">
            Only {requiredRole}s can delete this item.
          </p>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="p-6">
        <h3 className="text-lg font-bold text-red-600 mb-4">
          Confirm Deletion
        </h3>
        <p className="mb-6 text-gray-600">
          Are you sure you want to delete <strong>{item.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </Guard>
  );
}

// ============================================================================
// Example 6: Toolbar with Multiple Actions
// ============================================================================

/**
 * EventToolbar - Toolbar with role-based actions
 *
 * Demonstrates:
 * - Multiple guards in a toolbar layout
 * - Self-contained permission logic per action
 * - Easy to add/remove actions
 */
export function EventToolbar({ eventId }) {
  return (
    <div className="flex gap-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      {/* Share - Everyone authenticated */}
      <Guard
        requireAuth={true}
        fallback={
          <button disabled className="px-3 py-1 bg-gray-300 text-gray-600 rounded" title="Login required">
            Share
          </button>
        }
      >
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => shareEvent(eventId)}
        >
          Share
        </button>
      </Guard>

      {/* Export - Organizers and Admins */}
      <Guard requireRoles={[ROLES.ORGANIZER, ROLES.ADMIN]}>
        <button
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={() => exportEvent(eventId)}
        >
          Export
        </button>
      </Guard>

      {/* Publish - Organizers and Admins with publish permission */}
      <Guard
        requireRoles={[ROLES.ORGANIZER, ROLES.ADMIN]}
        requirePermissions={[PERMISSIONS.EDIT_EVENT]}
      >
        <button
          className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
          onClick={() => publishEvent(eventId)}
        >
          Publish
        </button>
      </Guard>

      {/* Archive - Admins only */}
      <Guard requireRole={ROLES.ADMIN}>
        <button
          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          onClick={() => archiveEvent(eventId)}
        >
          Archive
        </button>
      </Guard>

      {/* Delete - Super Admin only */}
      <Guard requireRole={ROLES.SUPER_ADMIN}>
        <button
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={() => deleteEvent(eventId)}
        >
          Delete
        </button>
      </Guard>
    </div>
  );
}

// ============================================================================
// Example 7: Feature Flag Pattern
// ============================================================================

/**
 * BetaFeatureSection - Shows beta features only for specific roles
 *
 * Demonstrates:
 * - Using Guard as a feature flag
 * - Gradual rollout based on roles
 * - Easy to remove when feature is general release
 */
export function BetaFeatureSection() {
  return (
    <Guard
      requireRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}
      fallback={null}
    >
      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded">
        <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded">
          BETA
        </span>
        <h4 className="text-sm font-bold mt-2">New Advanced Filters</h4>
        <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
          Try our new AI-powered event filters (admin preview).
        </p>
        <AdvancedFiltersPreview />
      </div>
    </Guard>
  );
}

// ============================================================================
// Example 8: Complex Conditional Logic
// ============================================================================

/**
 * AdminOnlyModeration - Shows different content based on admin status
 *
 * Demonstrates:
 * - Combining multiple conditions
 * - Different fallback for different scenarios
 * - Nested guards for permission hierarchy
 */
export function AdminOnlyModeration({ event }) {
  return (
    <Guard
      requireAuth={true}
      requireRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}
      fallback={
        <button disabled className="px-4 py-2 bg-gray-300 text-gray-600 rounded">
          Moderation (Admin Only)
        </button>
      }
    >
      {/* Standard admin moderation */}
      <div className="space-y-3">
        <Guard requirePermissions={[PERMISSIONS.MODERATE_CONTENT]} fallback={null}>
          <button
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            onClick={() => flagEvent(event.id)}
          >
            Flag Content
          </button>
        </Guard>

        {/* SUPER_ADMIN only features */}
        <Guard requireRole={ROLES.SUPER_ADMIN} fallback={null}>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => removeEvent(event.id)}
          >
            Remove Event (Super Admin)
          </button>
        </Guard>
      </div>
    </Guard>
  );
}

// ============================================================================
// Placeholder Components (for example compilation)
// ============================================================================

function UserDashboard() {
  return <div>User Dashboard Content</div>;
}

function AdminDashboardContent() {
  return <div>Admin Dashboard Content</div>;
}

function UserManagementSection() {
  return <div>User Management</div>;
}

function EventModerationSection() {
  return <div>Event Moderation</div>;
}

function SystemConfigSection() {
  return <div>System Configuration</div>;
}

function BasicEventMetrics() {
  return <div>Basic Metrics</div>;
}

function AdvancedEventMetrics() {
  return <div>Advanced Metrics</div>;
}

function SystemWideMetrics() {
  return <div>System Metrics</div>;
}

function AdvancedFiltersPreview() {
  return <div>Advanced Filters</div>;
}

function shareEvent(id) {
  console.log('Share event:', id);
}

function exportEvent(id) {
  console.log('Export event:', id);
}

function publishEvent(id) {
  console.log('Publish event:', id);
}

function archiveEvent(id) {
  console.log('Archive event:', id);
}

function deleteEvent(id) {
  console.log('Delete event:', id);
}

function flagEvent(id) {
  console.log('Flag event:', id);
}

function removeEvent(id) {
  console.log('Remove event:', id);
}
