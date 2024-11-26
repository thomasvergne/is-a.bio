import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { Block, Settings } from '~/components/blocks';

export const createSupabaseServerClient = (request: Request) => {
  const cookies = parseCookieHeader(request.headers.get('Cookie') ?? '');
  const headers = new Headers();
  const supabaseClient = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookies,
        setAll(cookies) {
          for (const { name, value, options } of cookies) {
            headers.append('Set-Cookie', serializeCookieHeader(name, value, options));
          }
        }
      },
    },
  );

  return { supabaseClient, headers };
}


export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export interface Website {
  settings: Settings;
  blocks: Block[];
}

export interface WebsiteData {
  created_at: string;
  updated_at: string;
  subdomain: string;
  content?: Website;
}