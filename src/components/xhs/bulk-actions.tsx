'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DownloadIcon, FileSpreadsheetIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { exportToCSV, exportToJSON, downloadImagesAndText, formatFilename } from '@/lib/export-utils';
import { SearchResult } from './search-results-table';

interface BulkActionsProps {
  selectedCount: number;
  selectedData: SearchResult[];
  onExportCSV: () => void;
  onDownloadDetails: () => void;
  onDownloadImages: () => void;
}

export function BulkActions({
  selectedCount,
  selectedData,
  onExportCSV,
  onDownloadDetails,
  onDownloadImages
}: BulkActionsProps) {
  const t = useTranslations('Xhs.SearchNote');
  const locale = useLocale();
  const [loading, setLoading] = useState({
    csv: false,
    json: false,
    images: false
  });

  const handleExportCSV = async () => {
    if (loading.csv) return;
    
    setLoading(prev => ({ ...prev, csv: true }));
    try {
      const filename = formatFilename('xhs-search-results', 'csv');
      exportToCSV(selectedData, filename, locale);
      toast.success(t('exportingCSV', { count: selectedCount }));
      onExportCSV();
    } catch (error) {
      console.error('CSV export failed:', error);
      toast.error(t('exportFailed'));
    } finally {
      setLoading(prev => ({ ...prev, csv: false }));
    }
  };

  const handleDownloadDetails = async () => {
    if (loading.json) return;
    
    setLoading(prev => ({ ...prev, json: true }));
    try {
      const filename = formatFilename('xhs-search-details', 'json');
      exportToJSON(selectedData, filename);
      toast.success(t('downloadingDetails', { count: selectedCount }));
      onDownloadDetails();
    } catch (error) {
      console.error('JSON export failed:', error);
      toast.error(t('exportFailed'));
    } finally {
      setLoading(prev => ({ ...prev, json: false }));
    }
  };

  const handleDownloadImages = async () => {
    if (loading.images) return;
    
    setLoading(prev => ({ ...prev, images: true }));
    try {
      const filename = formatFilename('xhs-search-content', 'json');
      downloadImagesAndText(selectedData, filename);
      toast.success(t('downloadingImages', { count: selectedCount }));
      onDownloadImages();
    } catch (error) {
      console.error('Images export failed:', error);
      toast.error(t('exportFailed'));
    } finally {
      setLoading(prev => ({ ...prev, images: false }));
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportCSV}
              disabled={loading.csv || loading.json || loading.images}
              className="flex items-center gap-2"
            >
              {loading.csv ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheetIcon className="h-4 w-4" />
              )}
              {loading.csv ? t('exporting') : t('exportCSV')}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('exportCSVTooltip')}</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadDetails}
              disabled={loading.csv || loading.json || loading.images}
              className="flex items-center gap-2"
            >
              {loading.json ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <DownloadIcon className="h-4 w-4" />
              )}
              {loading.json ? t('exporting') : t('downloadDetails')}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('downloadDetailsTooltip')}</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadImages}
              disabled={loading.csv || loading.json || loading.images}
              className="flex items-center gap-2"
            >
              {loading.images ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <DownloadIcon className="h-4 w-4" />
              )}
              {loading.images ? t('exporting') : t('downloadImages')}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('downloadImagesTooltip')}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
