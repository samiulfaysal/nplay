import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Database, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: todos, error } = await (supabase.from('todos' as any) as any).select();

  return (
    <div className="max-w-xl mx-auto px-4 py-16 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Cinema Portal</span>
      </Link>

      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <Database className="w-5 h-5" />
          <h1 className="text-xl font-bold text-white">Supabase Connection Test</h1>
        </div>

        <p className="text-xs text-gray-400">
          Reading records from the <code className="text-emerald-400 font-mono">todos</code> table in your Supabase project (<code className="text-gray-300 font-mono">tacbfwheoaqbhmyvxnsb</code>).
        </p>

        {error ? (
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs">
            Notice: Table <code className="font-bold">todos</code> not found or empty yet. Create it in the Supabase SQL Editor if you want to test the sample todo list.
          </div>
        ) : (
          <ul className="space-y-2 text-sm text-gray-200">
            {todos && todos.length > 0 ? (
              todos.map((todo: any) => (
                <li
                  key={todo.id}
                  className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{todo.name || todo.title || JSON.stringify(todo)}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-gray-500 italic py-2">
                Connected to Supabase, but no todos found yet.
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
