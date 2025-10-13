'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload } from 'lucide-react';
import { CodeBlock } from '@/components/ai-elements/code-block';

interface ImportNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: (links: string[], singleNotePayloads: Array<{ name: string; json: unknown }>) => void;
}

// 简单的链接校验：支持 explore 全链接与常见短链
const xhsLinkRegex = /(https?:\/\/www\.xiaohongshu\.com\/explore\/[\w-]+)|(https?:\/\/(xhs|xhslink)\.[\w.-]+\/[\w-]+)/i;

export function ImportNotesDialog({ open, onOpenChange, onImported }: ImportNotesDialogProps) {
  const t = useTranslations('Xhs.ImportDialog');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [validCount, setValidCount] = useState<number>(0);
  const [estimatePoints, setEstimatePoints] = useState<number>(0);
  const [previewJson, setPreviewJson] = useState<string>('');
  const [links, setLinks] = useState<string[]>([]);

  const handleChooseFile = () => fileInputRef.current?.click();

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.txt')) {
      alert(t('onlyTxt'));
      return;
    }
    setFileName(file.name);
    const text = await file.text();
    // 按换行拆分，去除空白
    const rawLines = text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    const validLinks = rawLines.filter((s) => xhsLinkRegex.test(s));
    setLinks(validLinks);
    setValidCount(validLinks.length);
    // 简单估算积分：每条 2 分
    setEstimatePoints(validLinks.length * 2);
  };

  const handleImport = async () => {
    // 读取 single_note 下的三类示例 JSON，聚合并展示
    // 这些 import 是打包时静态可解析的
    const [note, video, live] = await Promise.all([
      import('@/app/[locale]/(protected)/xhs/searchnote/single_note/note.json').then((m) => ({ name: 'note.json', json: m.default })).catch(() => ({ name: 'note.json', json: { error: 'missing' } })),
      import('@/app/[locale]/(protected)/xhs/searchnote/single_note/video.json').then((m) => ({ name: 'video.json', json: m.default })).catch(() => ({ name: 'video.json', json: { error: 'missing' } })),
      import('@/app/[locale]/(protected)/xhs/searchnote/single_note/live.json').then((m) => ({ name: 'live.json', json: m.default })).catch(() => ({ name: 'live.json', json: { error: 'missing' } })),
    ]);
    const payloads = [note, video, live];
    setPreviewJson(JSON.stringify({ files: payloads }, null, 2));
    onImported(links, payloads);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Input readOnly value={fileName} placeholder={t('selectFile')} className="flex-1" />
            <input ref={fileInputRef} type="file" accept=".txt" className="hidden" onChange={handleFileChange} />
            <Button variant="secondary" onClick={handleChooseFile}>
              <Upload className="h-4 w-4 mr-2" /> {t('selectFile')}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground flex items-center gap-4">
            <span>{t('validLinks', { count: validCount })}</span>
            <span>{t('creditsEstimate', { points: estimatePoints })}</span>
          </div>

          {previewJson && (
            <CodeBlock code={previewJson} language="json" />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
          <Button onClick={handleImport} disabled={links.length === 0}>
            <Upload className="h-4 w-4 mr-2" /> {t('import')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


