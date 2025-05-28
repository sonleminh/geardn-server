import { Prisma } from '@prisma/client';

export const createDateRangeFilter = (
  fromDate?: string,
  toDate?: string,
): Prisma.DateTimeFilter | undefined => {
  if (!fromDate || !toDate) return undefined;

  return {
    gte: new Date(fromDate),
    lte: new Date(toDate),
  };
};

export const createArrayFilter = <T>(
  values?: T[],
): { in: T[] } | undefined => {
  if (!values || values.length === 0) return undefined;
  return { in: values };
};

export const createSearchFilter = (
  search?: string,
): Prisma.StringFilter | undefined => {
  if (!search) return undefined;
  return {
    contains: search,
    mode: Prisma.QueryMode.insensitive,
  };
}; 