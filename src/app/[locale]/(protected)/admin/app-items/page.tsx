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
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type AppItem = {
  id: string;
  title: string;
  description: string | null;
  enable: boolean;
  icon: string | null;
  sortOrder: number;
};

export default function AdminAppItemsPage() {
  const t = useTranslations('Dashboard.admin.appItems');
  const tCommon = useTranslations('Common');
  const [items, setItems] = useState<AppItem[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AppItem | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    const res = await getAppItemsAction({ pageIndex: 0, pageSize: 100, search: '' });
    if (res?.success) setItems(res.data.items as AppItem[]);
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
    await deleteAppItemAction({ id });
    await fetchItems();
  };

  const onToggleEnable = async (id: string, enable: boolean) => {
    await toggleEnableAppItemAction({ id, enable });
    await fetchItems();
  };

  return (
    <div className="w-full flex-col justify-start gap-6">
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
                <DialogTitle>{editing ? t('edit') : t('new')}</DialogTitle>
              </DialogHeader>
              <AppItemForm
                initial={editing}
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
                <TableHead>{t('columns.title')}</TableHead>
                <TableHead>{t('columns.description')}</TableHead>
                <TableHead>{t('columns.enable')}</TableHead>
                <TableHead>{t('columns.icon')}</TableHead>
                <TableHead>{t('columns.sortOrder')}</TableHead>
                <TableHead>{t('columns.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">{t('noResults')}</TableCell>
                </TableRow>
              ) : (
                items.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell>{it.title}</TableCell>
                    <TableCell className="max-w-[420px] truncate">{it.description}</TableCell>
                    <TableCell>
                      <Switch checked={it.enable} onCheckedChange={(v) => onToggleEnable(it.id, v)} />
                    </TableCell>
                    <TableCell className="max-w-[240px] truncate">{it.icon}</TableCell>
                    <TableCell>{it.sortOrder}</TableCell>
                    <TableCell className="space-x-2">
                      <Button size="sm" variant="outline" onClick={() => onEdit(it)}>{t('edit')}</Button>
                      <Button size="sm" variant="destructive" onClick={() => onDelete(it.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function AppItemForm({ initial, onSubmitted }: { initial: AppItem | null; onSubmitted: () => Promise<void> }) {
  const t = useTranslations('Dashboard.admin.appItems');

  const Schema = z.object({
    title: z.string().min(1),
    description: z.string().max(200).optional().default(''),
    enable: z.boolean().optional().default(false),
    icon: z.string().optional().default(''),
    sortOrder: z
      .union([z.number().int().min(0), z.literal('')])
      .transform((v) => (v === '' ? undefined : v))
      .optional(),
  });

  const form = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: {
      title: initial?.title ?? '',
      description: initial?.description ?? '',
      enable: initial?.enable ?? false,
      icon: initial?.icon ?? '',
      sortOrder: initial?.sortOrder ?? '',
    },
  });

  useEffect(() => {
    form.reset({
      title: initial?.title ?? '',
      description: initial?.description ?? '',
      enable: initial?.enable ?? false,
      icon: initial?.icon ?? '',
      sortOrder: initial?.sortOrder ?? '',
    });
  }, [initial]);

  const onSubmit = async (values: z.infer<typeof Schema>) => {
    if (initial) {
      await updateAppItemAction({
        id: initial.id,
        title: values.title,
        description: values.description ?? '',
        enable: values.enable ?? false,
        icon: values.icon ?? '',
        sortOrder: values.sortOrder as number | undefined,
      });
    } else {
      await createAppItemAction({
        title: values.title,
        description: values.description ?? '',
        enable: values.enable ?? false,
        icon: values.icon ?? '',
        sortOrder: values.sortOrder as number | undefined,
      });
    }
    await onSubmitted();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                <Textarea {...field} rows={3} />
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
                  value={field.value as any}
                  onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
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


