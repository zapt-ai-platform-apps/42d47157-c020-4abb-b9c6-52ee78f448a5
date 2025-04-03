-- Create medications table
CREATE TABLE IF NOT EXISTS "medications" (
  "id" SERIAL PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "dosage" TEXT NOT NULL,
  "frequency" TEXT NOT NULL,
  "start_date" DATE NOT NULL,
  "end_date" DATE,
  "notes" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Create side effects table
CREATE TABLE IF NOT EXISTS "side_effects" (
  "id" SERIAL PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "medication_id" INTEGER NOT NULL,
  "symptom" TEXT NOT NULL,
  "severity" INTEGER NOT NULL,
  "time_of_day" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Create daily check-ins table
CREATE TABLE IF NOT EXISTS "daily_checkins" (
  "id" SERIAL PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "overall_feeling" INTEGER NOT NULL,
  "sleep_quality" INTEGER NOT NULL,
  "energy_level" INTEGER NOT NULL,
  "mood" TEXT NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS "reports" (
  "id" SERIAL PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "start_date" DATE NOT NULL,
  "end_date" DATE NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "pdf_url" TEXT
);