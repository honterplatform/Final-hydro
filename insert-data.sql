-- Clear existing data
DELETE FROM representatives;

-- Insert all representatives with new fields
INSERT INTO representatives (rep_name, states, cta_url, email, phone, profile_image, webhook, color, territory, region) VALUES
('Aaron Schultz', ARRAY['WA', 'AK'], '#', 'aarons@hydroblok.com', '(206) 741-7033', NULL, 'https://hooks.zapier.com/hooks/catch/9970204/uii2gv7/', '#509E2E', 'Washington, Alaska', NULL),
('Will McHarness', ARRAY['OR'], '#', 'willm@hydroblok.com', '(971) 710-5606', NULL, 'https://hooks.zapier.com/hooks/catch/9970204/uii1k61/', '#63B839', 'Oregon', NULL),
('Rick Coury', ARRAY['CA', 'NV'], '#', 'rickc@hydroblok.com', '(714) 915-1995', NULL, 'https://hooks.zapier.com/hooks/catch/9970204/uii1ahv/', '#3D7A23', 'Southern California & Southern Nevada', 'Southern'),
('Pat & Trina Tuel', ARRAY['CA', 'NV'], '#', 'patt@hydroblok.com', '(925) 584-9825', NULL, 'https://hooks.zapier.com/hooks/catch/9970204/uii1lyk/', '#76D047', 'Northern California & Northern Nevada', 'Northern'),
('Todd Morris', ARRAY['AZ', 'NM', 'UT', 'CO', 'WY', 'MT', 'ID'], '#', 'toddm@hydroblokusa.com', '(253) 225-1885', NULL, 'https://hooks.zapier.com/hooks/catch/9970204/uii1cic/', '#429525', 'Mountain & SW Region', NULL),
('Phil & Lilly Kristianson', ARRAY['HI'], '#', 'philk@hydroblok.com', '(916) 439-7585', NULL, 'https://hooks.zapier.com/hooks/catch/9970204/uii10kl/', '#8FE85C', 'Hawaii', NULL),
('Dan Livesay', ARRAY['NE', 'KS', 'OK', 'AR', 'MO'], '#', 'danl@hydroblok.com', '(501) 520-9609', NULL, 'https://hooks.zapier.com/hooks/catch/9970204/uii1p29/', '#2F6B1C', 'Nebraska, Kansas, Oklahoma, Arkansas & Missouri', NULL),
('Jacob Welch', ARRAY['TX'], '#', 'jacob.w@hydroblok.com', '(832) 322-9921', NULL, 'https://hooks.zapier.com/hooks/catch/9970204/uii1jr8/', '#5CAD38', 'Texas', NULL),
('Joe Gebbia', ARRAY['MI', 'MN', 'WI', 'IL', 'IN', 'OH', 'KY', 'IA'], '#', 'jgebbia@hydroblok.com', '(262) 278-3488', NULL, 'https://hooks.zapier.com/hooks/catch/9970204/uii9yaw/', '#A3F871', 'Michigan, Minnesota, Wisconsin, Illinois, Indiana, Ohio, Kentucky, Iowa', NULL),
('Ken Smith', ARRAY['PA', 'NJ', 'DE'], '#', 'kens@hydroblok.com', '(215) 237-2509', NULL, 'https://hooks.zapier.com/hooks/catch/9970204/uii9b42/', '#35811F', 'East Pennsylvania, New Jersey, Delaware', 'East'),
('Randy Blackmon', ARRAY['FL', 'GA', 'AL', 'NC', 'SC', 'TN'], '#', 'randyb@hydroblok.com', '(404) 386-4860', NULL, 'https://hooks.zapier.com/hooks/catch/9970204/uii9243/', '#6BC744', 'Florida, Georgia, Alabama, North Carolina, South Carolina, Middle & East Tennessee', 'Middle & East'),
('Luke Rice', ARRAY['PA', 'NY', 'NH', 'MA', 'CT', 'RI', 'MD', 'VA', 'VT', 'ME'], '#', 'luke@hydroblok.com', '(610) 301-9993', NULL, 'https://hooks.zapier.com/hooks/catch/9970204/uii9uj0/', '#4A9129', 'West Pennsylvania, New York (but not NYC), New Hampshire, Massachusetts, Connecticut, Rhode Island, Maryland, Virginia, Vermont, Maine', 'West'),
('Jeremy Ross', ARRAY['LA', 'MS', 'TN'], '#', 'jeremy@hydroblok.com', '(225) 278-0736', NULL, 'https://hooks.zapier.com/hooks/catch/9970204/uii94vk/', '#B8FF80', 'Louisiana, Mississippi, Western Tennessee', 'Western');

-- Verify the data was inserted
SELECT rep_name, states, color, territory, region FROM representatives ORDER BY rep_name;

