import { createClient } from '@supabase/supabase-js';
import { reps } from './src/data/reps.js';

// Supabase connection
const SUPABASE_URL = 'https://iwduqebhrphrzuzrqnyv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3ZHVxZWJocnBocnp1enJxbnl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDczNTEsImV4cCI6MjA3NjIyMzM1MX0.ilNCgl1NCxVYRknNhoPEidNOxHQFM6lHtLpGMWvyjG0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function populateDatabase() {
  console.log('🔄 Starting database population...\n');

  try {
    // Step 1: Clear existing data
    console.log('🗑️  Clearing existing representatives...');
    const { error: deleteError } = await supabase
      .from('representatives')
      .delete()
      .neq('id', 0); // Delete all rows

    if (deleteError) {
      console.error('❌ Error clearing data:', deleteError);
      return;
    }
    console.log('✅ Existing data cleared\n');

    // Step 2: Transform and insert new data
    console.log('📝 Inserting new representatives...');
    
    const transformedReps = reps.map(rep => ({
      rep_name: rep.rep,
      states: rep.states,
      cta_url: rep.ctaUrl || '#',
      profile_image: rep.profileImage || null,
      email: rep.email || null,
      phone: rep.phone || null,
      webhook: rep.webhook || null,
      color: rep.color || null,
      territory: rep.territory || null,
      region: rep.region || null
    }));

    const { data, error: insertError } = await supabase
      .from('representatives')
      .insert(transformedReps)
      .select();

    if (insertError) {
      console.error('❌ Error inserting data:', insertError);
      return;
    }

    console.log(`✅ Successfully inserted ${data.length} representatives\n`);
    
    // Step 3: Display summary
    console.log('📊 Summary:');
    data.forEach(rep => {
      console.log(`   - ${rep.rep_name}: ${rep.states.join(', ')} (${rep.color || 'no color'})`);
    });

    console.log('\n🎉 Database population complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Verify data in Supabase dashboard');
    console.log('   2. Run the app and check that everything works');
    console.log('   3. Try adding/editing a rep in the admin panel\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
populateDatabase();

