import { Repository, FindManyOptions } from 'typeorm';

export async function paginate<T extends object>(
  repository: Repository<T>,
  page: number = 1,
  limit: number = 10,
  options: FindManyOptions<T> = {},
): Promise<{
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const skip = (page - 1) * limit;
  const take = limit;

  const [data, total] = await repository.findAndCount({
    ...options,
    skip,
    take,
  });

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
