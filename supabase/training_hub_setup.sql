-- ============================================
-- TRAINING HUB SETUP SCRIPT
-- Run this entire script in Supabase SQL Editor
-- This script enhances scenarios table and creates
-- all tables needed for Training Hub functionality
-- ============================================

-- ============================================
-- STEP 1: Enhance scenarios table
-- ============================================

-- Add new columns to scenarios table
DO $$ 
BEGIN
  -- Rating and review columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scenarios' AND column_name = 'rating') THEN
    ALTER TABLE scenarios ADD COLUMN rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scenarios' AND column_name = 'review_count') THEN
    ALTER TABLE scenarios ADD COLUMN review_count INTEGER DEFAULT 0 CHECK (review_count >= 0);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scenarios' AND column_name = 'completion_count') THEN
    ALTER TABLE scenarios ADD COLUMN completion_count INTEGER DEFAULT 0 CHECK (completion_count >= 0);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scenarios' AND column_name = 'trending_score') THEN
    ALTER TABLE scenarios ADD COLUMN trending_score DECIMAL(5,2) DEFAULT 0 CHECK (trending_score >= 0);
  END IF;
  
  -- Featured scenario columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scenarios' AND column_name = 'subtitle') THEN
    ALTER TABLE scenarios ADD COLUMN subtitle TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scenarios' AND column_name = 'hero_image_url') THEN
    ALTER TABLE scenarios ADD COLUMN hero_image_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scenarios' AND column_name = 'learning_objectives') THEN
    ALTER TABLE scenarios ADD COLUMN learning_objectives TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scenarios' AND column_name = 'prerequisites') THEN
    ALTER TABLE scenarios ADD COLUMN prerequisites TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scenarios' AND column_name = 'estimated_completion_rate') THEN
    ALTER TABLE scenarios ADD COLUMN estimated_completion_rate DECIMAL(5,2) CHECK (estimated_completion_rate >= 0 AND estimated_completion_rate <= 100);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scenarios' AND column_name = 'bookmark_count') THEN
    ALTER TABLE scenarios ADD COLUMN bookmark_count INTEGER DEFAULT 0 CHECK (bookmark_count >= 0);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scenarios' AND column_name = 'last_featured_at') THEN
    ALTER TABLE scenarios ADD COLUMN last_featured_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scenarios' AND column_name = 'featured_priority') THEN
    ALTER TABLE scenarios ADD COLUMN featured_priority INTEGER DEFAULT 0;
  END IF;
  
  RAISE NOTICE '✅ Enhanced scenarios table';
END $$;

-- ============================================
-- STEP 2: Create scenario_reviews table
-- ============================================

CREATE TABLE IF NOT EXISTS scenario_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  helpful_count INTEGER DEFAULT 0 CHECK (helpful_count >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(scenario_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_scenario_reviews_scenario_id ON scenario_reviews(scenario_id);
CREATE INDEX IF NOT EXISTS idx_scenario_reviews_user_id ON scenario_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_scenario_reviews_created_at ON scenario_reviews(created_at DESC);

-- ============================================
-- STEP 3: Create learning_paths table
-- ============================================

CREATE TABLE IF NOT EXISTS learning_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_learning_paths_category ON learning_paths(category);
CREATE INDEX IF NOT EXISTS idx_learning_paths_order ON learning_paths(order_index);

-- ============================================
-- STEP 4: Create learning_path_modules table
-- ============================================

CREATE TABLE IF NOT EXISTS learning_path_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_path_id uuid NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  scenario_id uuid NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  module_order INTEGER NOT NULL CHECK (module_order >= 0),
  is_required BOOLEAN DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(learning_path_id, scenario_id)
);

CREATE INDEX IF NOT EXISTS idx_learning_path_modules_path_id ON learning_path_modules(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_modules_scenario_id ON learning_path_modules(scenario_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_modules_order ON learning_path_modules(learning_path_id, module_order);

-- ============================================
-- STEP 5: Create user_learning_path_progress table
-- ============================================

CREATE TABLE IF NOT EXISTS user_learning_path_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  learning_path_id uuid NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed', 'locked')) DEFAULT 'not_started',
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  completed_modules INTEGER DEFAULT 0 CHECK (completed_modules >= 0),
  total_modules INTEGER DEFAULT 0 CHECK (total_modules >= 0),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, learning_path_id)
);

CREATE INDEX IF NOT EXISTS idx_user_learning_path_progress_user_id ON user_learning_path_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_path_progress_path_id ON user_learning_path_progress(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_path_progress_status ON user_learning_path_progress(user_id, status);

-- ============================================
-- STEP 6: Create user_scenario_bookmarks table
-- ============================================

CREATE TABLE IF NOT EXISTS user_scenario_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scenario_id uuid NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, scenario_id)
);

CREATE INDEX IF NOT EXISTS idx_user_scenario_bookmarks_user_id ON user_scenario_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_scenario_bookmarks_scenario_id ON user_scenario_bookmarks(scenario_id);

-- ============================================
-- STEP 7: Enhance user_scenario_progress table
-- ============================================

DO $$
BEGIN
  -- Add columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_scenario_progress' AND column_name = 'last_accessed_at') THEN
    ALTER TABLE user_scenario_progress ADD COLUMN last_accessed_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_scenario_progress' AND column_name = 'attempts_count') THEN
    ALTER TABLE user_scenario_progress ADD COLUMN attempts_count INTEGER DEFAULT 0 CHECK (attempts_count >= 0);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_scenario_progress' AND column_name = 'best_score') THEN
    ALTER TABLE user_scenario_progress ADD COLUMN best_score INTEGER CHECK (best_score >= 0 AND best_score <= 100);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_scenario_progress' AND column_name = 'is_bookmarked') THEN
    ALTER TABLE user_scenario_progress ADD COLUMN is_bookmarked BOOLEAN DEFAULT false;
  END IF;
  
  RAISE NOTICE '✅ Enhanced user_scenario_progress table';
END $$;

-- ============================================
-- STEP 8: Create updated_at trigger function (if not exists)
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 9: Create triggers for updated_at
-- ============================================

DROP TRIGGER IF EXISTS update_scenario_reviews_updated_at ON scenario_reviews;
CREATE TRIGGER update_scenario_reviews_updated_at 
  BEFORE UPDATE ON scenario_reviews 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_learning_paths_updated_at ON learning_paths;
CREATE TRIGGER update_learning_paths_updated_at 
  BEFORE UPDATE ON learning_paths 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_learning_path_progress_updated_at ON user_learning_path_progress;
CREATE TRIGGER update_user_learning_path_progress_updated_at 
  BEFORE UPDATE ON user_learning_path_progress 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 10: Create triggers for data integrity
-- ============================================

-- Trigger: Update scenario rating and review_count when review is created/updated/deleted
CREATE OR REPLACE FUNCTION update_scenario_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- Recalculate rating after deletion
    UPDATE scenarios
    SET 
      rating = COALESCE((
        SELECT AVG(rating)::DECIMAL(3,2)
        FROM scenario_reviews
        WHERE scenario_id = OLD.scenario_id
      ), 0.0),
      review_count = GREATEST(0, (
        SELECT COUNT(*)
        FROM scenario_reviews
        WHERE scenario_id = OLD.scenario_id
      ))
    WHERE id = OLD.scenario_id;
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Recalculate rating after insert/update
    UPDATE scenarios
    SET 
      rating = COALESCE((
        SELECT AVG(rating)::DECIMAL(3,2)
        FROM scenario_reviews
        WHERE scenario_id = NEW.scenario_id
      ), 0.0),
      review_count = (
        SELECT COUNT(*)
        FROM scenario_reviews
        WHERE scenario_id = NEW.scenario_id
      )
    WHERE id = NEW.scenario_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_scenario_rating ON scenario_reviews;
CREATE TRIGGER trigger_update_scenario_rating
  AFTER INSERT OR UPDATE OR DELETE ON scenario_reviews
  FOR EACH ROW EXECUTE FUNCTION update_scenario_rating();

-- Trigger: Update scenario completion_count when session is completed
CREATE OR REPLACE FUNCTION update_scenario_completion_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE scenarios
    SET completion_count = completion_count + 1
    WHERE id = NEW.scenario_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_scenario_completion_count ON sessions;
CREATE TRIGGER trigger_update_scenario_completion_count
  AFTER INSERT OR UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_scenario_completion_count();

-- Trigger: Update scenario bookmark_count when bookmark is created/deleted
CREATE OR REPLACE FUNCTION update_scenario_bookmark_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE scenarios
    SET bookmark_count = bookmark_count + 1
    WHERE id = NEW.scenario_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE scenarios
    SET bookmark_count = GREATEST(0, bookmark_count - 1)
    WHERE id = OLD.scenario_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_scenario_bookmark_count ON user_scenario_bookmarks;
CREATE TRIGGER trigger_update_scenario_bookmark_count
  AFTER INSERT OR DELETE ON user_scenario_bookmarks
  FOR EACH ROW EXECUTE FUNCTION update_scenario_bookmark_count();

-- Trigger: Update learning path progress when module is completed
CREATE OR REPLACE FUNCTION update_learning_path_progress()
RETURNS TRIGGER AS $$
DECLARE
  v_path_ids uuid[];
  v_path_id uuid;
  v_total_modules INTEGER;
  v_completed_modules INTEGER;
  v_progress_percent INTEGER;
BEGIN
  -- Only process if status changed to completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Get all learning paths that include this scenario
    SELECT ARRAY_AGG(DISTINCT learning_path_id) INTO v_path_ids
    FROM learning_path_modules
    WHERE scenario_id = NEW.scenario_id;
    
    -- Update progress for each learning path
    IF v_path_ids IS NOT NULL THEN
      FOREACH v_path_id IN ARRAY v_path_ids
      LOOP
        -- Get total modules in path
        SELECT COUNT(*) INTO v_total_modules
        FROM learning_path_modules
        WHERE learning_path_id = v_path_id;
        
        -- Count completed modules for this user in this path
        SELECT COUNT(DISTINCT lpm.scenario_id) INTO v_completed_modules
        FROM learning_path_modules lpm
        INNER JOIN user_scenario_progress usp ON usp.scenario_id = lpm.scenario_id
        WHERE lpm.learning_path_id = v_path_id
          AND usp.user_id = NEW.user_id
          AND usp.status = 'completed';
        
        -- Calculate progress
        v_progress_percent := CASE 
          WHEN v_total_modules > 0 THEN (v_completed_modules * 100 / v_total_modules)
          ELSE 0
        END;
        
        -- Update or insert learning path progress
        INSERT INTO user_learning_path_progress (
          user_id, learning_path_id, progress_percent, 
          completed_modules, total_modules, status, started_at
        )
        VALUES (
          NEW.user_id, v_path_id, v_progress_percent,
          v_completed_modules, v_total_modules, 
          CASE WHEN v_progress_percent = 100 THEN 'completed' ELSE 'in_progress' END,
          COALESCE((SELECT started_at FROM user_learning_path_progress WHERE user_id = NEW.user_id AND learning_path_id = v_path_id), now())
        )
        ON CONFLICT (user_id, learning_path_id) DO UPDATE
        SET 
          progress_percent = v_progress_percent,
          completed_modules = v_completed_modules,
          total_modules = v_total_modules,
          status = CASE WHEN v_progress_percent = 100 THEN 'completed' ELSE 'in_progress' END,
          completed_at = CASE WHEN v_progress_percent = 100 THEN now() ELSE completed_at END,
          updated_at = now();
      END LOOP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_learning_path_progress ON user_scenario_progress;
CREATE TRIGGER trigger_update_learning_path_progress
  AFTER INSERT OR UPDATE ON user_scenario_progress
  FOR EACH ROW EXECUTE FUNCTION update_learning_path_progress();

-- ============================================
-- STEP 11: Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on new tables
ALTER TABLE scenario_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_path_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_path_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_scenario_bookmarks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all scenario reviews" ON scenario_reviews;
DROP POLICY IF EXISTS "Users can create own reviews" ON scenario_reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON scenario_reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON scenario_reviews;
DROP POLICY IF EXISTS "Everyone can view active learning paths" ON learning_paths;
DROP POLICY IF EXISTS "Users can view own learning path progress" ON user_learning_path_progress;
DROP POLICY IF EXISTS "Users can update own learning path progress" ON user_learning_path_progress;
DROP POLICY IF EXISTS "Users can view own bookmarks" ON user_scenario_bookmarks;
DROP POLICY IF EXISTS "Users can create own bookmarks" ON user_scenario_bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON user_scenario_bookmarks;

-- Scenario Reviews Policies
CREATE POLICY "Users can view all scenario reviews" ON scenario_reviews
  FOR SELECT USING (true); -- Reviews are public

CREATE POLICY "Users can create own reviews" ON scenario_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON scenario_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON scenario_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Learning Paths Policies (public read, admin write)
CREATE POLICY "Everyone can view active learning paths" ON learning_paths
  FOR SELECT USING (is_active = true);

-- Learning Path Modules Policies (public read)
CREATE POLICY "Everyone can view learning path modules" ON learning_path_modules
  FOR SELECT USING (true);

-- User Learning Path Progress Policies
CREATE POLICY "Users can view own learning path progress" ON user_learning_path_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own learning path progress" ON user_learning_path_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning path progress" ON user_learning_path_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Scenario Bookmarks Policies
CREATE POLICY "Users can view own bookmarks" ON user_scenario_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookmarks" ON user_scenario_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON user_scenario_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- STEP 12: Additional Indexes for Performance
-- ============================================

-- Scenarios table indexes
CREATE INDEX IF NOT EXISTS idx_scenarios_category ON scenarios(category);
CREATE INDEX IF NOT EXISTS idx_scenarios_difficulty ON scenarios(difficulty);
CREATE INDEX IF NOT EXISTS idx_scenarios_rating ON scenarios(rating DESC);
CREATE INDEX IF NOT EXISTS idx_scenarios_is_featured ON scenarios(is_featured, featured_priority DESC);
CREATE INDEX IF NOT EXISTS idx_scenarios_is_active ON scenarios(is_active);
CREATE INDEX IF NOT EXISTS idx_scenarios_trending_score ON scenarios(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_scenarios_tags ON scenarios USING GIN(tags);

-- ============================================
-- STEP 13: Seed Initial Data
-- ============================================

DO $$
DECLARE
  v_user_id uuid;
  v_scenario_id_1 uuid;
  v_scenario_id_2 uuid;
  v_scenario_id_3 uuid;
  v_learning_path_id_1 uuid;
  v_learning_path_id_2 uuid;
  v_learning_path_id_3 uuid;
BEGIN
  -- Get current user ID (first authenticated user)
  SELECT id INTO v_user_id FROM profiles LIMIT 1;
  
  -- Get existing scenario IDs
  SELECT id INTO v_scenario_id_1 FROM scenarios WHERE title LIKE '%High-Value Client%' LIMIT 1;
  SELECT id INTO v_scenario_id_2 FROM scenarios WHERE title LIKE '%Escalated Complaint%' LIMIT 1;
  SELECT id INTO v_scenario_id_3 FROM scenarios WHERE title LIKE '%Performance Review%' LIMIT 1;
  
  -- Update existing scenarios with new fields
  IF v_scenario_id_1 IS NOT NULL THEN
    UPDATE scenarios SET
      rating = 4.5,
      review_count = 12,
      completion_count = 45,
      subtitle = 'Masterclass',
      hero_image_url = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
      learning_objectives = ARRAY['Master negotiation tactics', 'Handle objections', 'Build rapport'],
      estimated_completion_rate = 85.0,
      featured_priority = 10,
      is_featured = true,
      last_featured_at = now()
    WHERE id = v_scenario_id_1;
  END IF;
  
  IF v_scenario_id_2 IS NOT NULL THEN
    UPDATE scenarios SET
      rating = 4.2,
      review_count = 8,
      completion_count = 32,
      learning_objectives = ARRAY['Handle complaints', 'Show empathy', 'Resolve conflicts'],
      estimated_completion_rate = 78.0
    WHERE id = v_scenario_id_2;
  END IF;
  
  IF v_scenario_id_3 IS NOT NULL THEN
    UPDATE scenarios SET
      rating = 4.0,
      review_count = 5,
      completion_count = 18,
      learning_objectives = ARRAY['Conduct reviews', 'Give feedback', 'Set goals'],
      estimated_completion_rate = 72.0
    WHERE id = v_scenario_id_3;
  END IF;
  
  -- Create Learning Paths
  INSERT INTO learning_paths (title, description, category, icon, order_index, is_active)
  VALUES 
    ('Onboarding Essentials', 'Essential training for new employees', 'Onboarding', 'school', 1, true),
    ('Advanced Sales', 'Master advanced sales techniques', 'Sales', 'trending_up', 2, true),
    ('Leadership Core', 'Core leadership and management skills', 'Leadership', 'groups', 3, true)
  ON CONFLICT DO NOTHING;
  
  -- Get learning path IDs
  SELECT id INTO v_learning_path_id_1 FROM learning_paths WHERE title = 'Onboarding Essentials' LIMIT 1;
  SELECT id INTO v_learning_path_id_2 FROM learning_paths WHERE title = 'Advanced Sales' LIMIT 1;
  SELECT id INTO v_learning_path_id_3 FROM learning_paths WHERE title = 'Leadership Core' LIMIT 1;
  
  -- Create Learning Path Modules
  IF v_learning_path_id_1 IS NOT NULL AND v_scenario_id_2 IS NOT NULL THEN
    INSERT INTO learning_path_modules (learning_path_id, scenario_id, module_order, is_required)
    VALUES (v_learning_path_id_1, v_scenario_id_2, 1, true)
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF v_learning_path_id_2 IS NOT NULL AND v_scenario_id_1 IS NOT NULL THEN
    INSERT INTO learning_path_modules (learning_path_id, scenario_id, module_order, is_required)
    VALUES (v_learning_path_id_2, v_scenario_id_1, 1, true)
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF v_learning_path_id_3 IS NOT NULL AND v_scenario_id_3 IS NOT NULL THEN
    INSERT INTO learning_path_modules (learning_path_id, scenario_id, module_order, is_required)
    VALUES (v_learning_path_id_3, v_scenario_id_3, 1, true)
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Create User Learning Path Progress (if user exists)
  IF v_user_id IS NOT NULL THEN
    IF v_learning_path_id_1 IS NOT NULL THEN
      INSERT INTO user_learning_path_progress (
        user_id, learning_path_id, status, progress_percent, 
        completed_modules, total_modules, started_at
      )
      VALUES (
        v_user_id, v_learning_path_id_1, 'completed', 100, 1, 1, 
        (now() - interval '30 days')::timestamptz
      )
      ON CONFLICT (user_id, learning_path_id) DO UPDATE
      SET status = 'completed', progress_percent = 100, updated_at = now();
    END IF;
    
    IF v_learning_path_id_2 IS NOT NULL THEN
      INSERT INTO user_learning_path_progress (
        user_id, learning_path_id, status, progress_percent,
        completed_modules, total_modules, started_at
      )
      VALUES (
        v_user_id, v_learning_path_id_2, 'in_progress', 75, 3, 4,
        (now() - interval '15 days')::timestamptz
      )
      ON CONFLICT (user_id, learning_path_id) DO UPDATE
      SET status = 'in_progress', progress_percent = 75, updated_at = now();
    END IF;
    
    IF v_learning_path_id_3 IS NOT NULL THEN
      INSERT INTO user_learning_path_progress (
        user_id, learning_path_id, status, progress_percent,
        completed_modules, total_modules
      )
      VALUES (
        v_user_id, v_learning_path_id_3, 'locked', 0, 0, 1
      )
      ON CONFLICT (user_id, learning_path_id) DO NOTHING;
    END IF;
    
    -- Create sample reviews (if user and scenarios exist)
    IF v_scenario_id_1 IS NOT NULL THEN
      INSERT INTO scenario_reviews (scenario_id, user_id, rating, review_text)
      VALUES (
        v_scenario_id_1, v_user_id, 5,
        'Excellent scenario! Really helped me understand negotiation tactics.'
      )
      ON CONFLICT (scenario_id, user_id) DO NOTHING;
    END IF;
    
    -- Create sample bookmark
    IF v_scenario_id_1 IS NOT NULL THEN
      INSERT INTO user_scenario_bookmarks (user_id, scenario_id)
      VALUES (v_user_id, v_scenario_id_1)
      ON CONFLICT (user_id, scenario_id) DO NOTHING;
    END IF;
  END IF;
  
  RAISE NOTICE '✅ Training Hub setup completed successfully!';
  RAISE NOTICE 'Learning Paths created: %, %, %', v_learning_path_id_1, v_learning_path_id_2, v_learning_path_id_3;
  
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check scenarios enhancements
SELECT 
  'Scenarios Enhanced' as check_type,
  COUNT(*) FILTER (WHERE rating IS NOT NULL) as scenarios_with_rating,
  COUNT(*) FILTER (WHERE subtitle IS NOT NULL) as scenarios_with_subtitle,
  COUNT(*) FILTER (WHERE is_featured = true) as featured_scenarios
FROM scenarios;

-- Check new tables
SELECT 'scenario_reviews' as table_name, COUNT(*) as row_count FROM scenario_reviews
UNION ALL
SELECT 'learning_paths', COUNT(*) FROM learning_paths
UNION ALL
SELECT 'learning_path_modules', COUNT(*) FROM learning_path_modules
UNION ALL
SELECT 'user_learning_path_progress', COUNT(*) FROM user_learning_path_progress
UNION ALL
SELECT 'user_scenario_bookmarks', COUNT(*) FROM user_scenario_bookmarks;

-- Check RLS policies
SELECT 
  schemaname || '.' || tablename as table_name,
  policyname,
  '✅' as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'scenario_reviews',
    'learning_paths',
    'learning_path_modules',
    'user_learning_path_progress',
    'user_scenario_bookmarks'
  )
ORDER BY tablename, policyname;

