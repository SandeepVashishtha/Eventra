import React, { useMemo } from 'react';
import { ShieldCheck, ShieldAlert, Users, AlertTriangle, CheckCircle, XCircle, TrendingUp, TrendingDown } from 'lucide-react';

/**
 * ComplianceMetricsCard Component
 * Displays real-time compliance metrics and safety status for venue occupancy planning.
 * Shows capacity utilization, safety compliance, and collision warnings.
 */
const ComplianceMetricsCard = ({
  placedObjects = [],
  safetyZones = [],
  maxCapacity = 1000,
  currentAttendees = 0,
  minSpacing = 60,
  className = '',
  onComplianceChange,
}) => {
  // Calculate compliance metrics
  const compliance = useMemo(() => {
    // Import from utility (will be bundled)
    const {
      calculateTotalCapacity,
      calculateOccupancyPercentage,
      checkSafetyCompliance,
      generateAislePathways,
    } = require('../../../../utils/canvas/occupancyCollision.js');

    const totalCapacity = calculateTotalCapacity(placedObjects);
    const occupancyPercentage = calculateOccupancyPercentage(
      currentAttendees,
      totalCapacity
    );

    const safetyCompliance = checkSafetyCompliance(
      placedObjects,
      safetyZones,
      maxCapacity,
      minSpacing
    );

    const aislePathways = generateAislePathways(
      placedObjects,
      1000, // canvas width (will be dynamic)
      800   // canvas height (will be dynamic)
    );

    const validAisles = aislePathways.filter(p => p.isValid).length;
    const totalAisles = aislePathways.length;

    return {
      totalCapacity,
      occupancyPercentage,
      currentAttendees,
      isCompliant: safetyCompliance.isCompliant,
      issues: safetyCompliance.issues,
      collisionCount: safetyCompliance.collisionCount,
      safetyZoneViolations: safetyCompliance.safetyZoneViolations,
      capacityExceeded: safetyCompliance.capacityExceeded,
      aisleCompliance: validAisles / Math.max(totalAisles, 1),
      validAisles,
      totalAisles,
      totalObjects: placedObjects.length,
    };
  }, [placedObjects, safetyZones, maxCapacity, currentAttendees, minSpacing]);

  // React to compliance changes
  React.useEffect(() => {
    if (onComplianceChange && typeof onComplianceChange === 'function') {
      onComplianceChange(compliance);
    }
  }, [compliance, onComplianceChange]);

  // Determine overall status
  const getOverallStatus = () => {
    if (compliance.issues.some(i => i.severity === 'critical')) {
      return { status: 'critical', label: 'CRITICAL', color: 'bg-red-500' };
    }
    if (!compliance.isCompliant) {
      return { status: 'warning', label: 'WARNING', color: 'bg-amber-500' };
    }
    return { status: 'safe', label: 'SAFE', color: 'bg-emerald-500' };
  };

  const overallStatus = getOverallStatus();

  // Format issue messages
  const getIssueSummary = () => {
    const issues = [];
    if (compliance.capacityExceeded) {
      issues.push(`Capacity exceeded: ${compliance.totalCapacity}/${maxCapacity}`);
    }
    if (compliance.collisionCount > 0) {
      issues.push(`${compliance.collisionCount} collision(s) detected`);
    }
    if (compliance.safetyZoneViolations > 0) {
      issues.push(`${compliance.safetyZoneViolations} safety zone violation(s)`);
    }
    if (compliance.totalAisles > 0 && compliance.validAisles === 0) {
      issues.push('No valid aisles');
    }

    return issues.length > 0 ? issues.join(', ') : 'All systems operational';
  };

  // Calculate occupancy color
  const getOccupancyColor = () => {
    if (compliance.occupancyPercentage >= 90) return 'bg-red-500';
    if (compliance.occupancyPercentage >= 75) return 'bg-amber-500';
    if (compliance.occupancyPercentage >= 50) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Compliance Metrics
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Real-time safety and capacity monitoring
          </p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${overallStatus.color} text-white text-xs font-semibold`}>
          <span className={`w-2 h-2 rounded-full bg-white/30 ${overallStatus.status === 'safe' ? 'animate-pulse' : ''}`} />
          {overallStatus.label}
        </div>
      </div>

      {/* Alert Banner for Critical Issues */}
      {compliance.issues.some(i => i.severity === 'critical') && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              Critical safety violations detected!
            </p>
            <p className="text-sm text-red-600 dark:text-red-500">
              {compliance.issues.filter(i => i.severity === 'critical').map(i => i.message).join('; ')}
            </p>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {/* Capacity Metric */}
        <MetricCard
          icon={<Users className="w-5 h-5" />}
          label="Capacity"
          value={compliance.totalCapacity}
          subtitle={`${compliance.currentAttendees} occupied`}
          color={getOccupancyColor()}
          progress={compliance.occupancyPercentage}
        />

        {/* Occupancy Percentage */}
        <MetricCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Occupancy"
          value={`${compliance.occupancyPercentage}%`}
          subtitle={`Max: ${maxCapacity}`}
          color={getOccupancyColor()}
          progress={compliance.occupancyPercentage}
          isPercentage
        />

        {/* Collisions */}
        <MetricCard
          icon={compliance.collisionCount > 0 ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          label="Collisions"
          value={compliance.collisionCount}
          subtitle={compliance.collisionCount === 0 ? 'Clear' : 'Needs fixing'}
          color={compliance.collisionCount > 0 ? 'bg-red-500' : 'bg-emerald-500'}
        />

        {/* Safety Zones */}
        <MetricCard
          icon={compliance.safetyZoneViolations > 0 ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
          label="Safety Zones"
          value={compliance.safetyZoneViolations}
          subtitle={compliance.safetyZoneViolations === 0 ? 'Compliant' : 'Violations'}
          color={compliance.safetyZoneViolations > 0 ? 'bg-amber-500' : 'bg-emerald-500'}
        />

        {/* Aisle Access */}
        <MetricCard
          icon={compliance.aisleCompliance >= 0.8 ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          label="Aisle Access"
          value={compliance.validAisles}
          subtitle={`${compliance.totalAisles} pathways`}
          color={compliance.aisleCompliance >= 0.8 ? 'bg-emerald-500' : 'bg-amber-500'}
          progress={Math.round(compliance.aisleCompliance * 100)}
        />
      </div>

      {/* Detailed Issues List (Expandable) */}
      {compliance.issues.length > 0 && (
        <DetailsSection
          title="Safety Issues"
          count={compliance.issues.length}
          severity="high"
        >
          <div className="space-y-3">
            {compliance.issues.map((issue, index) => (
              <IssueItem
                key={index}
                type={issue.type}
                message={issue.message}
                severity={issue.severity}
              />
            ))}
          </div>
        </DetailsSection>
      )}

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {getIssueSummary()}
          </span>
          <span className={`font-medium ${compliance.isCompliant ? 'text-emerald-600' : 'text-red-600'}`}>
            {compliance.isCompliant ? 'Layout is compliant' : 'Layout needs attention'}
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * MetricCard - Reusable card for displaying a single metric
 */
const MetricCard = ({
  icon,
  label,
  value,
  subtitle,
  color = 'bg-blue-500',
  progress,
  isPercentage = false,
}) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-60" style={{ color }} />
      
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color} text-white`}>
          {React.cloneElement(icon, { className: 'w-5 h-5' })}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {value}
          {isPercentage && '%'}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{label}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{subtitle}</p>
      </div>

      {progress !== undefined && progress >= 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full bg-current transition-all duration-300`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};

/**
 * DetailsSection - Expandable section for detailed information
 */
const DetailsSection = ({ title, count, severity, children }) => {
  const [isExpanded, setIsExpanded] = React.useState(severity === 'critical' || severity === 'high');

  const severityColors = {
    critical: 'bg-red-500',
    high: 'bg-amber-500',
    medium: 'bg-blue-500',
    low: 'bg-emerald-500',
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between p-4 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${severityColors[severity] || 'bg-gray-400'}`} />
          <span className="font-medium text-gray-700 dark:text-gray-200">{title}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
            {count} issue(s)
          </span>
        </div>
        <span className={`text-xl font-light text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="p-4 bg-white dark:bg-gray-900">
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * IssueItem - Individual issue display
 */
const IssueItem = ({ type, message, severity }) => {
  const getSeverityColor = () => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-amber-500';
      case 'medium': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'collision': return <XCircle className="w-4 h-4" />;
      case 'safety_zone': return <ShieldAlert className="w-4 h-4" />;
      case 'capacity': return <Users className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getSeverityColor()} text-white`}>
        {getTypeIcon()}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {message}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
          {type.replace('_', ' ')}
        </p>
      </div>
    </div>
  );
};

export default ComplianceMetricsCard;
