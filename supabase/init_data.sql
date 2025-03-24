-- Initialize basic data for Folio

-- Insert default company settings
INSERT INTO company_settings (
  id, 
  name, 
  logo_url, 
  theme_color, 
  contact_email
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Folio',
  'https://example.com/logo.png',
  '#3498db',
  'contact@example.com'
)
ON CONFLICT (id) DO NOTHING;

-- Insert some default verticals
INSERT INTO verticals (name, slug, color)
VALUES 
  ('SaaS', 'saas', '#3498db'),
  ('E-commerce', 'ecommerce', '#2ecc71'),
  ('Fintech', 'fintech', '#9b59b6'),
  ('Healthcare', 'healthcare', '#e74c3c'),
  ('Education', 'education', '#f39c12')
ON CONFLICT (slug) DO NOTHING;

-- You can run this script in the Supabase SQL editor to initialize basic data
-- Note: This should be run after the schema has been created
