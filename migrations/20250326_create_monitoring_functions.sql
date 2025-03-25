-- Create monitoring functions

-- Function to track query performance
CREATE OR REPLACE FUNCTION monitoring.track_query_performance(
    p_query_id TEXT,
    p_query_text TEXT,
    p_execution_time NUMERIC,
    p_rows_affected INTEGER DEFAULT NULL,
    p_context JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = monitoring
AS $$
DECLARE
    v_log_id UUID;
    v_user_id UUID;
    v_logging_enabled BOOLEAN;
BEGIN
    -- Check if query logging is enabled
    SELECT (setting_value::text)::boolean INTO v_logging_enabled
    FROM monitoring.monitoring_settings
    WHERE setting_name = 'query_logging_enabled';

    IF NOT v_logging_enabled THEN
        RETURN NULL;
    END IF;

    -- Get current user ID
    v_user_id := auth.uid();

    -- Insert query log
    INSERT INTO monitoring.query_logs (
        query_id,
        query_text,
        execution_time,
        rows_affected,
        user_id,
        context
    ) VALUES (
        p_query_id,
        p_query_text,
        p_execution_time,
        p_rows_affected,
        v_user_id,
        p_context
    ) RETURNING id INTO v_log_id;

    -- Check if we need to clean up old logs
    PERFORM monitoring.cleanup_old_query_logs();

    RETURN v_log_id;
END;
$$;

-- Function to analyze performance metrics
CREATE OR REPLACE FUNCTION monitoring.analyze_performance_metrics(
    p_metric_name TEXT,
    p_start_time TIMESTAMPTZ DEFAULT NULL,
    p_end_time TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
    metric_name TEXT,
    avg_value NUMERIC,
    min_value NUMERIC,
    max_value NUMERIC,
    count BIGINT,
    time_range TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = monitoring
AS $$
BEGIN
    -- Set default time range if not provided
    IF p_start_time IS NULL THEN
        p_start_time := NOW() - INTERVAL '24 hours';
    END IF;
    IF p_end_time IS NULL THEN
        p_end_time := NOW();
    END IF;

    RETURN QUERY
    SELECT 
        p_metric_name,
        AVG(metric_value)::NUMERIC,
        MIN(metric_value)::NUMERIC,
        MAX(metric_value)::NUMERIC,
        COUNT(*),
        (p_end_time - p_start_time)::TEXT
    FROM monitoring.performance_metrics
    WHERE metric_name = p_metric_name
    AND timestamp BETWEEN p_start_time AND p_end_time;
END;
$$;

-- Function to generate performance report
CREATE OR REPLACE FUNCTION monitoring.generate_performance_report(
    p_start_time TIMESTAMPTZ DEFAULT NULL,
    p_end_time TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
    metric_name TEXT,
    avg_value NUMERIC,
    min_value NUMERIC,
    max_value NUMERIC,
    count BIGINT,
    time_range TEXT,
    alert_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = monitoring
AS $$
BEGIN
    -- Set default time range if not provided
    IF p_start_time IS NULL THEN
        p_start_time := NOW() - INTERVAL '24 hours';
    END IF;
    IF p_end_time IS NULL THEN
        p_end_time := NOW();
    END IF;

    RETURN QUERY
    WITH metric_stats AS (
        SELECT 
            metric_name,
            AVG(metric_value)::NUMERIC as avg_value,
            MIN(metric_value)::NUMERIC as min_value,
            MAX(metric_value)::NUMERIC as max_value,
            COUNT(*) as count
        FROM monitoring.performance_metrics
        WHERE timestamp BETWEEN p_start_time AND p_end_time
        GROUP BY metric_name
    )
    SELECT 
        ms.metric_name,
        ms.avg_value,
        ms.min_value,
        ms.max_value,
        ms.count,
        (p_end_time - p_start_time)::TEXT as time_range,
        CASE 
            WHEN ar.id IS NOT NULL AND ar.is_active THEN
                CASE 
                    WHEN ar.comparison_operator = '>' AND ms.avg_value > ar.threshold THEN ar.severity
                    WHEN ar.comparison_operator = '<' AND ms.avg_value < ar.threshold THEN ar.severity
                    WHEN ar.comparison_operator = '>=' AND ms.avg_value >= ar.threshold THEN ar.severity
                    WHEN ar.comparison_operator = '<=' AND ms.avg_value <= ar.threshold THEN ar.severity
                    WHEN ar.comparison_operator = '==' AND ms.avg_value = ar.threshold THEN ar.severity
                    ELSE 'ok'
                END
            ELSE 'ok'
        END as alert_status
    FROM metric_stats ms
    LEFT JOIN monitoring.alert_rules ar ON ar.metric_name = ms.metric_name;
END;
$$;

-- Function to check performance thresholds
CREATE OR REPLACE FUNCTION monitoring.check_performance_thresholds()
RETURNS TABLE (
    rule_name TEXT,
    metric_name TEXT,
    current_value NUMERIC,
    threshold NUMERIC,
    comparison_operator TEXT,
    severity TEXT,
    triggered_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = monitoring
AS $$
BEGIN
    RETURN QUERY
    WITH current_metrics AS (
        SELECT 
            metric_name,
            AVG(metric_value)::NUMERIC as current_value
        FROM monitoring.performance_metrics
        WHERE timestamp > NOW() - INTERVAL '5 minutes'
        GROUP BY metric_name
    )
    SELECT 
        ar.rule_name,
        ar.metric_name,
        cm.current_value,
        ar.threshold,
        ar.comparison_operator,
        ar.severity,
        NOW() as triggered_at
    FROM monitoring.alert_rules ar
    JOIN current_metrics cm ON cm.metric_name = ar.metric_name
    WHERE ar.is_active
    AND (
        (ar.comparison_operator = '>' AND cm.current_value > ar.threshold)
        OR (ar.comparison_operator = '<' AND cm.current_value < ar.threshold)
        OR (ar.comparison_operator = '>=' AND cm.current_value >= ar.threshold)
        OR (ar.comparison_operator = '<=' AND cm.current_value <= ar.threshold)
        OR (ar.comparison_operator = '==' AND cm.current_value = ar.threshold)
    );
END;
$$;

-- Function to clean up old query logs
CREATE OR REPLACE FUNCTION monitoring.cleanup_old_query_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = monitoring
AS $$
DECLARE
    v_retention_days INTEGER;
    v_max_logs_per_user INTEGER;
    v_deleted_count INTEGER;
BEGIN
    -- Get retention settings
    SELECT (setting_value::text)::integer INTO v_retention_days
    FROM monitoring.monitoring_settings
    WHERE setting_name = 'performance_metrics_retention_days';

    SELECT (setting_value::text)::integer INTO v_max_logs_per_user
    FROM monitoring.monitoring_settings
    WHERE setting_name = 'max_query_logs_per_user';

    -- Delete old logs based on retention period
    WITH deleted_logs AS (
        DELETE FROM monitoring.query_logs
        WHERE timestamp < NOW() - (v_retention_days || ' days')::INTERVAL
        RETURNING id
    )
    SELECT COUNT(*) INTO v_deleted_count FROM deleted_logs;

    -- Delete excess logs per user
    WITH user_logs AS (
        SELECT 
            user_id,
            id,
            ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY timestamp DESC) as rn
        FROM monitoring.query_logs
    )
    DELETE FROM monitoring.query_logs
    WHERE id IN (
        SELECT id FROM user_logs WHERE rn > v_max_logs_per_user
    );

    RETURN v_deleted_count;
END;
$$;

-- Create verification function for monitoring functions
CREATE OR REPLACE FUNCTION monitoring.verify_monitoring_functions()
RETURNS TABLE (
    function_name TEXT,
    function_exists BOOLEAN,
    has_security_definer BOOLEAN,
    has_search_path BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'track_query_performance'::TEXT,
        EXISTS (SELECT FROM pg_proc WHERE proname = 'track_query_performance' AND pronamespace = 'monitoring'::regnamespace),
        EXISTS (SELECT FROM pg_proc WHERE proname = 'track_query_performance' AND pronamespace = 'monitoring'::regnamespace AND prosecdef),
        EXISTS (SELECT FROM pg_proc WHERE proname = 'track_query_performance' AND pronamespace = 'monitoring'::regnamespace AND proconfig LIKE '%search_path%')
    UNION ALL
    SELECT 
        'analyze_performance_metrics'::TEXT,
        EXISTS (SELECT FROM pg_proc WHERE proname = 'analyze_performance_metrics' AND pronamespace = 'monitoring'::regnamespace),
        EXISTS (SELECT FROM pg_proc WHERE proname = 'analyze_performance_metrics' AND pronamespace = 'monitoring'::regnamespace AND prosecdef),
        EXISTS (SELECT FROM pg_proc WHERE proname = 'analyze_performance_metrics' AND pronamespace = 'monitoring'::regnamespace AND proconfig LIKE '%search_path%')
    UNION ALL
    SELECT 
        'generate_performance_report'::TEXT,
        EXISTS (SELECT FROM pg_proc WHERE proname = 'generate_performance_report' AND pronamespace = 'monitoring'::regnamespace),
        EXISTS (SELECT FROM pg_proc WHERE proname = 'generate_performance_report' AND pronamespace = 'monitoring'::regnamespace AND prosecdef),
        EXISTS (SELECT FROM pg_proc WHERE proname = 'generate_performance_report' AND pronamespace = 'monitoring'::regnamespace AND proconfig LIKE '%search_path%')
    UNION ALL
    SELECT 
        'check_performance_thresholds'::TEXT,
        EXISTS (SELECT FROM pg_proc WHERE proname = 'check_performance_thresholds' AND pronamespace = 'monitoring'::regnamespace),
        EXISTS (SELECT FROM pg_proc WHERE proname = 'check_performance_thresholds' AND pronamespace = 'monitoring'::regnamespace AND prosecdef),
        EXISTS (SELECT FROM pg_proc WHERE proname = 'check_performance_thresholds' AND pronamespace = 'monitoring'::regnamespace AND proconfig LIKE '%search_path%')
    UNION ALL
    SELECT 
        'cleanup_old_query_logs'::TEXT,
        EXISTS (SELECT FROM pg_proc WHERE proname = 'cleanup_old_query_logs' AND pronamespace = 'monitoring'::regnamespace),
        EXISTS (SELECT FROM pg_proc WHERE proname = 'cleanup_old_query_logs' AND pronamespace = 'monitoring'::regnamespace AND prosecdef),
        EXISTS (SELECT FROM pg_proc WHERE proname = 'cleanup_old_query_logs' AND pronamespace = 'monitoring'::regnamespace AND proconfig LIKE '%search_path%');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 