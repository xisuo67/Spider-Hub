'use client';

import { getAppItemsAction } from '@/actions/get-app-items';
import {
  createAppItemAction,
  deleteAppItemAction,
  toggleEnableAppItemAction,
  updateAppItemAction,
} from '@/actions/mutate-app-item';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type AppItem = {
  id: string;
  key?: string | null;
  parentId?: string | null;
  title: string;
  description: string | null;
  enable: boolean;
  icon: string | null;
  link?: string | null;
  sortOrder: number;
};

export default function AdminAppItemsPage() {
  const t = useTranslations('Dashboard.admin.appItems');
  const tCommon = useTranslations('Common');
  const [items, setItems] = useState<AppItem[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AppItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const fetchItems = async () => {
    setLoading(true);
    const res = await getAppItemsAction({ pageIndex: 0, pageSize: 100, search: '' });
    if (res?.data?.success) setItems(res.data.data.items as AppItem[]);
    setLoading(false);
  };

  useEffect(() => {
    void fetchItems();
  }, []);

  const onEdit = (item: AppItem) => {
    setEditing(item);
    setOpen(true);
  };

  const onDelete = async (id: string) => {
    try {
      const res = await deleteAppItemAction({ id });
      if (res?.data?.success || (res as any)?.success) {
        toast.success(t('toast.deleteSuccess'));
      } else {
        toast.error(t('toast.deleteFail'));
      }
    } catch (e) {
      toast.error(t('toast.deleteFail'));
    } finally {
      await fetchItems();
    }
  };

  const onToggleEnable = async (id: string, enable: boolean) => {
    try {
      const res = await toggleEnableAppItemAction({ id, enable });
      if (res?.data?.success || (res as any)?.success) {
        toast.success(t('toast.updateSuccess'));
      } else {
        toast.error(t('toast.updateFail'));
      }
    } catch (e) {
      toast.error(t('toast.updateFail'));
    } finally {
      await fetchItems();
    }
  };

  return (
    <div className="w-full flex flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div />
        <div className="flex items-center gap-2">
          {/* 与 DataTable 顶部按钮风格一致 */}
          <Button variant="outline" size="sm">
            <span className="hidden lg:inline">{tCommon('table.columns')}</span>
            <span className="lg:hidden">{tCommon('table.columns')}</span>
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => { setEditing(null); }}>{t('new')}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? `${editing.key ? editing.key + ' - ' : ''}${editing.title}` : t('new')}</DialogTitle>
              </DialogHeader>
              <AppItemForm
                initial={editing}
                parents={items.filter((x) => !x.parentId)}
                onSubmitted={async () => {
                  setOpen(false);
                  await fetchItems();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              <TableRow>
                <TableHead>{t('columns.key')}</TableHead>
                <TableHead>{t('columns.title')}</TableHead>
                <TableHead>{t('columns.description')}</TableHead>
                <TableHead>{t('columns.enable')}</TableHead>
                <TableHead>{t('columns.icon')}</TableHead>
                <TableHead>{t('columns.link') || 'Link'}</TableHead>
                <TableHead>{t('columns.sortOrder')}</TableHead>
                <TableHead>{t('columns.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">{t('noResults')}</TableCell>
                </TableRow>
              ) : (
                renderTreeRows(
                  items,
                  expanded,
                  (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] })),
                  onEdit,
                  onDelete,
                  onToggleEnable,
                  (k: string) => t(k as any),
                )
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function renderTreeRows(
  items: { id: string; parentId?: string | null; key?: string | null; title: string; description: string | null; enable: boolean; icon: string | null; link?: string | null; sortOrder: number }[],
  expanded: Record<string, boolean>,
  toggle: (id: string) => void,
  onEdit: (it: any) => void,
  onDelete: (id: string) => void,
  onToggleEnable: (id: string, enable: boolean) => void,
  t: (k: string) => string,
) {
  const byParent: Record<string, typeof items> = {} as any;
  for (const it of items) {
    const pid = it.parentId || '__root__';
    (byParent[pid] = byParent[pid] || []).push(it);
  }
  for (const k of Object.keys(byParent)) {
    byParent[k]!.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }

  const rows: React.ReactNode[] = [];
  const renderBranch = (parentId: string | null, depth: number) => {
    const pid = parentId || '__root__';
    const children = byParent[pid] || [];
    for (const it of children) {
      const isFolder = (byParent[it.id] || []).length > 0;
      rows.push(
        <TableRow key={it.id}>
          <TableCell className="font-mono text-xs">
            <div className="flex items-center gap-2" style={{ paddingLeft: depth * 16 }}>
              {isFolder ? (
                <button type="button" onClick={() => toggle(it.id)} className="inline-flex items-center">
                  {expanded[it.id] ? <ChevronDownIcon className="size-4" /> : <ChevronRightIcon className="size-4" />}
                </button>
              ) : (
                <span className="inline-block w-4" />
              )}
              <span>{it.key}</span>
            </div>
          </TableCell>
          <TableCell>{it.title}</TableCell>
          <TableCell className="max-w-[420px] truncate">{it.description}</TableCell>
          <TableCell>
            <Switch checked={it.enable} onCheckedChange={(v) => onToggleEnable(it.id, v)} />
          </TableCell>
          <TableCell className="max-w-[240px] truncate">{it.icon}</TableCell>
          <TableCell className="max-w-[240px] truncate">{it.link}</TableCell>
          <TableCell>{it.sortOrder}</TableCell>
          <TableCell className="space-x-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(it)}>{t('edit')}</Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(it.id)}>Delete</Button>
          </TableCell>
        </TableRow>
      );
      const hasKids = (byParent[it.id] || []).length > 0;
      if (hasKids && (expanded[it.id] ?? false)) {
        renderBranch(it.id, depth + 1);
      }
    }
  };
  renderBranch(null, 0);
  return rows;
}

function AppItemForm({ initial, onSubmitted, parents }: { initial: AppItem | null; onSubmitted: () => Promise<void>; parents: AppItem[] }) {
  const t = useTranslations('Dashboard.admin.appItems');

  const Schema = z.object({
    key: z.string().min(1).optional(),
    title: z.string().min(1),
    description: z.string().max(200).optional(),
    enable: z.boolean().optional(),
    icon: z.string().optional(),
    link: z
      .union([
        z.string().url(), // 绝对 URL
        z.string().regex(/^\/[\S]*$/), // 以 / 开头的相对路径
        z.literal(''), // 允许空字符串
      ])
      .optional(),
    sortOrder: z.number().int().min(0).optional(),
    parentId: z.string().optional().nullable(),
  });

  const form = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: {
      key: initial?.key ?? '',
      title: initial?.title ?? '',
      description: initial?.description ?? undefined,
      enable: initial?.enable ?? false,
      icon: initial?.icon ?? undefined,
      link: initial?.link ?? '',
      sortOrder: initial?.sortOrder,
      parentId: (initial as any)?.parentId ?? null,
    },
  });

  useEffect(() => {
    form.reset({
      key: initial?.key ?? '',
      title: initial?.title ?? '',
      description: initial?.description ?? undefined,
      enable: initial?.enable ?? false,
      icon: initial?.icon ?? undefined,
      link: initial?.link ?? '',
      sortOrder: initial?.sortOrder,
      parentId: (initial as any)?.parentId ?? null,
    });
  }, [initial]);

  const onSubmit = async (values: z.infer<typeof Schema>) => {
    try {
      if (initial) {
        const res = await updateAppItemAction({
          id: initial.id,
          key: values.key ?? undefined,
          title: values.title,
          description: values.description ?? '',
          enable: values.enable ?? false,
          icon: values.icon ?? '',
          link: values.link ?? '',
          sortOrder: values.sortOrder as number | undefined,
          parentId: values.parentId ?? null,
        });
        if (res?.data?.success || (res as any)?.success) {
          toast.success(t('toast.saveSuccess'));
        } else {
          toast.error(t('toast.saveFail'));
          return;
        }
      } else {
        const res = await createAppItemAction({
          key: values.key ?? undefined,
          title: values.title,
          description: values.description ?? '',
          enable: values.enable ?? false,
          icon: values.icon ?? '',
          link: values.link ?? '',
          sortOrder: values.sortOrder as number | undefined,
          parentId: values.parentId ?? null,
        });
        if (res?.data?.success || (res as any)?.success) {
          toast.success(t('toast.createSuccess'));
        } else {
          toast.error(t('toast.createFail'));
          return;
        }
      }
      await onSubmitted();
    } catch (e) {
      toast.error(t('toast.actionFail'));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="key"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.key') || 'Key'}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.title')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.description')}</FormLabel>
              <FormControl>
                <Textarea {...field} maxLength={200} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.icon')}</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} className="h-24 max-h-48 overflow-auto resize-none" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.link') || 'Link'}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://example.com/path" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent</FormLabel>
              <FormControl>
                <select
                  className="h-9 px-2 border rounded"
                  value={(field.value as any) ?? ''}
                  onChange={(e) => field.onChange(e.target.value === '' ? null : e.target.value)}
                >
                  <option value="">(None)</option>
                  {parents
                    .filter((p) => !initial || p.id !== initial.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="enable"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel>{t('form.enable')}</FormLabel>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sortOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.sortOrder')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    field.onChange(v === '' ? undefined : Number(v));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => form.reset()}>
            {t('cancel')}
          </Button>
          <Button type="submit">
            {initial ? t('save') : t('create')}
          </Button>
        </div>
      </form>
    </Form>
  );
}


