export interface PaginationParams {
    page:  number
    limit: number
  }
  
  export interface PaginatedResponse<T> {
    data:       T[]
    total:      number
    page:       number
    totalPages: number
    hasMore:    boolean
  }
  
  export function getPaginationParams(url: string): PaginationParams {
    const { searchParams } = new URL(url)
    const page  = Math.max(1, parseInt(searchParams.get('page')  ?? '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')))
    return { page, limit }
  }
  
  export function paginate(page: number, limit: number) {
    return {
      skip: (page - 1) * limit,
      take: limit,
    }
  }