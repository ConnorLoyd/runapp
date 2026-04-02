-- Migration 0007: Insert NPC rival groups for auto-seeding new user areas

-- Create a system user to own NPC groups (required by FK constraint)
INSERT OR IGNORE INTO users (id, display_name, color) VALUES ('npc-system', 'System', '#666666');

INSERT OR IGNORE INTO groups (id, name, owner_id, color, invite_code) VALUES
  ('npc-ironclad', 'Ironclad Runners', 'npc-system', '#ef4444', 'NPC-IRON'),
  ('npc-phantom', 'Phantom Stride', 'npc-system', '#8b5cf6', 'NPC-PHAN'),
  ('npc-asphalt', 'Asphalt Kings', 'npc-system', '#f59e0b', 'NPC-ASPH'),
  ('npc-nightowl', 'Night Owls', 'npc-system', '#06b6d4', 'NPC-NITE'),
  ('npc-trailblaze', 'Trailblaze Crew', 'npc-system', '#22c55e', 'NPC-TRAZ'),
  ('npc-concrete', 'Concrete Pack', 'npc-system', '#ec4899', 'NPC-CONC'),
  ('npc-summit', 'Summit Chasers', 'npc-system', '#f97316', 'NPC-SUMM'),
  ('npc-stealth', 'Stealth Fleet', 'npc-system', '#64748b', 'NPC-STLT');
