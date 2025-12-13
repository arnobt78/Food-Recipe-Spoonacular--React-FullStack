-- AlterTable: Add userId and updatedAt columns to FavouriteRecipes if they don't exist
-- This migration handles the case where FavouriteRecipes table exists without these columns

DO $$ 
BEGIN
    -- Add userId column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'FavouriteRecipes' 
        AND column_name = 'userId'
    ) THEN
        ALTER TABLE "FavouriteRecipes" ADD COLUMN "userId" TEXT;
        CREATE INDEX IF NOT EXISTS "FavouriteRecipes_userId_idx" ON "FavouriteRecipes"("userId");
        
        -- Add foreign key constraint if User table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'User') THEN
            ALTER TABLE "FavouriteRecipes" 
            ADD CONSTRAINT "FavouriteRecipes_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
    END IF;

    -- Add createdAt column if it doesn't exist (with default for existing rows)
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'FavouriteRecipes' 
        AND column_name = 'createdAt'
    ) THEN
        ALTER TABLE "FavouriteRecipes" 
        ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- Add updatedAt column if it doesn't exist (with default for existing rows)
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'FavouriteRecipes' 
        AND column_name = 'updatedAt'
    ) THEN
        ALTER TABLE "FavouriteRecipes" 
        ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

