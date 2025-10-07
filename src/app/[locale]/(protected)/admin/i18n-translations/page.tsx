'use client';

import {
  createI18nTranslationAction,
  deleteI18nTranslationAction,
  listI18nTranslationsAction,
  updateI18nTranslationAction,
} from '@/actions/i18n-translations';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { importI18nTranslationsAction, exportI18nTranslationsAction } from '@/actions/i18n-translations';
import { toast } from 'sonner';
import { Loader2Icon, ChevronRightIcon, ChevronDownIcon } from 'lucide-react';

type T = { id: number; key: string; languageCode: string; value: string };

export default function AdminI18nTranslationsPage() {
  const tCommon = useTranslations('Common');
  const t = useTranslations('Dashboard.admin.i18nTranslations');
  const [items, setItems] = useState<T[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [languageCode, setLanguageCode] = useState<string>('all');
  const [importing, setImporting] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const fetchItems = async (lc: string = languageCode) => {
    const res = await listI18nTranslationsAction({
      pageIndex: 0,
      pageSize: 10000,
      search: '',
      languageCode: lc === 'all' ? undefined : lc,
    });
    if (res?.data?.success) setItems(res.data.data.items as T[]);
  };

  useEffect(() => {
    void fetchItems(languageCode);
  }, [languageCode]);

  const onEdit = (item: T) => {
    setEditing(item);
    setOpen(true);
  };

  const onDelete = async (id: number) => {
    await deleteI18nTranslationAction({ id });
    await fetchItems();
  };

  return (
    <Tabs value={languageCode} onValueChange={setLanguageCode} className="w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <Label htmlFor="lang-selector" className="sr-only">Language</Label>
          <Select value={languageCode} onValueChange={setLanguageCode}>
            <SelectTrigger className="flex w-fit @4xl/main:hidden" size="sm" id="lang-selector">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="en">en</SelectItem>
              <SelectItem value="zh">zh</SelectItem>
            </SelectContent>
          </Select>
          <TabsList className="hidden @4xl/main:flex">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="en">en</TabsTrigger>
            <TabsTrigger value="zh">zh</TabsTrigger>
          </TabsList>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={languageCode === 'all'}
            onClick={async () => {
              if (languageCode === 'all') return;
              const lc = languageCode as string;
              const res = await exportI18nTranslationsAction({ languageCode: lc });
              if (!res?.data?.success) return;
              const flat: Record<string, string> = Object.fromEntries(
                res.data.data.items.map((it) => [it.key, it.value])
              );
              const nested = unflattenKeysToObject(flat);
              const blob = new Blob([JSON.stringify(nested, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${lc}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            {languageCode === 'all' ? t('export') : `${t('export')} ${languageCode}.json`}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={languageCode === 'all' || importing}
            onClick={async () => {
              if (languageCode === 'all') return;
              if (importing) return;
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'application/json';
              input.onchange = async () => {
                const file = input.files?.[0];
                if (!file) return;
                try {
                  setImporting(true);
                  const text = await file.text();
                  const obj = JSON.parse(text) as Record<string, any>;
                  const entries = flattenObjectToEntries(obj).map(({ key, value }) => ({ key, value }));
                  const res = await importI18nTranslationsAction({ languageCode: languageCode as string, entries });
                  const inserted = res?.data?.data?.inserted ?? 0;
                  const skipped = res?.data?.data?.skipped ?? 0;
                  toast.success(t('importDone', { inserted, skipped }));
                  await fetchItems(languageCode);
                } catch (e) {
                  console.error(e);
                  toast.error(t('importFailed'));
                } finally {
                  setImporting(false);
                }
              };
              input.click();
            }}
          >
            {importing ? (
              <>
                <Loader2Icon className="size-4 animate-spin" /> {t('importing')}
              </>
            ) : (
              languageCode === 'all' ? t('import') : `${t('import')} ${languageCode}.json`
            )}
          </Button>
          <Button variant="outline" size="sm">
            <span className="hidden lg:inline">{tCommon('table.columns')}</span>
            <span className="lg:hidden">{tCommon('table.columns')}</span>
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setEditing(null)}>
                {t('new')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? t('edit') : t('new')}</DialogTitle>
              </DialogHeader>
              <TranslationForm
                initial={editing}
                defaultLanguage={languageCode === 'all' ? 'en' : languageCode}
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
                <TableHead>{t('columns.language')}</TableHead>
                <TableHead>{t('columns.value')}</TableHead>
                <TableHead>{t('columns.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    {t('noResults')}
                  </TableCell>
                </TableRow>
              ) : (
                buildTreeRows(items, {
                  expanded,
                  onToggle: (path) => setExpanded((prev) => ({ ...prev, [path]: !prev[path] })),
                  onEdit: (node) => onEdit({ id: 0, key: node.fullPath, languageCode: node.languageCode!, value: node.value! }),
                  onDelete: async (node) => {
                    const target = items.find((x) => x.key === node.fullPath && x.languageCode === node.languageCode);
                    if (target) await onDelete(target.id);
                  },
                  t: (k: string) => t(k as any),
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Tabs>
  );
}

function unflattenKeysToObject(flat: Record<string, string>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.');
    let cur: Record<string, any> = result;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i]!;
      if (i === parts.length - 1) {
        cur[p] = value;
      } else {
        cur[p] = cur[p] ?? {};
        cur = cur[p];
      }
    }
  }
  return result;
}

function flattenObjectToEntries(obj: Record<string, any>, prefix = ''): { key: string; value: string }[] {
  const out: { key: string; value: string }[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      out.push(...flattenObjectToEntries(v, key));
    } else {
      out.push({ key, value: String(v) });
    }
  }
  return out;
}

type TreeNode = { name: string; fullPath: string; children: Record<string, TreeNode>; value?: string; languageCode?: string };

function buildTreeRows(
  list: { key: string; value: string; languageCode: string }[],
  ctx: {
    expanded: Record<string, boolean>;
    onToggle: (path: string) => void;
    onEdit: (node: { fullPath: string; value: string; languageCode: string }) => void;
    onDelete: (node: { fullPath: string; languageCode: string }) => void;
    t: (key: string) => string;
  }
) {
  const root: TreeNode = { name: '', fullPath: '', children: {} };
  for (const item of list) {
    const parts = item.key.split('.');
    let cur = root;
    let path = '';
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!;
      path = path ? `${path}.${part}` : part;
      if (!cur.children[part]) cur.children[part] = { name: part, fullPath: path, children: {} };
      cur = cur.children[part]!;
      if (i === parts.length - 1) {
        cur.value = item.value;
        cur.languageCode = item.languageCode;
      }
    }
  }

  const rows: React.ReactNode[] = [];
  function walk(node: TreeNode, depth: number, isRoot = false) {
    const keys = Object.keys(node.children);
    const hasChildren = keys.length > 0;
    if (!isRoot) {
      if (hasChildren && node.value === undefined) {
        rows.push(
          <TableRow key={`folder-${node.fullPath}`}>
            <TableCell colSpan={4}>
              <div className="flex items-center gap-2" style={{ paddingLeft: depth * 16 }}>
                <button type="button" onClick={() => ctx.onToggle(node.fullPath)} className="flex items-center gap-1">
                  {ctx.expanded[node.fullPath] ? <ChevronDownIcon className="size-4" /> : <ChevronRightIcon className="size-4" />}
                </button>
                <span className="font-medium">{node.name}</span>
              </div>
            </TableCell>
          </TableRow>
        );
      }
      if (node.value !== undefined) {
        rows.push(
          <TableRow key={`leaf-${node.fullPath}`}>
            <TableCell className="font-mono text-xs">
              <div style={{ paddingLeft: depth * 16 }}>{node.name}</div>
            </TableCell>
            <TableCell>{node.languageCode}</TableCell>
            <TableCell className="max-w-[480px] truncate">{node.value}</TableCell>
            <TableCell className="space-x-2">
              <Button size="sm" variant="outline" onClick={() => ctx.onEdit({ fullPath: node.fullPath, value: node.value!, languageCode: node.languageCode! })}>
                {ctx.t('edit')}
              </Button>
              <Button size="sm" variant="destructive" onClick={() => ctx.onDelete({ fullPath: node.fullPath, languageCode: node.languageCode! })}>
                {ctx.t('delete')}
              </Button>
            </TableCell>
          </TableRow>
        );
      }
    }
    const expandedHere = ctx.expanded[node.fullPath] ?? false;
    if (hasChildren && (isRoot || expandedHere)) {
      for (const k of keys) {
        walk(node.children[k], isRoot ? 0 : depth + 1);
      }
    }
  }
  walk(root, 0, true);
  return rows;
}

function TranslationForm({ initial, onSubmitted, defaultLanguage }: { initial: T | null; onSubmitted: () => Promise<void>; defaultLanguage?: string }) {
  const t = useTranslations('Dashboard.admin.i18nTranslations');
  const Schema = z.object({
    key: z.string().min(1),
    languageCode: z.string().min(1).max(10),
    value: z.string().min(1),
  });

  const form = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: {
      key: initial?.key ?? '',
      languageCode: initial?.languageCode ?? (defaultLanguage as string) ?? 'en',
      value: initial?.value ?? '',
    },
  });

  useEffect(() => {
    form.reset({
      key: initial?.key ?? '',
      languageCode: initial?.languageCode ?? (defaultLanguage as string) ?? 'en',
      value: initial?.value ?? '',
    });
  }, [initial, defaultLanguage]);

  const onSubmit = async (values: z.infer<typeof Schema>) => {
    if (initial) {
      await updateI18nTranslationAction({ id: initial.id, ...values });
    } else {
      await createI18nTranslationAction(values);
    }
    await onSubmitted();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="key"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.key')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. dashboard.title" className="font-mono" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="languageCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.language')}</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">en</SelectItem>
                    <SelectItem value="zh">zh</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.value')}</FormLabel>
              <FormControl>
                <Textarea {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => form.reset()}>
            {t('cancel')}
          </Button>
          <Button type="submit">{initial ? t('save') : t('create')}</Button>
        </div>
      </form>
    </Form>
  );
}


