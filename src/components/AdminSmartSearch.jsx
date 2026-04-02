'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Clock3, Inbox, Package2, Search, Settings, ShoppingCart, Star, User2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command';

const GROUP_ICONS = {
  Pages: Settings,
  Products: Box,
  Orders: ShoppingCart,
  Users: User2,
  Reviews: Star,
  Categories: Package2,
};

function getGroupIcon(group) {
  return GROUP_ICONS[group] || Inbox;
}

export default function AdminSmartSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function handleKeyDown(event) {
      if ((event.key === 'k' && (event.metaKey || event.ctrlKey)) || event.key === '/') {
        const target = event.target;
        const isTypingField =
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target instanceof HTMLSelectElement ||
          target?.isContentEditable;

        if (event.key === '/' && isTypingField) return;

        event.preventDefault();
        setOpen((previous) => !previous);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/search?q=${encodeURIComponent(query.trim())}`, { cache: 'no-store' });
        const data = response.ok ? await response.json() : { items: [] };
        if (!ignore) {
          setItems(Array.isArray(data.items) ? data.items : []);
        }
      } catch (error) {
        if (!ignore) {
          setItems([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }, query.trim() ? 180 : 0);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  const groupedItems = useMemo(() => {
    return items.reduce((groups, item) => {
      const key = item.group || 'Results';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    }, {});
  }, [items]);

  function handleSelect(href) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="admin-dashboard-button hidden min-w-56 justify-between md:inline-flex"
        onClick={() => setOpen(true)}
      >
        <span className="flex items-center gap-2 text-muted-foreground">
          <Search data-icon="inline-start" />
          Smart Search
        </span>
        <CommandShortcut>Ctrl K</CommandShortcut>
      </Button>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="admin-dashboard-button md:hidden"
        onClick={() => setOpen(true)}
      >
        <Search />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Smart Search"
        description="Search products, orders, customers, reviews, and admin pages."
        className="max-w-2xl"
      >
        <Command className="admin-smart-search rounded-[1.4rem]! p-2">
          <CommandInput value={query} onValueChange={setQuery} placeholder="Search orders, products, customers, or pages..." />
          <CommandList className="max-h-[65vh]">
            <CommandEmpty>{loading ? 'Searching...' : 'No results found.'}</CommandEmpty>
            {Object.entries(groupedItems).map(([group, groupItems]) => {
              const Icon = getGroupIcon(group);
              return (
                <CommandGroup
                  key={group}
                  heading={group}
                  className="admin-smart-search-group"
                >
                  {groupItems.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={`${item.group} ${item.title} ${item.subtitle}`}
                      onSelect={() => handleSelect(item.href)}
                      className="admin-smart-search-item rounded-xl px-3 py-3"
                    >
                      <span className="admin-smart-search-icon inline-flex size-9 items-center justify-center rounded-lg">
                        <Icon />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-sm font-semibold text-foreground">{item.title}</span>
                        <span className="truncate text-xs text-muted-foreground">{item.subtitle}</span>
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </CommandList>
          <div className="flex items-center justify-between gap-3 px-3 pb-2 pt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock3 className="size-3.5" />
              Suggestions update as you type
            </span>
            <CommandShortcut>Esc</CommandShortcut>
          </div>
        </Command>
      </CommandDialog>
    </>
  );
}
