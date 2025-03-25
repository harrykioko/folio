const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase credentials in environment variables');
    console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkWarnings() {
    try {
        console.log('Checking database warnings...');

        // Check multiple permissive policies
        const { data: multiplePolicies, error: multiplePoliciesError } = await supabase
            .from('pg_policies')
            .select('tablename, policyname')
            .eq('permissive', 'PERMISSIVE')
            .order('tablename');

        if (multiplePoliciesError) {
            console.error('Error checking permissive policies:', multiplePoliciesError);
        } else {
            console.log('\nPermissive Policies:');
            const policiesByTable = multiplePolicies.reduce((acc, policy) => {
                if (!acc[policy.tablename]) {
                    acc[policy.tablename] = [];
                }
                acc[policy.tablename].push(policy.policyname);
                return acc;
            }, {});

            Object.entries(policiesByTable).forEach(([table, policies]) => {
                if (policies.length > 1) {
                    console.log(`\nTable ${table} has ${policies.length} permissive policies:`);
                    policies.forEach(policy => console.log(`  - ${policy}`));
                }
            });
        }

        // Check RLS policies for auth.* calls
        const { data: rlsPolicies, error: rlsPoliciesError } = await supabase
            .from('pg_policies')
            .select('tablename, policyname, qual')
            .textSearch('qual', 'auth.');

        if (rlsPoliciesError) {
            console.error('Error checking RLS policies:', rlsPoliciesError);
        } else {
            console.log('\nPolicies with auth.* calls:');
            rlsPolicies.forEach(policy => {
                if (policy.qual && !policy.qual.includes('(select auth.')) {
                    console.log(`\nTable: ${policy.tablename}`);
                    console.log(`Policy: ${policy.policyname}`);
                    console.log(`Definition: ${policy.qual}`);
                }
            });
        }

        // Check table statistics for potential index opportunities
        const { data: tableStats, error: tableStatsError } = await supabase
            .from('pg_stat_user_tables')
            .select('relname, seq_scan, idx_scan')
            .gt('seq_scan', 1000)
            .order('seq_scan', { ascending: false });

        if (tableStatsError) {
            console.error('Error checking table statistics:', tableStatsError);
        } else {
            console.log('\nPotential Index Opportunities:');
            tableStats.forEach(stat => {
                const seqToIdxRatio = stat.seq_scan / (stat.idx_scan || 1);
                if (seqToIdxRatio > 10) {
                    console.log(`\nTable: ${stat.relname}`);
                    console.log(`Sequential Scans: ${stat.seq_scan}`);
                    console.log(`Index Scans: ${stat.idx_scan}`);
                    console.log(`Seq/Idx Ratio: ${seqToIdxRatio.toFixed(2)}`);
                }
            });
        }

    } catch (error) {
        console.error('Error checking warnings:', error);
        if (error.stack) console.error('Stack trace:', error.stack);
    }
}

checkWarnings(); 