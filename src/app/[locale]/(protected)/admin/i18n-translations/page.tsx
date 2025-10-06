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

type T = { id: number; key: string; languageCode: string; value: string };

export default function AdminI18nTranslationsPage() {
  const tCommon = useTranslations('Common');
  const [items, setItems] = useState<T[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [languageCode, setLanguageCode] = useState<string>('all');

  const fetchItems = async (lc: string = languageCode) => {
    const res = await listI18nTranslationsAction({
      pageIndex: 0,
      pageSize: 100,
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
          <Button variant="outline" size="sm">
            <span className="hidden lg:inline">{tCommon('table.columns')}</span>
            <span className="lg:hidden">{tCommon('table.columns')}</span>
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setEditing(null)}>
                New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit Translation' : 'New Translation'}</DialogTitle>
              </DialogHeader>
              <TranslationForm
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
                <TableHead>Key</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell className="font-mono text-xs">{it.key}</TableCell>
                    <TableCell>{it.languageCode}</TableCell>
                    <TableCell className="max-w-[480px] truncate">{it.value}</TableCell>
                    <TableCell className="space-x-2">
                      <Button size="sm" variant="outline" onClick={() => onEdit(it)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => onDelete(it.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Tabs>
  );
}

function TranslationForm({ initial, onSubmitted }: { initial: T | null; onSubmitted: () => Promise<void> }) {
  const Schema = z.object({
    key: z.string().min(1),
    languageCode: z.string().min(1).max(10),
    value: z.string().min(1),
  });

  const form = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: {
      key: initial?.key ?? '',
      languageCode: initial?.languageCode ?? 'en',
      value: initial?.value ?? '',
    },
  });

  useEffect(() => {
    form.reset({
      key: initial?.key ?? '',
      languageCode: initial?.languageCode ?? 'en',
      value: initial?.value ?? '',
    });
  }, [initial]);

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
              <FormLabel>Key</FormLabel>
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
              <FormLabel>Language</FormLabel>
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
              <FormLabel>Value</FormLabel>
              <FormControl>
                <Textarea {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => form.reset()}>
            Cancel
          </Button>
          <Button type="submit">{initial ? 'Save' : 'Create'}</Button>
        </div>
      </form>
    </Form>
  );
}


