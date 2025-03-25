# Row Level Security (RLS) Best Practices

## Policy Creation Guidelines

### Auth Function Calls
- Always wrap auth function calls in SELECT statements
- Example: `(select auth.uid())` instead of `auth.uid()`
- This prevents unnecessary re-evaluation
- Improves query performance
- Example:
```sql
CREATE POLICY "Example policy"
ON public.example_table
USING (
    (select auth.uid()) = user_id
)
WITH CHECK (
    (select auth.uid()) = user_id
);
```

### Policy Types
1. **Restrictive Policies**
   - Use for denying access
   - More efficient than permissive
   - Example:
   ```sql
   CREATE POLICY "Deny access"
   ON public.example_table
   USING (false);
   ```

2. **Permissive Policies**
   - Use sparingly
   - Avoid multiple permissive policies
   - Example:
   ```sql
   CREATE POLICY "Allow access"
   ON public.example_table
   USING (
       (select auth.jwt() ->> 'role') = 'admin'
   );
   ```

## Policy Optimization

### Performance Guidelines
1. Minimize policy complexity
2. Use indexes effectively
3. Avoid redundant checks
4. Consolidate overlapping policies
5. Use restrictive policies where possible

### Common Patterns
1. **User-Specific Access**
   ```sql
   USING (
       (select auth.uid()) = user_id
   )
   ```

2. **Role-Based Access**
   ```sql
   USING (
       (select auth.jwt() ->> 'role') = 'admin'
   )
   ```

3. **Project-Based Access**
   ```sql
   USING (
       EXISTS (
           SELECT 1 FROM project_members
           WHERE project_id = projects.id
           AND user_id = (select auth.uid())
       )
   )
   ```

## Policy Management

### Best Practices
1. Document policy purposes
2. Include verification in migrations
3. Test policies thoroughly
4. Monitor performance impact
5. Regular policy review

### Verification
1. Check for warnings
2. Test access patterns
3. Validate performance
4. Document results
5. Update documentation

## Common Issues and Solutions

### Multiple Permissive Policies
- Problem: Multiple permissive policies for same role/action
- Solution: Consolidate into single policy
- Example:
```sql
-- Before
CREATE POLICY "Admin access"
ON public.example_table
USING (is_admin());

CREATE POLICY "User access"
ON public.example_table
USING (user_id = auth.uid());

-- After
CREATE POLICY "Combined access"
ON public.example_table
USING (
    is_admin() OR
    user_id = (select auth.uid())
);
```

### Auth Function Warnings
- Problem: Unwrapped auth function calls
- Solution: Wrap in SELECT statements
- Example:
```sql
-- Before
USING (auth.uid() = user_id)

-- After
USING ((select auth.uid()) = user_id)
```

## Related Documentation
- [Database Security Guidelines](docs/database-security.md)
- [Function Security Standards](docs/function-security.md)
- [Security Updates](docs/security-updates-20250326.md) 