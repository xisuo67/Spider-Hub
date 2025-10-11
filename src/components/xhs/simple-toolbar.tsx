'use client';

import { type Table } from '@tanstack/react-table';

interface SimpleToolbarProps<TData> {
  table: Table<TData>;
}

export function SimpleToolbar<TData>({ table }: SimpleToolbarProps<TData>) {
  // 这个组件什么都不渲染，只是占位符
  // 用于替换DataTableToolbar，但不显示搜索框和View菜单
  return null;
}
