-- Create performance monitoring schema
CREATE SCHEMA IF NOT EXISTS monitoring;

-- Create performance_metrics table
CREATE TABLE monitoring.performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_type TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    context JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create query_logs table
CREATE TABLE monitoring.query_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id TEXT NOT NULL,
    query_text TEXT NOT NULL,
    execution_time NUMERIC NOT NULL,
    rows_affected INTEGER,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),
    context JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create alert_rules table
CREATE TABLE monitoring.alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    threshold NUMERIC NOT NULL,
    comparison_operator TEXT NOT NULL CHECK (comparison_operator IN ('>', '<', '>=', '<=', '==')),
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    notification_channels JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create monitoring_settings table
CREATE TABLE monitoring.monitoring_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_name TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_performance_metrics_timestamp ON monitoring.performance_metrics(timestamp);
CREATE INDEX idx_performance_metrics_name ON monitoring.performance_metrics(metric_name);
CREATE INDEX idx_query_logs_timestamp ON monitoring.query_logs(timestamp);
CREATE INDEX idx_query_logs_user_id ON monitoring.query_logs(user_id);
CREATE INDEX idx_alert_rules_metric_name ON monitoring.alert_rules(metric_name);

-- Create RLS policies
ALTER TABLE monitoring.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring.query_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring.alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring.monitoring_settings ENABLE ROW LEVEL SECURITY;

-- Performance metrics policies
CREATE POLICY "Service role can manage performance metrics"
    ON monitoring.performance_metrics
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can view performance metrics"
    ON monitoring.performance_metrics
    FOR SELECT
    TO authenticated
    USING (true);

-- Query logs policies
CREATE POLICY "Service role can manage query logs"
    ON monitoring.query_logs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can view their own query logs"
    ON monitoring.query_logs
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Alert rules policies
CREATE POLICY "Service role can manage alert rules"
    ON monitoring.alert_rules
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can view alert rules"
    ON monitoring.alert_rules
    FOR SELECT
    TO authenticated
    USING (true);

-- Monitoring settings policies
CREATE POLICY "Service role can manage monitoring settings"
    ON monitoring.monitoring_settings
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can view monitoring settings"
    ON monitoring.monitoring_settings
    FOR SELECT
    TO authenticated
    USING (true);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION monitoring.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_performance_metrics_updated_at
    BEFORE UPDATE ON monitoring.performance_metrics
    FOR EACH ROW
    EXECUTE FUNCTION monitoring.update_updated_at_column();

CREATE TRIGGER update_query_logs_updated_at
    BEFORE UPDATE ON monitoring.query_logs
    FOR EACH ROW
    EXECUTE FUNCTION monitoring.update_updated_at_column();

CREATE TRIGGER update_alert_rules_updated_at
    BEFORE UPDATE ON monitoring.alert_rules
    FOR EACH ROW
    EXECUTE FUNCTION monitoring.update_updated_at_column();

CREATE TRIGGER update_monitoring_settings_updated_at
    BEFORE UPDATE ON monitoring.monitoring_settings
    FOR EACH ROW
    EXECUTE FUNCTION monitoring.update_updated_at_column();

-- Create initial monitoring settings
INSERT INTO monitoring.monitoring_settings (setting_name, setting_value, description)
VALUES 
    ('query_logging_enabled', 'true'::jsonb, 'Enable/disable query logging'),
    ('performance_metrics_retention_days', '30'::jsonb, 'Number of days to retain performance metrics'),
    ('alert_check_interval_minutes', '5'::jsonb, 'Interval between alert checks in minutes'),
    ('max_query_logs_per_user', '1000'::jsonb, 'Maximum number of query logs to retain per user');

-- Create verification function
CREATE OR REPLACE FUNCTION monitoring.verify_monitoring_setup()
RETURNS TABLE (
    table_name TEXT,
    table_exists BOOLEAN,
    has_rls BOOLEAN,
    has_indexes BOOLEAN,
    has_triggers BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'performance_metrics'::TEXT,
        EXISTS (SELECT FROM pg_tables WHERE schemaname = 'monitoring' AND tablename = 'performance_metrics'),
        EXISTS (SELECT FROM pg_policies WHERE schemaname = 'monitoring' AND tablename = 'performance_metrics'),
        EXISTS (SELECT FROM pg_indexes WHERE schemaname = 'monitoring' AND tablename = 'performance_metrics'),
        EXISTS (SELECT FROM pg_trigger WHERE tgrelid = 'monitoring.performance_metrics'::regclass)
    UNION ALL
    SELECT 
        'query_logs'::TEXT,
        EXISTS (SELECT FROM pg_tables WHERE schemaname = 'monitoring' AND tablename = 'query_logs'),
        EXISTS (SELECT FROM pg_policies WHERE schemaname = 'monitoring' AND tablename = 'query_logs'),
        EXISTS (SELECT FROM pg_indexes WHERE schemaname = 'monitoring' AND tablename = 'query_logs'),
        EXISTS (SELECT FROM pg_trigger WHERE tgrelid = 'monitoring.query_logs'::regclass)
    UNION ALL
    SELECT 
        'alert_rules'::TEXT,
        EXISTS (SELECT FROM pg_tables WHERE schemaname = 'monitoring' AND tablename = 'alert_rules'),
        EXISTS (SELECT FROM pg_policies WHERE schemaname = 'monitoring' AND tablename = 'alert_rules'),
        EXISTS (SELECT FROM pg_indexes WHERE schemaname = 'monitoring' AND tablename = 'alert_rules'),
        EXISTS (SELECT FROM pg_trigger WHERE tgrelid = 'monitoring.alert_rules'::regclass)
    UNION ALL
    SELECT 
        'monitoring_settings'::TEXT,
        EXISTS (SELECT FROM pg_tables WHERE schemaname = 'monitoring' AND tablename = 'monitoring_settings'),
        EXISTS (SELECT FROM pg_policies WHERE schemaname = 'monitoring' AND tablename = 'monitoring_settings'),
        EXISTS (SELECT FROM pg_indexes WHERE schemaname = 'monitoring' AND tablename = 'monitoring_settings'),
        EXISTS (SELECT FROM pg_trigger WHERE tgrelid = 'monitoring.monitoring_settings'::regclass);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 