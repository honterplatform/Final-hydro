import { createClient } from '@supabase/supabase-js';

// Supabase configuration for the new project
const supabaseUrl = 'https://qaxjziqgzckyidmvobev.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFheGp6aXFnemNreWlkbXZvYmV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MzI2MjIsImV4cCI6MjA3NjIwODYyMn0.87VwhwJLFuZPwaRP2O-4XA4xozlX1FErTg08aP7SsJE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Real representative data with contact information
const realReps = [
  { rep_name: "Brian Wright", states: ["CA", "NV", "AZ", "NM", "UT", "CO", "WY", "MT", "ID", "WA", "OR"], profile_image: "", email: "brianw@hydroblok.com", phone: "(206) 423-0705" },
  { rep_name: "Kurt Hodson", states: ["CA", "NV", "AZ", "NM", "UT", "CO", "WY", "MT", "ID", "WA", "OR"], profile_image: "", email: "kurth@hydroblok.com", phone: "(541) 647-0553" },
  { rep_name: "Alex Ananko", states: ["WA", "ID"], profile_image: "", email: "alexa@hydroblok.com", phone: "(425) 359-5791" },
  { rep_name: "Aaron Schultz", states: ["WA", "ID", "MT"], profile_image: "", email: "aarons@hydroblok.com", phone: "(206) 741-7033" },
  { rep_name: "Will McHarness", states: ["OR"], profile_image: "", email: "willm@hydroblok.com", phone: "(971) 710-5606" },
  { rep_name: "Rick Coury", states: ["CA", "NV"], profile_image: "", email: "rickc@hydroblok.com", phone: "(714) 915-1995" },
  { rep_name: "Pat Tuel", states: ["CA", "NV"], profile_image: "", email: "patt@hydroblok.com", phone: "(925) 584-9825" },
  { rep_name: "Trina Tuel", states: ["CA", "NV"], profile_image: "", email: "trina@sandkmarketiinggroupllc.com", phone: "(925) 595-3794" },
  { rep_name: "Todd Morris", states: ["AZ", "NM", "UT", "CO", "WY", "MT", "ID"], profile_image: "", email: "toddm@hydroblokusa.com", phone: "(253) 225-1885" },
  { rep_name: "Phil Kristianson", states: ["HI"], profile_image: "", email: "philk@hydroblok.com", phone: "(916) 439-7585" },
  { rep_name: "Lilly Kristianson", states: ["HI"], profile_image: "", email: "lillyk@hydroblok.com", phone: "(916) 439-7585" },
  { rep_name: "Dan Livesay", states: ["NE", "KS", "OK", "AR", "MO"], profile_image: "", email: "danl@hydroblok.com", phone: "(501) 520-9609" },
  { rep_name: "Jacob Welch", states: ["TX"], profile_image: "", email: "jacob.w@hydroblok.com", phone: "(832) 322-9921" },
  { rep_name: "Joe Gebbia", states: ["MI", "MN", "WI", "IL", "IN", "OH", "KY", "IA"], profile_image: "", email: "jgebbia@hydroblok.com", phone: "(262) 278-3488" },
  { rep_name: "Ken Smith", states: ["PA", "NJ", "DE"], profile_image: "", email: "kens@hydroblok.com", phone: "(215) 237-2509" },
  { rep_name: "Randy Blackmon", states: ["FL", "GA", "AL", "NC", "SC", "TN"], profile_image: "", email: "randyb@hydroblok.com", phone: "(404) 386-4860" },
  { rep_name: "Luke Rice", states: ["PA", "NY", "NH", "MA", "CT", "RI", "MD", "VA", "VT", "ME"], profile_image: "", email: "luke@hydroblok.com", phone: "(610) 301-9993" },
  { rep_name: "Jeremy Ross", states: ["LA", "MS", "TN"], profile_image: "", email: "jeremy@hydroblok.com", phone: "(225) 278-0736" }
];

async function populateDatabase() {
  console.log('🚀 Setting up new Supabase database...');
  console.log('📝 Project URL:', supabaseUrl);
  console.log('');
  
  try {
    // First, clear any existing data
    console.log('🗑️ Clearing existing data (if any)...');
    const { error: deleteError } = await supabase
      .from('representatives')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (deleteError && deleteError.code !== 'PGRST204') {
      // PGRST204 means no rows found, which is fine
      console.log('⚠️ Note:', deleteError.message);
    } else {
      console.log('✅ Data cleared successfully');
    }
    
    console.log('');
    console.log('📊 Inserting representative data...');
    console.log(`   Inserting ${realReps.length} representatives...`);
    
    // Insert real data with contact information
    const { data, error } = await supabase
      .from('representatives')
      .insert(realReps)
      .select();
    
    if (error) {
      console.error('❌ Error inserting data:', error);
      console.log('');
      console.log('💡 Make sure you have run the SQL setup script first!');
      console.log('   Go to Supabase Dashboard → SQL Editor and run setup-new-supabase.sql');
      return;
    }
    
    console.log('✅ Data inserted successfully!');
    console.log(`   Inserted ${data.length} representatives with contact information`);
    console.log('');
    
    // Verify the data
    console.log('🔍 Verifying contact information...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('representatives')
      .select('rep_name, email, phone')
      .limit(5);
    
    if (verifyError) {
      console.error('❌ Error verifying data:', verifyError);
      return;
    }
    
    console.log('✅ Sample data verification:');
    verifyData.forEach(rep => {
      console.log(`   ✓ ${rep.rep_name}: ${rep.email}, ${rep.phone}`);
    });
    console.log('');
    
    // Check real-time status
    console.log('📡 Checking real-time configuration...');
    const { data: realtimeCheck } = await supabase
      .from('representatives')
      .select('*')
      .limit(1);
    
    if (realtimeCheck !== null) {
      console.log('✅ Real-time appears to be configured');
    }
    
    console.log('');
    console.log('🎉 Database setup complete!');
    console.log('💡 Your app is now connected to the new Supabase project!');
    console.log('📞 Test the "Let\'s Talk" buttons to see the real contact information.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    console.log('');
    console.log('💡 Make sure:');
    console.log('   1. You have run setup-new-supabase.sql in the Supabase SQL Editor');
    console.log('   2. The table "representatives" exists');
    console.log('   3. RLS policies are configured correctly');
  }
}

populateDatabase();

