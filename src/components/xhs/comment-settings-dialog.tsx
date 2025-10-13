'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface CommentSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (options: { fetchAll: boolean; pages?: number }) => void;
}

export function CommentSettingsDialog({ open, onOpenChange, onStart }: CommentSettingsDialogProps) {
  const t = useTranslations('Xhs.CommentSettings');
  const [fetchAll, setFetchAll] = useState(true);
  const [pages, setPages] = useState<number>(1);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleStart = () => {
    setConfirmOpen(true);
  };

  const confirmStart = () => {
    onStart({ fetchAll, pages: fetchAll ? undefined : pages });
    setConfirmOpen(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('fetchAll')}</span>
            <Switch checked={fetchAll} onCheckedChange={(v) => setFetchAll(Boolean(v))} />
          </div>

          {!fetchAll && (
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="pages">{t('pagesLabel')}</label>
              <div className="flex items-center gap-2">
                <Input
                  id="pages"
                  type="number"
                  min={1}
                  value={pages}
                  onChange={(e) => setPages(Math.max(1, Number(e.target.value)))}
                  className="w-28"
                />
                <span className="text-xs text-muted-foreground">{t('pagesHelper')}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
          <Button onClick={handleStart}>{t('start')}</Button>
        </DialogFooter>
      </DialogContent>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('confirmContent')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStart}>{t('start')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}


