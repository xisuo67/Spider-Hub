'use client';

import { listSettingsAction, createSettingAction, updateSettingAction, deleteSettingAction } from '@/actions/settings';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';

type Setting = { key: string; value: string };

export default function AdminSettingsPage() {
  const tCommon = useTranslations('Common');
  const t = useTranslations('Dashboard.admin.settings');
  const [items, setItems] = useState<Setting[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Setting | null>(null);

  const fetchItems = async () => {
    const res = await listSettingsAction({ pageIndex: 0, pageSize: 100, search: '' });
    if (res?.data?.success) setItems(res.data.data.items as Setting[]);
  };

  useEffect(() => {
    void fetchItems();
  }, []);

  const onEdit = (item: Setting) => {
    setEditing(item);
    setOpen(true);
  };

  const onDelete = async (key: string) => {
    const res = await deleteSettingAction({ key });
    if (res?.data?.success || (res as any)?.success) toast.success(t('toast.deleteSuccess'));
    else toast.error(t('toast.deleteFail'));
    await fetchItems();
  };

  return (
    <div className="w-full flex flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div />
        <div className="flex items-center gap-2">
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
              <SettingForm
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
                <TableHead>{t('columns.key')}</TableHead>
                <TableHead>{t('columns.value')}</TableHead>
                <TableHead>{t('columns.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    {t('noResults')}
                  </TableCell>
                </TableRow>
              ) : (
                items.map((it) => (
                  <TableRow key={it.key}>
                    <TableCell className="font-mono text-xs">{it.key}</TableCell>
                    <TableCell className="max-w-[480px] truncate">{it.value}</TableCell>
                    <TableCell className="space-x-2">
                      <Button size="sm" variant="outline" onClick={() => onEdit(it)}>
                        {t('edit')}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => onDelete(it.key)}>
                        {t('delete')}
                      </Button>
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

function SettingForm({ initial, onSubmitted }: { initial: Setting | null; onSubmitted: () => Promise<void> }) {
  const t = useTranslations('Dashboard.admin.settings');
  const Schema = z.object({ key: z.string().min(1), value: z.string().min(0) });
  const form = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: { key: initial?.key ?? '', value: initial?.value ?? '' },
  });

  useEffect(() => {
    form.reset({ key: initial?.key ?? '', value: initial?.value ?? '' });
  }, [initial]);

  const onSubmit = async (values: z.infer<typeof Schema>) => {
    if (initial) {
      const res = await updateSettingAction(values);
      if (res?.data?.success || (res as any)?.success) toast.success(t('toast.saveSuccess'));
      else toast.error(t('toast.saveFail'));
    } else {
      const res = await createSettingAction(values);
      if (res?.data?.success || (res as any)?.success) toast.success(t('toast.createSuccess'));
      else toast.error(t('toast.createFail'));
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
                <Input {...field} disabled={!!initial} />
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
                <Input {...field} />
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


