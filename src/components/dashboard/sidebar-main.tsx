'use client';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { LocaleLink, useLocalePathname } from '@/i18n/navigation';
import type { NestedMenuItem } from '@/types';
import { cn } from '@/lib/utils';

/**
 * Render icon based on type
 */
function renderIcon(icon: NestedMenuItem['icon']) {
  if (!icon) return null;
  
  if (typeof icon === 'object' && 'type' in icon && icon.type === 'html') {
    return (
      <div 
        className={cn('shrink-0', icon.className)}
        dangerouslySetInnerHTML={{ __html: icon.content }}
      />
    );
  }
  
  return icon;
}

/**
 * Main navigation for the dashboard sidebar
 */
export function SidebarMain({ items }: { items: NestedMenuItem[] }) {
  const pathname = useLocalePathname();

  // Function to check if a path is active
  const isActive = (href: string | undefined): boolean => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Render items with children as SidebarGroup */}
      {items.map((item) =>
        item.items && item.items.length > 0 ? (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent className="flex flex-col gap-2">
              <SidebarMenu>
                {item.items.map((subItem) => (
                  <SidebarMenuItem key={subItem.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(subItem.href)}
                    >
                      <LocaleLink href={subItem.href || ''}>
                        {renderIcon(subItem.icon)}
                        <span className="truncate font-medium text-sm">
                          {subItem.title}
                        </span>
                      </LocaleLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          /* Render items without children directly in a SidebarMenu */
          <SidebarGroup key={item.title}>
            <SidebarGroupContent className="flex flex-col gap-2">
              <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive(item.href)}>
                      <LocaleLink href={item.href || ''}>
                        {renderIcon(item.icon)}
                        <span className="truncate font-medium text-sm">
                          {item.title}
                        </span>
                      </LocaleLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )
      )}
    </>
  );
}
