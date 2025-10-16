'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload } from 'lucide-react';
import { expandUrl, isUrl } from '@/lib/utils';

interface ImportVendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: (expandedGoodsLinks: string[]) => void;
}

// 仅支持商品详情链接（支持 goods-detail 与 goods 两种路径），短链会先展开再校验
const goodsDetailRegex = /^https:\/\/www\.xiaohongshu\.com\/(goods-detail|goods)\/[a-z0-9]+(?:\?.*)?$/i;

export function ImportVendorDialog({ open, onOpenChange, onImported }: ImportVendorDialogProps) {
  const t = useTranslations('Xhs.ImportDialog');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [validCount, setValidCount] = useState<number>(0);
  const [estimatePoints, setEstimatePoints] = useState<number>(0);
  const [expandedValidLinks, setExpandedValidLinks] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleChooseFile = () => fileInputRef.current?.click();

  const expandAndValidate = async (lines: string[]) => {
    setProcessing(true);
    try {
      // 展开每一行潜在的短链（并保留非 URL 原样，后续会过滤）
      const expanded = await Promise.all(
        lines.map(async (line) => {
          const text = line.trim();
          if (!text) return '';
          try {
            if (isUrl(text)) {
              return await expandUrl(text);
            }
            // 从文本中提取短链由 expandUrl 内部处理；直接传入
            return await expandUrl(text);
          } catch {
            return text;
          }
        })
      );

      const valid = expanded.filter((u) => goodsDetailRegex.test(u));
      setExpandedValidLinks(valid);
      setValidCount(valid.length);
      setEstimatePoints(valid.length * 2); // 简单估算
    } finally {
      setProcessing(false);
    }
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.txt')) {
      alert(t('onlyTxt'));
      return;
    }
    setFileName(file.name);
    const text = await file.text();
    const rawLines = text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    await expandAndValidate(rawLines);
  };

  const handleImport = async () => {
    onImported(expandedValidLinks);
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
            {/* 商品批量导入描述：仅支持商品详情链接 https://www.xiaohongshu.com/goods-detail 与短链（会自动展开后校验） */}
            {t('vendorDescription', {
              // Fallback: 如果没有该 key，也能展示基础说明
              default: '仅支持商品详情链接批量导入，多条请换行。支持链接格式（@https://www.xiaohongshu.com/goods-detail 及短链接，导入时会自动展开后校验）',
            } as any)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Input readOnly value={fileName} placeholder={t('selectFile')} className="flex-1" />
            <input ref={fileInputRef} type="file" accept=".txt" className="hidden" onChange={handleFileChange} />
            <Button variant="secondary" onClick={handleChooseFile} disabled={processing}>
              <Upload className="h-4 w-4 mr-2" /> {processing ? t('processing') : t('selectFile')}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground flex items-center gap-4">
            <span>{t('validLinks', { count: validCount })}</span>
            <span>{t('creditsEstimate', { points: estimatePoints })}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
          <Button onClick={handleImport} disabled={expandedValidLinks.length === 0 || processing}>
            <Upload className="h-4 w-4 mr-2" /> {t('import')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


