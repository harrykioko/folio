# Performance Monitoring System

## Overview

The performance monitoring system provides comprehensive monitoring capabilities for the Folio application, including query performance tracking, metric collection, and alert management.

## Components

### 1. Schema Structure

#### Performance Metrics Table
- Stores various performance metrics
- Fields:
  - `id`: UUID (Primary Key)
  - `metric_name`: Name of the metric
  - `metric_value`: Numeric value of the metric
  - `metric_type`: Type of metric
  - `timestamp`: When the metric was recorded
  - `context`: Additional context as JSONB
  - `created_at`: Record creation timestamp
  - `updated_at`: Last update timestamp

#### Query Logs Table
- Tracks database query performance
- Fields:
  - `id`: UUID (Primary Key)
  - `query_id`: Unique identifier for the query
  - `query_text`: The actual query text
  - `execution_time`: Query execution time in milliseconds
  - `rows_affected`: Number of rows affected
  - `timestamp`: When the query was executed
  - `user_id`: Reference to auth.users
  - `context`: Additional context as JSONB
  - `created_at`: Record creation timestamp
  - `updated_at`: Last update timestamp

#### Alert Rules Table
- Defines alert conditions and thresholds
- Fields:
  - `id`: UUID (Primary Key)
  - `rule_name`: Name of the alert rule
  - `metric_name`: Metric to monitor
  - `threshold`: Alert threshold value
  - `comparison_operator`: Comparison operator (>, <, >=, <=, ==)
  - `severity`: Alert severity (info, warning, error, critical)
  - `is_active`: Whether the rule is active
  - `notification_channels`: Notification preferences as JSONB
  - `created_at`: Record creation timestamp
  - `updated_at`: Last update timestamp

#### Monitoring Settings Table
- Stores system-wide monitoring settings
- Fields:
  - `id`: UUID (Primary Key)
  - `setting_name`: Name of the setting
  - `setting_value`: Setting value as JSONB
  - `description`: Setting description
  - `created_at`: Record creation timestamp
  - `updated_at`: Last update timestamp

### 2. Functions

#### Query Performance Tracking
```sql
monitoring.track_query_performance(
    p_query_id TEXT,
    p_query_text TEXT,
    p_execution_time NUMERIC,
    p_rows_affected INTEGER DEFAULT NULL,
    p_context JSONB DEFAULT NULL
)
```
- Tracks individual query performance
- Automatically handles user context
- Respects logging settings
- Triggers cleanup of old logs

#### Performance Analysis
```sql
monitoring.analyze_performance_metrics(
    p_metric_name TEXT,
    p_start_time TIMESTAMPTZ DEFAULT NULL,
    p_end_time TIMESTAMPTZ DEFAULT NULL
)
```
- Analyzes metrics over a time period
- Returns statistical analysis (avg, min, max, count)
- Default time range: last 24 hours

#### Performance Reporting
```sql
monitoring.generate_performance_report(
    p_start_time TIMESTAMPTZ DEFAULT NULL,
    p_end_time TIMESTAMPTZ DEFAULT NULL
)
```
- Generates comprehensive performance report
- Includes alert status for each metric
- Default time range: last 24 hours

#### Alert Management
```sql
monitoring.create_alert_rule(
    p_rule_name TEXT,
    p_metric_name TEXT,
    p_threshold NUMERIC,
    p_comparison_operator TEXT,
    p_severity TEXT,
    p_notification_channels JSONB DEFAULT NULL
)
```
- Creates new alert rules
- Validates input parameters
- Supports multiple notification channels

### 3. Security

#### Row Level Security (RLS)
- All tables have RLS enabled
- Service role has full access
- Authenticated users have limited access:
  - Can view performance metrics
  - Can view their own query logs
  - Can view alert rules
  - Can view monitoring settings

#### Function Security
- All functions are SECURITY DEFINER
- Search path is set to monitoring schema
- Input validation on all parameters

### 4. Default Alert Rules

1. High Query Execution Time
   - Metric: query_execution_time
   - Threshold: 1000ms (1 second)
   - Severity: warning
   - Notifications: email, slack

2. High Error Rate
   - Metric: error_rate
   - Threshold: 5%
   - Severity: error
   - Notifications: email, slack

3. Low Cache Hit Rate
   - Metric: cache_hit_rate
   - Threshold: 80%
   - Severity: warning
   - Notifications: email

### 5. Usage Examples

#### Track Query Performance
```sql
SELECT monitoring.track_query_performance(
    'query_123',
    'SELECT * FROM users WHERE id = $1',
    150.5,
    1,
    '{"user_id": "123", "operation": "user_fetch"}'::jsonb
);
```

#### Create Alert Rule
```sql
SELECT monitoring.create_alert_rule(
    'Slow API Response',
    'api_response_time',
    500, -- 500ms
    '>',
    'warning',
    '{"email": true, "slack": true}'::jsonb
);
```

#### Generate Performance Report
```sql
SELECT * FROM monitoring.generate_performance_report(
    NOW() - INTERVAL '1 day',
    NOW()
);
```

### 6. Maintenance

#### Data Retention
- Query logs are automatically cleaned up based on retention settings
- Default retention: 30 days
- Maximum logs per user: 1000

#### Performance Impact
- Indexes on frequently queried columns
- Batch processing for cleanup operations
- Efficient query patterns

### 7. Future Enhancements

1. Additional Metrics
   - API response times
   - Cache hit rates
   - Resource utilization

2. Enhanced Notifications
   - Webhook support
   - Custom notification templates
   - Alert grouping

3. Dashboard Integration
   - Real-time metrics
   - Historical trends
   - Custom visualizations

## Troubleshooting

### Common Issues

1. Missing Metrics
   - Check if metric collection is enabled
   - Verify metric names are correct
   - Check retention settings

2. Alert Notifications
   - Verify notification channels are configured
   - Check alert rule status
   - Validate threshold values

3. Performance Impact
   - Monitor query execution times
   - Check index usage
   - Review cleanup operations 