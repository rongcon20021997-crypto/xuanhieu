const fs = require('fs');
const envConfig = fs.readFileSync('.env', 'utf-8').split('\n').reduce((acc, line) => {
  const [key, value] = line.split('=');
  if (key && value) acc[key.trim()] = value.trim();
  return acc;
}, {});
const processEnv = { ...process.env, ...envConfig };
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = processEnv.VITE_XH_SUPABASE_URL;
const supabaseKey = processEnv.VITE_XH_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Cleaning up data inserted by seed3.cjs...");
  
  // Delete products with code starting with DIA-
  const { error: prodError } = await supabase.from('products').delete().like('code', 'DIA-%');
  if (prodError) {
    console.error("Error deleting products:", prodError);
  } else {
    console.log("Successfully deleted products starting with DIA-");
  }

  // Delete categories with code starting with CAT-DIA-
  const { error: catError } = await supabase.from('categories').delete().like('code', 'CAT-DIA-%');
  if (catError) {
    console.error("Error deleting categories:", catError);
  } else {
    console.log("Successfully deleted categories starting with CAT-DIA-");
  }
}

run();
