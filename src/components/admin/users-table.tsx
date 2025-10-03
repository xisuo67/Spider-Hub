'use client';

import { UserDetailViewer } from '@/components/admin/user-detail-viewer';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { User } from '@/lib/auth-types';
import { isDemoWebsite } from '@/lib/demo';
import { formatDate } from '@/lib/formatter';
import { getStripeDashboardCustomerUrl } from '@/lib/urls/urls';
import { IconCaretDownFilled, IconCaretUpFilled } from '@tabler/icons-react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  MailCheckIcon,
  MailQuestionIcon,
  UserRoundCheckIcon,
  UserRoundXIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Skeleton } from '../ui/skeleton';

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: any;
  title: string;
}

function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const tTable = useTranslations('Common.table');
  if (!column.getCanSort()) {
    return <div className={className}>{title}</div>;
  }

  const isSorted = column.getIsSorted(); // 'asc' | 'desc' | false

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="cursor-pointer flex items-center gap-2 h-8 data-[state=open]:bg-accent"
          >
            {title}
            {isSorted === 'asc' && <IconCaretUpFilled className="h-4 w-4" />}
            {isSorted === 'desc' && <IconCaretDownFilled className="h-4 w-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-36">
          <DropdownMenuRadioGroup
            value={isSorted === false ? '' : isSorted}
            onValueChange={(value) => {
              if (value === 'asc') column.toggleSorting(false);
              else if (value === 'desc') column.toggleSorting(true);
            }}
          >
            <DropdownMenuRadioItem value="asc">
              <span className="flex items-center gap-2">
                {tTable('ascending')}
              </span>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="desc">
              <span className="flex items-center gap-2">
                {tTable('descending')}
              </span>
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function TableRowSkeleton({ columns }: { columns: number }) {
  return (
    <TableRow>
      {Array.from({ length: columns }).map((_, index) => (
        <TableCell key={index} className="py-4">
          <div className="flex items-center gap-2 pl-3">
            <Skeleton className="h-6 w-full max-w-32" />
          </div>
        </TableCell>
      ))}
    </TableRow>
  );
}

interface UsersTableProps {
  data: User[];
  total: number;
  pageIndex: number;
  pageSize: number;
  search: string;
  sorting?: SortingState;
  loading?: boolean;
  onSearch: (search: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSortingChange?: (sorting: SortingState) => void;
}

/**
 * https://ui.shadcn.com/docs/components/data-table
 */
export function UsersTable({
  data,
  total,
  pageIndex,
  pageSize,
  search,
  sorting = [{ id: 'createdAt', desc: true }],
  loading,
  onSearch,
  onPageChange,
  onPageSizeChange,
  onSortingChange,
}: UsersTableProps) {
  const t = useTranslations('Dashboard.admin.users');
  const tTable = useTranslations('Common.table');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // show fake data in demo website
  const isDemo = isDemoWebsite();

  // Map column IDs to translation keys
  const columnIdToTranslationKey = {
    name: 'columns.name' as const,
    email: 'columns.email' as const,
    role: 'columns.role' as const,
    createdAt: 'columns.createdAt' as const,
    customerId: 'columns.customerId' as const,
    banned: 'columns.status' as const,
    banReason: 'columns.banReason' as const,
    banExpires: 'columns.banExpires' as const,
  } as const;

  // Table columns definition
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.name')} />
      ),
      cell: ({ row }) => {
        const user = row.original;
        return <UserDetailViewer user={user} />;
      },
      minSize: 120,
      size: 140,
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.email')} />
      ),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-2 pl-3">
            <Badge
              variant="outline"
              className="text-sm px-1.5 cursor-pointer hover:bg-accent"
              onClick={() => {
                navigator.clipboard.writeText(user.email);
                toast.success(t('emailCopied'));
              }}
            >
              {user.emailVerified ? (
                <MailCheckIcon className="stroke-green-500 dark:stroke-green-400" />
              ) : (
                <MailQuestionIcon className="stroke-red-500 dark:stroke-red-400" />
              )}
              {user.email}
            </Badge>
          </div>
        );
      },
      minSize: 180,
      size: 200,
    },
    {
      accessorKey: 'role',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.role')} />
      ),
      cell: ({ row }) => {
        const user = row.original;
        const role = user.role || 'user';
        return (
          <div className="flex items-center gap-2 pl-3">
            <Badge
              variant={role === 'admin' ? 'default' : 'outline'}
              className="px-1.5"
            >
              {role === 'admin' ? t('admin') : t('user')}
            </Badge>
          </div>
        );
      },
      minSize: 100,
      size: 120,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.createdAt')} />
      ),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-2 pl-3">
            {formatDate(user.createdAt)}
          </div>
        );
      },
      minSize: 140,
      size: 160,
    },
    {
      accessorKey: 'customerId',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('columns.customerId')}
        />
      ),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-2 pl-3">
            {user.customerId ? (
              <a
                href={getStripeDashboardCustomerUrl(user.customerId)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline hover:underline-offset-4"
              >
                {user.customerId}
              </a>
            ) : (
              '-'
            )}
          </div>
        );
      },
      minSize: 120,
      size: 140,
    },
    {
      accessorKey: 'banned',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.status')} />
      ),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-2 pl-3">
            <Badge variant="outline" className="px-1.5 hover:bg-accent">
              {user.banned ? (
                <UserRoundXIcon className="stroke-red-500 dark:stroke-red-400" />
              ) : (
                <UserRoundCheckIcon className="stroke-green-500 dark:stroke-green-400" />
              )}
              {user.banned ? t('banned') : t('active')}
            </Badge>
          </div>
        );
      },
      minSize: 100,
      size: 120,
    },
    {
      accessorKey: 'banReason',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.banReason')} />
      ),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-2 pl-3">
            {user.banReason || '-'}
          </div>
        );
      },
      minSize: 120,
      size: 140,
    },
    {
      accessorKey: 'banExpires',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('columns.banExpires')}
        />
      ),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-2 pl-3">
            {user.banExpires ? formatDate(user.banExpires) : '-'}
          </div>
        );
      },
      minSize: 140,
      size: 160,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(total / pageSize),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination: { pageIndex, pageSize },
    },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      onSortingChange?.(next);
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function'
          ? updater({ pageIndex, pageSize })
          : updater;
      if (next.pageIndex !== pageIndex) onPageChange(next.pageIndex);
      if (next.pageSize !== pageSize) onPageSizeChange(next.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  return (
    <div className="w-full flex-col justify-start gap-6 space-y-4">
      <div className="flex items-center justify-between px-4 lg:px-6 gap-4">
        <div className="flex flex-1 items-center gap-4">
          <Input
            placeholder={t('search')}
            value={search}
            onChange={(event) => {
              onSearch(event.target.value);
              onPageChange(0);
            }}
            className="max-w-sm"
          />
          {isDemo && (
            <span className="text-sm text-primary">{t('fakeData')}</span>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="cursor-pointer">
              {/* <IconLayoutColumns /> */}
              <span className="inline">{t('columns.columns')}</span>
              <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize cursor-pointer"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {t(
                      columnIdToTranslationKey[
                        column.id as keyof typeof columnIdToTranslationKey
                      ] || 'columns.columns'
                    )}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                // Show skeleton rows while loading
                Array.from({ length: pageSize }).map((_, index) => (
                  <TableRowSkeleton key={index} columns={columns.length} />
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {tTable('noResults')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {/* empty here for now */}
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                {tTable('rowsPerPage')}
              </Label>
              <Select
                value={`${pageSize}`}
                onValueChange={(value) => {
                  onPageSizeChange(Number(value));
                  onPageChange(0);
                }}
              >
                <SelectTrigger
                  size="sm"
                  className="w-20 cursor-pointer"
                  id="rows-per-page"
                >
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              {tTable('page')} {pageIndex + 1} {' / '}
              {Math.max(1, Math.ceil(total / pageSize))}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="cursor-pointer hidden h-8 w-8 p-0 lg:flex"
                onClick={() => onPageChange(0)}
                disabled={pageIndex === 0}
              >
                <span className="sr-only">{tTable('firstPage')}</span>
                <ChevronsLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="cursor-pointer size-8"
                size="icon"
                onClick={() => onPageChange(pageIndex - 1)}
                disabled={pageIndex === 0}
              >
                <span className="sr-only">{tTable('previousPage')}</span>
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="cursor-pointer size-8"
                size="icon"
                onClick={() => onPageChange(pageIndex + 1)}
                disabled={pageIndex + 1 >= Math.ceil(total / pageSize)}
              >
                <span className="sr-only">{tTable('nextPage')}</span>
                <ChevronRightIcon />
              </Button>
              <Button
                variant="outline"
                className="cursor-pointer hidden size-8 lg:flex"
                size="icon"
                onClick={() =>
                  onPageChange(Math.max(0, Math.ceil(total / pageSize) - 1))
                }
                disabled={pageIndex + 1 >= Math.ceil(total / pageSize)}
              >
                <span className="sr-only">{tTable('lastPage')}</span>
                <ChevronsRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
