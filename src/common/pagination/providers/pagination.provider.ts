import { Inject, Injectable } from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { PaginationQueryDto } from 'src/common/pagination-query.dto';
import { Paginated } from '../interfaces/paginated.interface';

@Injectable()
export class PaginationProvider {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  public async paginateQuery<T extends ObjectLiteral>(
    paginationQuery: PaginationQueryDto,
    repository: Repository<T>,
  ): Promise<Paginated<T>> {
    const { page = 1, limit = 10 } = paginationQuery;

    // ✅ Query data and total count
    const [results, totalItems] = await repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(totalItems / limit);

    // ✅ Ensure `request` exists
    const baseURL =
      this.request?.protocol && this.request?.headers?.host
        ? `${this.request.protocol}://${this.request.headers.host}`
        : ''; // fallback in case REQUEST is unavailable

    const newUrl = baseURL
      ? new URL(this.request.url, baseURL)
      : new URL('http://localhost/');

    const createPageUrl = (p: number) =>
      `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${p}`;

    const nextPage = page < totalPages ? page + 1 : totalPages;
    const previousPage = page > 1 ? page - 1 : 1;

    return {
      data: results,
      meta: {
        itemsPerPage: limit,
        totalItems,
        currentPage: page,
        totalPages,
      },
      links: {
        first: createPageUrl(1),
        last: createPageUrl(totalPages),
        current: createPageUrl(page),
        next: createPageUrl(nextPage),
        previous: createPageUrl(previousPage),
      },
    };
  }
}
