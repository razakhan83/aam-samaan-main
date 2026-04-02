"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Sparkles, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function formatPrice(value) {
  return `Rs ${Number(value || 0).toLocaleString("en-PK")}`;
}

export default function RelatedProductsPicker({
  products = [],
  selectedIds = [],
  onChange,
  currentProductId = "",
}) {
  const [open, setOpen] = useState(false);

  const availableProducts = useMemo(() => {
    return products.filter((product) => {
      const id = String(product?._id || product?.id || "").trim();
      return id && id !== String(currentProductId || "").trim();
    });
  }, [currentProductId, products]);

  const selectedProducts = useMemo(() => {
    const idSet = new Set(selectedIds.map((id) => String(id)));
    return availableProducts.filter((product) => idSet.has(String(product?._id || product?.id || "")));
  }, [availableProducts, selectedIds]);

  function toggleProduct(productId) {
    const normalizedId = String(productId || "").trim();
    if (!normalizedId) return;

    if (selectedIds.includes(normalizedId)) {
      onChange(selectedIds.filter((id) => id !== normalizedId));
      return;
    }

    onChange([...selectedIds, normalizedId].slice(0, 8));
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/35 p-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="size-4 text-primary" />
          Recommendation Pairing
        </div>
        <p className="text-xs text-muted-foreground text-pretty">
          Hand-pick up to 8 products to show first. If you leave this empty, the product page will fall back to smart picks from the same category.
        </p>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-11 justify-between rounded-xl px-4 text-sm font-medium">
            {selectedIds.length > 0
              ? `${selectedIds.length} curated recommendation${selectedIds.length === 1 ? "" : "s"} selected`
              : "Choose related products"}
            <ChevronsUpDown className="size-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[min(32rem,calc(100vw-2rem))] p-0">
          <Command>
            <CommandInput placeholder="Search products to recommend..." />
            <CommandList>
              <CommandEmpty>No products found.</CommandEmpty>
              <CommandGroup heading="Products">
                {availableProducts.map((product) => {
                  const productId = String(product?._id || product?.id || "");
                  const isSelected = selectedIds.includes(productId);
                  return (
                    <CommandItem
                      key={productId}
                      value={`${product?.Name || ""} ${product?.slug || ""}`}
                      onSelect={() => toggleProduct(productId)}
                      className="items-start gap-3 rounded-lg px-3 py-3"
                    >
                      <div className="mt-0.5 flex size-5 items-center justify-center rounded-full border border-border bg-background">
                        <Check className={cn("size-3.5 transition-opacity", isSelected ? "opacity-100" : "opacity-0")} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{product?.Name}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="tabular-nums">{formatPrice(product?.discountedPrice ?? product?.Price)}</span>
                          <span className="truncate">{product?.slug || productId}</span>
                        </div>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedProducts.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedProducts.map((product) => {
            const productId = String(product?._id || product?.id || "");
            return (
              <Badge key={productId} variant="secondary" className="group gap-2 rounded-full px-3 py-1.5">
                <span className="max-w-[14rem] truncate">{product?.Name}</span>
                <button
                  type="button"
                  onClick={() => toggleProduct(productId)}
                  className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition-[transform,color] duration-150 hover:text-foreground active:scale-[0.96]"
                  aria-label={`Remove ${product?.Name} from related products`}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
