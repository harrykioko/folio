-- Create alert system functions

-- Function to create alert rule
CREATE OR REPLACE FUNCTION monitoring.create_alert_rule(
    p_rule_name TEXT,
    p_metric_name TEXT,
    p_threshold NUMERIC,
    p_comparison_operator TEXT,
    p_severity TEXT,
    p_notification_channels JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = monitoring
AS $$
DECLARE
    v_rule_id UUID;
BEGIN
    -- Validate comparison operator
    IF p_comparison_operator NOT IN ('>', '<', '>=', '<=', '==') THEN
        RAISE EXCEPTION 'Invalid comparison operator: %', p_comparison_operator;
    END IF;

    -- Validate severity
    IF p_severity NOT IN ('info', 'warning', 'error', 'critical') THEN
        RAISE EXCEPTION 'Invalid severity level: %', p_severity;
    END IF;

    -- Insert alert rule
    INSERT INTO monitoring.alert_rules (
        rule_name,
        metric_name,
        threshold,
        comparison_operator,
        severity,
        notification_channels
    ) VALUES (
        p_rule_name,
        p_metric_name,
        p_threshold,
        p_comparison_operator,
        p_severity,
        p_notification_channels
    ) RETURNING id INTO v_rule_id;

    RETURN v_rule_id;
END;
$$;

-- Function to check alert conditions
CREATE OR REPLACE FUNCTION monitoring.check_alert_conditions()
RETURNS TABLE (
    alert_id UUID,
    rule_name TEXT,
    metric_name TEXT,
    current_value NUMERIC,
    threshold NUMERIC,
    comparison_operator TEXT,
    severity TEXT,
    triggered_at TIMESTAMPTZ,
    notification_channels JSONB
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
        ar.id as alert_id,
        ar.rule_name,
        ar.metric_name,
        cm.current_value,
        ar.threshold,
        ar.comparison_operator,
        ar.severity,
        NOW() as triggered_at,
        ar.notification_channels
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

-- Function to send alert notification
CREATE OR REPLACE FUNCTION monitoring.send_alert_notification(
    p_alert_id UUID,
    p_notification_type TEXT DEFAULT 'email'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = monitoring
AS $$
DECLARE
    v_alert monitoring.alert_rules%ROWTYPE;
    v_notification_sent BOOLEAN;
BEGIN
    -- Get alert details
    SELECT * INTO v_alert
    FROM monitoring.alert_rules
    WHERE id = p_alert_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Alert rule not found: %', p_alert_id;
    END IF;

    -- Check if notification type is supported
    IF p_notification_type NOT IN ('email', 'webhook', 'slack') THEN
        RAISE EXCEPTION 'Unsupported notification type: %', p_notification_type;
    END IF;

    -- TODO: Implement actual notification sending logic
    -- For now, we'll just return true to indicate success
    v_notification_sent := true;

    RETURN v_notification_sent;
END;
$$;

-- Function to manage alert status
CREATE OR REPLACE FUNCTION monitoring.manage_alert_status(
    p_alert_id UUID,
    p_is_active BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = monitoring
AS $$
BEGIN
    -- Update alert status
    UPDATE monitoring.alert_rules
    SET is_active = p_is_active,
        updated_at = NOW()
    WHERE id = p_alert_id;

    -- Return true if update was successful
    RETURN FOUND;
END;
$$;

-- Create verification function for alert system
CREATE OR REPLACE FUNCTION monitoring.verify_alert_system()
RETURNS TABLE (
    function_name TEXT,
    function_exists BOOLEAN,
    has_security_definer BOOLEAN,
    has_search_path BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'create_alert_rule'::TEXT,
        EXISTS (SELECT FROM pg_proc WHERE proname = 'create_alert_rule' AND pronamespace = 'monitoring'::regnamespace),
        EXISTS (SELECT FROM pg_proc WHERE proname = 'create_alert_rule' AND pronamespace = 'monitoring'::regnamespace AND prosecdef),
        EXISTS (SELECT FROM pg_proc WHERE proname = 'create_alert_rule' AND pronamespace = 'monitoring'::regnamespace AND proconfig LIKE '%search_path%')
    UNION ALL
    SELECT 
        'check_alert_conditions'::TEXT,
        EXISTS (SELECT FROM pg_proc WHERE proname = 'check_alert_conditions' AND pronamespace = 'monitoring'::regnamespace),
        EXISTS (SELECT FROM pg_proc WHERE proname = 'check_alert_conditions' AND pronamespace = 'monitoring'::regnamespace AND prosecdef),
        EXISTS (SELECT FROM pg_proc WHERE proname = 'check_alert_conditions' AND pronamespace = 'monitoring'::regnamespace AND proconfig LIKE '%search_path%')
    UNION ALL
    SELECT 
        'send_alert_notification'::TEXT,
        EXISTS (SELECT FROM pg_proc WHERE proname = 'send_alert_notification' AND pronamespace = 'monitoring'::regnamespace),
        EXISTS (SELECT FROM pg_proc WHERE proname = 'send_alert_notification' AND pronamespace = 'monitoring'::regnamespace AND prosecdef),
        EXISTS (SELECT FROM pg_proc WHERE proname = 'send_alert_notification' AND pronamespace = 'monitoring'::regnamespace AND proconfig LIKE '%search_path%')
    UNION ALL
    SELECT 
        'manage_alert_status'::TEXT,
        EXISTS (SELECT FROM pg_proc WHERE proname = 'manage_alert_status' AND pronamespace = 'monitoring'::regnamespace),
        EXISTS (SELECT FROM pg_proc WHERE proname = 'manage_alert_status' AND pronamespace = 'monitoring'::regnamespace AND prosecdef),
        EXISTS (SELECT FROM pg_proc WHERE proname = 'manage_alert_status' AND pronamespace = 'monitoring'::regnamespace AND proconfig LIKE '%search_path%');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create some default alert rules
INSERT INTO monitoring.alert_rules (
    rule_name,
    metric_name,
    threshold,
    comparison_operator,
    severity,
    notification_channels
) VALUES 
    (
        'High Query Execution Time',
        'query_execution_time',
        1000, -- 1 second
        '>',
        'warning',
        '{"email": true, "slack": true}'::jsonb
    ),
    (
        'High Error Rate',
        'error_rate',
        0.05, -- 5%
        '>',
        'error',
        '{"email": true, "slack": true}'::jsonb
    ),
    (
        'Low Cache Hit Rate',
        'cache_hit_rate',
        0.8, -- 80%
        '<',
        'warning',
        '{"email": true}'::jsonb
    );
``` 