CREATE TABLE IF NOT EXISTS josaa_cutoffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INT NOT NULL,
    round INT NOT NULL,
    institute_name TEXT NOT NULL,
    academic_program_name TEXT NOT NULL,
    quota VARCHAR(10) NOT NULL,
    seat_type VARCHAR(50) NOT NULL,
    gender_pool VARCHAR(100) NOT NULL,
    opening_rank INT,
    closing_rank INT,
    is_preparatory BOOLEAN DEFAULT FALSE,
    source TEXT DEFAULT 'josaa.nic.in',
    source_url TEXT DEFAULT 'https://josaa.admissions.nic.in/Applicant/SeatAllotmentResult/currentorcr.aspx',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Essential indexes for predictor matching & filtering
CREATE INDEX IF NOT EXISTS idx_josaa_year_round ON josaa_cutoffs (year, round);
CREATE INDEX IF NOT EXISTS idx_josaa_seat_type ON josaa_cutoffs (seat_type);
CREATE INDEX IF NOT EXISTS idx_josaa_quota ON josaa_cutoffs (quota);
CREATE INDEX IF NOT EXISTS idx_josaa_gender_pool ON josaa_cutoffs (gender_pool);
CREATE INDEX IF NOT EXISTS idx_josaa_institute ON josaa_cutoffs (institute_name);
CREATE INDEX IF NOT EXISTS idx_josaa_program ON josaa_cutoffs (academic_program_name);
CREATE INDEX IF NOT EXISTS idx_josaa_closing_rank ON josaa_cutoffs (closing_rank);
