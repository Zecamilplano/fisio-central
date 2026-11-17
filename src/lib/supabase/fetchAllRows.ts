// O Supabase (PostgREST) devolve no máximo 1000 linhas por consulta; acima disso
// o resto some em silêncio. Este helper busca em páginas até trazer tudo.
// A consulta precisa ter uma ordenação estável (ex.: terminar com .order("id")).

const PAGE_SIZE = 1000

type PageResult<T> = PromiseLike<{
  data: T[] | null
  error: { message: string } | null
}>

export async function fetchAllRows<T>(
  query: (from: number, to: number) => PageResult<T>
): Promise<{ data: T[]; error: { message: string } | null }> {
  const rows: T[] = []

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await query(from, from + PAGE_SIZE - 1)
    if (error) return { data: rows, error }

    rows.push(...(data ?? []))
    if (!data || data.length < PAGE_SIZE) return { data: rows, error: null }
  }
}
