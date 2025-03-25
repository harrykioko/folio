# Database Security Guidelines

## Function Security

### Search Path Security
- All database functions MUST have an explicit search path set
- Use `SET search_path = public` for all functions
- This prevents schema hijacking attacks
- Example:
```sql
CREATE OR REPLACE FUNCTION example_function()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Function body
END;
$$;
```

### Function Creation Guidelines
1. Always use `SECURITY DEFINER` for functions that need elevated privileges
2. Set explicit search paths to prevent schema hijacking
3. Include proper error handling
4. Document function security implications
5. Include verification checks in migrations

## Row Level Security (RLS)

### Auth Function Calls
- Always wrap auth function calls in SELECT statements
- Example: `(select auth.uid())` instead of `auth.uid()`
- This prevents unnecessary re-evaluation
- Improves query performance

### Policy Guidelines
1. Avoid multiple permissive policies for the same role and action
2. Use restrictive policies where possible
3. Consolidate overlapping policies
4. Document policy purposes and implications
5. Include verification in migrations

## Migration Security

### Best Practices
1. Always include verification blocks
2. Test migrations in a safe environment first
3. Include rollback procedures
4. Document security implications
5. Review changes with security team

### Verification Requirements
1. Check for remaining warnings
2. Verify security settings
3. Test access controls
4. Validate function behavior
5. Document verification results

## Monitoring and Maintenance

### Regular Tasks
1. Monitor for new security warnings
2. Review function performance
3. Audit RLS policies
4. Update security documentation
5. Test security measures

### Incident Response
1. Document security incidents
2. Review affected components
3. Update security measures
4. Test fixes thoroughly
5. Update documentation

## Related Documentation
- [RLS Policy Best Practices](docs/rls-best-practices.md)
- [Function Security Standards](docs/function-security.md)
- [Security Updates](docs/security-updates-20250326.md) 