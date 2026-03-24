INSERT INTO locations (id, name, created_at, updated_at, created_by) VALUES
    (1, 'North Sea Platform A', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
    (2, 'Site Bravo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
    (3, 'Caspian Sector C', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
ALTER TABLE locations ALTER COLUMN id RESTART WITH 4;

INSERT INTO samples (
    id, location_id, depth_m, collected_date,
    unit_weight_kn_per_m3, water_content_percent, shear_strength_kpa,
    created_at, updated_at, created_by
) VALUES
    (1, 1, 12.5, DATE '2024-01-15', 26.5, 42.0, 55.0,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
    (2, 1, 18.0, DATE '2024-01-16', 17.5, 38.0, 62.0,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
    (3, 2, 8.0, DATE '2024-02-01', 19.0, 45.0, 850.0,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
    (4, 2, 10.5, DATE '2024-02-02', 18.0, 40.0, 48.0,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
    (5, 3, 5.0, DATE '2024-03-01', 18.0, 44.0, 50.0,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
    (6, 3, 7.0, DATE '2024-03-05', 19.2, 41.0, 52.0,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
    (7, 3, 9.0, DATE '2024-03-10', 17.8, 43.0, 49.0,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
ALTER TABLE samples ALTER COLUMN id RESTART WITH 8;

INSERT INTO app_users (
    id, username, password_hash, role, created_at, updated_at, created_by
) VALUES
    (1, 'user1',
        '$2a$10$CS79Tn5K.TppTo03oVusM.aDFheNnPCTyb7a9FU5BWzqQzCrX8FYy',
        'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system'),
    (2, 'user2',
        '$2a$10$4/2LKnS1JMCbABv29k2Xc.MRaouEiwyB/gdewLXUQeuifuzzoGKCm',
        'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system');
ALTER TABLE app_users ALTER COLUMN id RESTART WITH 3;
