const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addImageColumns() {
    console.log('Adding logo_url and cover_image_url columns to organizations table...');

    // Execute the migration SQL directly via RPC
    const migrationSql = `
        ALTER TABLE organizations
          ADD COLUMN IF NOT EXISTS logo_url TEXT,
          ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
        
        COMMENT ON COLUMN organizations.logo_url IS '企業ロゴ画像のURL';
        COMMENT ON COLUMN organizations.cover_image_url IS '企業カバー画像のURL';
    `;

    // Note: Supabase doesn't allow DDL via the REST API directly.
    // We need to use the SQL Editor or supabase CLI.
    // For now, let's manually update existing organizations with image URLs
    // assuming the columns exist or will be added manually.

    console.log('Note: Schema changes must be applied via Supabase Dashboard SQL Editor or CLI.');
    console.log('Please run the following SQL in Supabase Dashboard:');
    console.log(migrationSql);
    console.log('\nProceeding to update organization image URLs...\n');
}

async function updateOrganizationImages() {
    console.log('Updating organization images...');

    // Fetch all organizations
    const { data: orgs, error: fetchError } = await supabase
        .from('organizations')
        .select('id, name');

    if (fetchError) {
        console.error('Error fetching organizations:', fetchError);
        return;
    }

    console.log(`Found ${orgs.length} organizations`);

    // Sample images for different types of companies
    const sampleImages = {
        logo: [
            'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200',
            'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?auto=format&fit=crop&w=200',
            'https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=200',
        ],
        cover: [
            'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200',
            'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200',
            'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200',
            'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200',
            'https://images.unsplash.com/photo-1497366858526-0766cadbe8fa?auto=format&fit=crop&w=1200',
        ]
    };

    // Update each organization with logo and cover image
    for (let i = 0; i < orgs.length; i++) {
        const org = orgs[i];
        const logoUrl = sampleImages.logo[i % sampleImages.logo.length];
        const coverImageUrl = sampleImages.cover[i % sampleImages.cover.length];

        const { error: updateError } = await supabase
            .from('organizations')
            .update({
                logo_url: logoUrl,
                cover_image_url: coverImageUrl
            })
            .eq('id', org.id);

        if (updateError) {
            console.error(`Error updating organization ${org.name}:`, updateError);
        } else {
            console.log(`✓ Updated ${org.name} with images`);
        }
    }

    console.log('\nOrganization images update complete!');
}

async function main() {
    await addImageColumns();
    console.log('\nWaiting 3 seconds before updating data...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    await updateOrganizationImages();
}

main();
