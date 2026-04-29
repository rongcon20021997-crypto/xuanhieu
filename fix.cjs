const fs = require('fs');
const envConfig = fs.readFileSync('.env', 'utf-8').split('\n').reduce((acc, line) => {
  const [key, value] = line.split('=');
  if (key && value) acc[key.trim()] = value.trim();
  return acc;
}, {});
const processEnv = { ...process.env, ...envConfig };
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(processEnv.VITE_XH_SUPABASE_URL, processEnv.VITE_XH_SUPABASE_ANON_KEY);

async function run() {
  await supabase.from('categories').delete().eq('name', 'Combo Đặc Biệt');
  await supabase.from('categories').delete().eq('name', 'Sơn Gel');
  
  const { data } = await supabase.from('categories').select('name, is_active');
  console.log("Current categories:", data);
}

run();
