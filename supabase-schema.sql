-- ============================================================
-- QUINIELA MUNDIAL 2026 - Schema para Supabase
-- Ejecuta este SQL en: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Tabla de jugadores (usuarios)
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Predicciones de fase de grupos
CREATE TABLE group_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  match_id TEXT NOT NULL,           -- ej: "A_0", "B_2"
  home_score INTEGER,
  away_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id, match_id)
);

-- Resultados reales de fase de grupos (solo admin)
CREATE TABLE group_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id TEXT UNIQUE NOT NULL,
  home_score INTEGER NOT NULL,
  away_score INTEGER NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Predicciones de eliminatorias
CREATE TABLE knockout_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  match_id TEXT NOT NULL,           -- ej: "R16_0", "QF_1", "SF_0", "FINAL"
  home_team TEXT,
  away_team TEXT,
  home_score INTEGER,
  away_score INTEGER,
  winner TEXT,                      -- para partidos que van a penales
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id, match_id)
);

-- Resultados reales de eliminatorias (solo admin)
CREATE TABLE knockout_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id TEXT UNIQUE NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  winner TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Predicción del campeón final
CREATE TABLE champion_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE UNIQUE,
  team TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Campeón real (solo admin)
CREATE TABLE champion_result (
  id INTEGER DEFAULT 1 PRIMARY KEY,
  team TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);
INSERT INTO champion_result (id) VALUES (1) ON CONFLICT DO NOTHING;

-- RLS (Row Level Security) - habilitar para producción
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE knockout_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE knockout_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE champion_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE champion_result ENABLE ROW LEVEL SECURITY;

-- Políticas: lectura pública, escritura solo autenticado (manejamos auth en API)
CREATE POLICY "public read players" ON players FOR SELECT USING (true);
CREATE POLICY "public read group_predictions" ON group_predictions FOR SELECT USING (true);
CREATE POLICY "public read group_results" ON group_results FOR SELECT USING (true);
CREATE POLICY "public read knockout_predictions" ON knockout_predictions FOR SELECT USING (true);
CREATE POLICY "public read knockout_results" ON knockout_results FOR SELECT USING (true);
CREATE POLICY "public read champion_predictions" ON champion_predictions FOR SELECT USING (true);
CREATE POLICY "public read champion_result" ON champion_result FOR SELECT USING (true);

-- Escritura abierta (controlamos permisos en las API routes de Next.js)
CREATE POLICY "insert players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "insert group_predictions" ON group_predictions FOR INSERT WITH CHECK (true);
CREATE POLICY "update group_predictions" ON group_predictions FOR UPDATE USING (true);
CREATE POLICY "insert group_results" ON group_results FOR INSERT WITH CHECK (true);
CREATE POLICY "update group_results" ON group_results FOR UPDATE USING (true);
CREATE POLICY "insert knockout_predictions" ON knockout_predictions FOR INSERT WITH CHECK (true);
CREATE POLICY "update knockout_predictions" ON knockout_predictions FOR UPDATE USING (true);
CREATE POLICY "insert knockout_results" ON knockout_results FOR INSERT WITH CHECK (true);
CREATE POLICY "update knockout_results" ON knockout_results FOR UPDATE USING (true);
CREATE POLICY "insert champion_predictions" ON champion_predictions FOR INSERT WITH CHECK (true);
CREATE POLICY "update champion_predictions" ON champion_predictions FOR UPDATE USING (true);
CREATE POLICY "update champion_result" ON champion_result FOR UPDATE USING (true);
