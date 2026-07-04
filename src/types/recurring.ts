/**
 * recurring.ts
 * TypeScript type definitions for the Recurring Events and Series Management System.
 */

/**
 * Recurrence frequency types following RFC 5545 (iCalendar)
 */
export type RecurrenceFrequency = 
  | 'DAILY' 
  | 'WEEKLY' 
  | 'MONTHLY' 
  | 'YEARLY' 
  | 'CUSTOM';

/**
 * Days of the week for weekly recurrence
 */
export type DayOfWeek = 
  | 'MO' 
  | 'TU' 
  | 'WE' 
  | 'TH' 
  | 'FR' 
  | 'SA' 
  | 'SU';

/**
 * Month for yearly recurrence
 */
export type Month = 
  | 1 | 2 | 3 | 4 | 5 | 6 
  | 7 | 8 | 9 | 10 | 11 | 12;

/**
 * Recurrence rule (RRULE) following RFC 5545 standard
 */
export interface RecurrenceRule {
  /** Recurrence frequency */
  freq: RecurrenceFrequency;
  
  /** Start date in ISO 8601 format */
  dtstart: string;
  
  /** End date for the recurrence in ISO 8601 format (optional) */
  dtend?: string;
  
  /** Count of occurrences (optional, alternative to dtend) */
  count?: number;
  
  /** Interval between recurrences (default: 1) */
  interval?: number;
  
  /** Days of week for WEEKLY/MONTHLY (MO, TU, WE, etc.) */
  byweekday?: DayOfWeek[];
  
  /** Day of month for MONTHLY recurrence (1-31) */
  bymonthday?: number[];
  
  /** Week of month for MONTHLY recurrence (-1 for last week) */
  byweekno?: number[];
  
  /** Month for YEARLY recurrence (1-12) */
  bymonth?: Month[];
  
  /** Day of year for YEARLY recurrence (1-366) */
  byyearday?: number[];
  
  /** Timezone identifier for recurrence calculation */
  tzid?: string;
  
  /** Exceptions (dates to skip in ISO 8601 format) */
  exdates?: string[];
  
  /** Additional occurrences to include (ISO 8601 format) */
  rdate?: string[];
  
  /** Custom RRULE string if needed */
  rruleString?: string;
}

/**
 * Modification type for recurring events
 */
export type ModificationType = 
  | 'UPDATE_ALL' 
  | 'UPDATE_THIS_AND_FUTURE' 
  | 'UPDATE_ONLY_THIS';

/**
 * Series modification record
 */
export interface SeriesModification {
  /** Unique modification ID */
  id: string;
  
  /** ID of the event instance being modified */
  eventInstanceId: string;
  
  /** ID of the series */
  seriesId: string;
  
  /** Type of modification */
  modificationType: ModificationType;
  
  /** Original recurrence rule before modification */
  originalRRule: RecurrenceRule;
  
  /** Modified fields */
  modifiedFields: Record<string, any>;
  
  /** Modification date */
  modifiedAt: string;
  
  /** Modified by user ID */
  modifiedBy: string;
}

/**
 * Event series record
 */
export interface EventSeries {
  /** Unique series ID */
  id: string;
  
  /** Recurrence rule for the series */
  recurrenceRule: RecurrenceRule;
  
  /** Original event ID (first occurrence) */
  originalEventId: string;
  
  /** Series name/title */
  title: string;
  
  /** Series description */
  description?: string;
  
  /** Total count of instances */
  totalInstances?: number;
  
  /** Modifications applied to this series */
  modifications: SeriesModification[];
  
  /** Creation date */
  createdAt: string;
  
  /** Last updated date */
  updatedAt: string;
  
  /** Metadata for the series */
  metadata?: Record<string, any>;
}

/**
 * Recurring event instance
 */
export interface RecurringEventInstance {
  /** Unique instance ID */
  id: string;
  
  /** Series ID this instance belongs to */
  seriesId: string;
  
  /** Instance occurrence number (0-based) */
  occurrenceIndex: number;
  
  /** Instance date in ISO 8601 format */
  date: string;
  
  /** Event data (base event merged with series modifications) */
  eventData: Record<string, any>;
  
  /** Whether this instance was modified from the series */
  isModified: boolean;
  
  /** Modification details if modified */
  modification?: SeriesModification;
}

/**
 * Series conflict detection result
 */
export interface SeriesConflict {
  /** Conflict ID */
  id: string;
  
  /** Instance ID with conflict */
  instanceId: string;
  
  /** Conflicting series/event ID */
  conflictingEventId: string;
  
  /** Type of conflict */
  conflictType: 'TIME_OVERLAP' | 'VENUE_CONFLICT' | 'CAPACITY_ISSUE' | 'USER_CONFLICT';
  
  /** Conflict details */
  details: string;
  
  /** Severity (HIGH, MEDIUM, LOW) */
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  
  /** Whether conflict is resolved */
  isResolved: boolean;
}

/**
 * Recurring pattern template
 */
export interface RecurrenceTemplate {
  /** Template ID */
  id: string;
  
  /** Template name (e.g., "Weekly Team Meeting") */
  name: string;
  
  /** Template description */
  description?: string;
  
  /** Recurrence rule */
  recurrenceRule: RecurrenceRule;
  
  /** Default event properties */
  defaultProperties?: {
    duration?: number;
    venue?: string;
    category?: string;
    [key: string]: any;
  };
  
  /** Whether template is public/reusable */
  isPublic: boolean;
  
  /** Creator user ID */
  createdBy: string;
  
  /** Creation date */
  createdAt: string;
}

/**
 * Series validation result
 */
export interface SeriesValidationResult {
  /** Whether series is valid */
  isValid: boolean;
  
  /** Validation errors if any */
  errors: string[];
  
  /** Validation warnings */
  warnings: string[];
  
  /** Total instances that would be generated */
  estimatedInstanceCount: number;
  
  /** Date range for the series */
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * Options for generating recurring event instances
 */
export interface InstanceGenerationOptions {
  /** Maximum number of instances to generate */
  maxInstances?: number;
  
  /** Start date for instance generation (ISO 8601) */
  startDate?: string;
  
  /** End date for instance generation (ISO 8601) */
  endDate?: string;
  
  /** Include modifications in instances */
  includeModifications?: boolean;
  
  /** Timezone for calculation */
  timezone?: string;
  
  /** Skip exception dates */
  skipExceptions?: boolean;
}

/**
 * Recurring event batch operation result
 */
export interface BatchOperationResult {
  /** Number of successful operations */
  successCount: number;
  
  /** Number of failed operations */
  failureCount: number;
  
  /** Failed operation details */
  failures: Array<{
    instanceId: string;
    error: string;
  }>;
  
  /** Operation ID for tracking */
  operationId: string;
  
  /** Completion timestamp */
  completedAt: string;
}

/**
 * Recurring event export options
 */
export interface RecurringEventExportOptions {
  /** Export format */
  format: 'ICS' | 'JSON' | 'CSV';
  
  /** Include all instances or just rules */
  includeInstances: boolean;
  
  /** Date range for export */
  dateRange?: {
    start: string;
    end: string;
  };
  
  /** Include event modifications */
  includeModifications?: boolean;
}
