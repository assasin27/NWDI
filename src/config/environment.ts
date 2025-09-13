interface Environment {
  apiUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  isProduction: boolean;
  isDevelopment: boolean;
}

const development: Environment = {
  apiUrl: 'http://localhost:8000/api/v1',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  isProduction: false,
  isDevelopment: true,
};

const production: Environment = {
  apiUrl: 'https://nwdi.onrender.com/api/v1',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  isProduction: true,
  isDevelopment: false,
};

export const environment: Environment = 
  import.meta.env.MODE === 'production' ? production : development;
