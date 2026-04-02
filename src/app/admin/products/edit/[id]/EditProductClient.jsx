'use client';

import Image from 'next/image';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, CloudUpload, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { uploadImageDataUrl } from '@/lib/cloudinaryUpload';
import RelatedProductsPicker from '@/components/RelatedProductsPicker';
import { getProductCategories } from '@/lib/productCategories';
import { moveProductImageToFront, normalizeProductImages } from '@/lib/productImages';
import { getBlurPlaceholderProps } from '@/lib/imagePlaceholder';
import { cn } from '@/lib/utils';

const uploadActionClass =
  'relative overflow-hidden inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground';

export default function EditProduct({ id }) {
  const router = useRouter();

  const [Name, setName] = useState('');
  const [Description, setDescription] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [seoCanonicalUrl, setSeoCanonicalUrl] = useState('');
  const [Price, setPrice] = useState('');
  const [Categories, setCategories] = useState([]);
  const [relatedProductIds, setRelatedProductIds] = useState([]);
  const [images, setImages] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isBestSelling, setIsBestSelling] = useState(false);

  const [isDragOver, setIsDragOver] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const showToast = (message, type = 'success') => {
    if (type === 'error') toast.error(message);
    else toast.success(message);
  };

  const fetchFormOptions = useCallback(async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/products'),
      ]);
      const [categoriesData, productsData] = await Promise.all([
        categoriesRes.json(),
        productsRes.json(),
      ]);

      if (categoriesData.success) setAllCategories(categoriesData.data);
      if (productsData.success) setAllProducts(productsData.data);
    } catch (err) {
      console.error('Failed to fetch edit form options:', err);
    }
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (data.success) {
          const p = data.data;
          setName(p.Name || '');
          setDescription(p.Description || '');
          setSeoTitle(p.seoTitle || '');
          setSeoDescription(p.seoDescription || '');
          setSeoKeywords(p.seoKeywords || '');
          setSeoCanonicalUrl(p.seoCanonicalUrl || '');
          setPrice(p.Price || '');
          setCategories(getProductCategories(p).map((category) => category._id || category.id));
          setRelatedProductIds(Array.isArray(p.relatedProductIds) ? p.relatedProductIds.map((item) => String(item)) : []);

          const existingImages = normalizeProductImages(p.Images).map((image) => ({
            ...image,
            isNew: false,
          }));
          setImages(existingImages);

          setIsLive(p.isLive ?? false);
          setIsNewArrival(p.isNewArrival === true);
          setIsBestSelling(p.isBestSelling === true);
        } else {
          showToast('Product not found', 'error');
        }
      } catch {
        showToast('Error loading product', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    fetchFormOptions();
  }, [id, fetchFormOptions]);

  const toggleCategory = (categoryId) => {
    setCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((c) => c !== categoryId) : [...prev, categoryId]
    );
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const processFiles = (filesList) => {
    const validFiles = Array.from(filesList).filter((f) => f.type.startsWith('image/'));
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages((prev) => [...prev, { url: ev.target.result, file, isNew: true }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    processFiles(e.dataTransfer.files);
  }, []);

  const handleFileSelect = (e) => {
    processFiles(e.target.files);
    e.target.value = null;
  };

  const removeImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const makeImagePrimary = (indexToMove) => {
    setImages((prev) => moveProductImageToFront(prev, indexToMove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!Name || !Price || Categories.length === 0) {
      showToast('Name, Price and at least one Category are required.', 'error');
      return;
    }

    setSaving(true);
    const finalImages = [];

    try {
      for (const img of images) {
        if (!img.isNew) {
          finalImages.push({
            url: img.url,
            blurDataURL: img.blurDataURL || '',
            publicId: img.publicId || '',
          });
        } else {
          const uploadedImage = await uploadImageDataUrl(img.url, 'kifayatly_products');
          finalImages.push(uploadedImage);
        }
      }
    } catch (err) {
      showToast(`Error uploading images: ${err.message}`, 'error');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Name,
          Description,
          seoTitle,
          seoDescription,
          seoKeywords,
          seoCanonicalUrl,
          Price: Number(Price),
          Images: finalImages,
          Category: Categories,
          relatedProductIds,
          isLive,
          isNewArrival,
          isBestSelling,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Product updated successfully!', 'success');
        setTimeout(() => router.push('/admin/products'), 1500);
      } else {
        showToast(data.message || data.error || 'Failed to update product', 'error');
      }
    } catch {
      showToast('Network error while saving product.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center pb-10">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 size-10 animate-spin text-primary" />
          <p className="font-medium text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  const trimmedSeoTitle = seoTitle.trim();
  const trimmedSeoDescription = seoDescription.trim();
  const trimmedSeoKeywords = seoKeywords.trim();
  const trimmedSeoCanonicalUrl = seoCanonicalUrl.trim();
  const fallbackSlug = Name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const seoPreviewTitle = trimmedSeoTitle || Name || 'Product title preview';
  const seoPreviewDescription =
    trimmedSeoDescription || Description || 'Add a focused product summary to improve search snippets.';
  const seoPreviewUrl =
    trimmedSeoCanonicalUrl || `https://Aam-Samaan-items.vercel.app/products/${fallbackSlug || id}`;
  const seoChecks = [
    { label: 'SEO title', complete: trimmedSeoTitle.length >= 10 },
    { label: 'Meta description', complete: trimmedSeoDescription.length >= 50 },
    { label: 'Keywords', complete: trimmedSeoKeywords.length > 0 },
  ];
  const seoCompleteCount = seoChecks.filter((item) => item.complete).length;
  const seoReady = seoCompleteCount === seoChecks.length;

  return (
    <div className="w-full pb-10">
      <div className="mb-6 flex items-center gap-4 md:mb-8">
        <Link href="/admin/products" className={cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }), 'rounded-xl')}>
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">Edit Product</h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">Refine the product details, media, and search-facing copy in one place.</p>
        </div>
      </div>

      <div className="surface-card max-w-2xl rounded-xl p-4 shadow-lg md:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:gap-6">
          <div>
            <Label className="mb-2">Product Name</Label>
            <Input
              type="text"
              value={Name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 px-4"
              placeholder="e.g., Luxury Tea Set"
              required
            />
          </div>

          <div>
            <Label className="mb-2">Price (Rs)</Label>
            <Input
              type="number"
              value={Price}
              onChange={(e) => setPrice(e.target.value)}
              className="h-11 px-4 tabular-nums"
              placeholder="0.00"
              step="0.01"
              required
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>Categories</Label>
              <Link
                href="/admin/categories"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary no-underline transition-colors hover:text-primary/80 hover:no-underline"
              >
                <PlusCircle className="size-3.5" /> Manage Categories
              </Link>
            </div>
            <div className="flex min-h-[52px] flex-wrap gap-2 rounded-xl border border-border bg-muted/35 p-3">
              {allCategories.length === 0 ? (
                <p className="self-center text-xs text-muted-foreground">No categories found. Add one.</p>
              ) : (
                allCategories.map((cat) => {
                  const selected = Categories.includes(cat._id);
                  return (
                    <Button
                      key={cat._id}
                      type="button"
                      variant={selected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleCategory(cat._id)}
                      className="rounded-lg"
                    >
                      {selected ? <Check data-icon="inline-start" className="size-3" /> : null}
                      {cat.name}
                    </Button>
                  );
                })
              )}
            </div>
            {Categories.length === 0 ? (
              <p className="mt-1 text-xs text-destructive/80">Please select at least one category.</p>
            ) : null}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/35 p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Visibility</p>
              <p className="mt-0.5 text-xs text-muted-foreground text-pretty">
                {isLive ? 'Live and visible to customers.' : 'Saved as draft and hidden from the storefront.'}
              </p>
            </div>
            <Switch checked={isLive} onCheckedChange={setIsLive} aria-label="Toggle product visibility" />
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/35 p-4">
            <p className="text-sm font-semibold text-foreground">Marketing Flags</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-4 sm:border-0 sm:pb-0">
                <Label className="mr-2 cursor-pointer text-xs text-muted-foreground" htmlFor="toggle-new">
                  New Arrival
                </Label>
                <Switch
                  id="toggle-new"
                  checked={isNewArrival}
                  onCheckedChange={setIsNewArrival}
                  aria-label="Toggle new arrival"
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <Label className="mr-2 cursor-pointer text-xs text-muted-foreground" htmlFor="toggle-best">
                  Best Selling
                </Label>
                <Switch
                  id="toggle-best"
                  checked={isBestSelling}
                  onCheckedChange={setIsBestSelling}
                  aria-label="Toggle best selling"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>Product Images</Label>
              <div className={uploadActionClass}>
                <PlusCircle className="size-3.5" /> Add More Images
                <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {images.map((img, idx) => (
                <div key={idx} className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted/40">
                  <Image
                    src={img.url}
                    alt="Preview"
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover"
                    {...getBlurPlaceholderProps(img.blurDataURL)}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-xs"
                    onClick={() => removeImage(idx)}
                    className="absolute right-2 top-2 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                  {idx !== 0 ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => makeImagePrimary(idx)}
                      className="absolute bottom-2 left-2 h-6 rounded-md bg-background/95 px-2 text-[10px] font-bold opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                    >
                      Set Main
                    </Button>
                  ) : (
                    <Badge variant="secondary" className="absolute bottom-2 left-2 rounded-md bg-background/95 shadow-sm">
                      Main Image
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                'relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-[border-color,background-color,box-shadow] duration-200',
                isDragOver
                  ? 'border-primary bg-primary/8'
                  : 'border-border bg-muted/20 hover:border-primary/35 hover:bg-muted/35'
              )}
            >
              <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
              <div className="flex flex-col gap-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CloudUpload className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Drag & Drop Images Here</p>
                  <p className="text-xs text-muted-foreground">or click to browse multiple files</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">PNG, JPG up to 10MB each.</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">Use &quot;Set Main&quot; on a preview to move it to the first slot.</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label className="mb-2">Description</Label>
            <Textarea
              value={Description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-28 resize-none px-4 py-3"
              placeholder="Enter product description..."
              rows="4"
            />
          </div>

          <RelatedProductsPicker
            products={allProducts}
            selectedIds={relatedProductIds}
            onChange={setRelatedProductIds}
            currentProductId={id}
          />

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/35 p-4 md:p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-balance text-sm font-semibold text-foreground">SEO & Metadata</h2>
                <p className="mt-1 text-xs text-muted-foreground text-pretty">
                  These fields power the product page title, description, canonical URL, and schema markup.
                </p>
              </div>
              <Badge variant={seoReady ? 'emerald' : 'secondary'} className="rounded-full px-3 py-1 text-xs">
                <Check className={cn('size-3.5', seoReady ? 'opacity-100' : 'opacity-60')} />
                {seoReady ? 'SEO basics complete' : `${seoCompleteCount}/${seoChecks.length} SEO basics complete`}
              </Badge>
            </div>

            <div className="grid gap-4">
              <div>
                <Label className="mb-2">SEO Title</Label>
                <Input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="h-11 px-4"
                  placeholder="Custom search title for this product"
                  maxLength={70}
                />
                <p className="mt-1 text-[11px] text-muted-foreground tabular-nums">{seoTitle.length}/70 characters</p>
              </div>

              <div>
                <Label className="mb-2">Meta Description</Label>
                <Textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  className="min-h-24 resize-none px-4 py-3"
                  placeholder="Short product summary for search engines and social previews"
                  rows="3"
                  maxLength={320}
                />
                <p className="mt-1 text-[11px] text-muted-foreground tabular-nums">{seoDescription.length}/320 characters</p>
              </div>

              <div>
                <Label className="mb-2">Keywords</Label>
                <Input
                  type="text"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  className="h-11 px-4"
                  placeholder="e.g., tea set, chinese tea cups, luxury gift"
                />
              </div>

              <div>
                <Label className="mb-2">Canonical URL</Label>
                <Input
                  type="url"
                  value={seoCanonicalUrl}
                  onChange={(e) => setSeoCanonicalUrl(e.target.value)}
                  className="h-11 px-4"
                  placeholder="https://Aam-Samaan-items.vercel.app/products/your-product"
                />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Search Preview</p>
                <div className="mt-3 flex flex-col gap-1.5">
                  <p className="line-clamp-2 text-balance text-base font-semibold text-primary">{seoPreviewTitle}</p>
                  <p className="truncate text-xs text-primary">{seoPreviewUrl}</p>
                  <p className="line-clamp-3 text-pretty text-sm leading-6 text-muted-foreground">{seoPreviewDescription}</p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Completion Check</p>
                <div className="mt-3 flex flex-col gap-2">
                  {seoChecks.map((item) => (
                    <div
                      key={item.label}
                      className={cn(
                        'flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-medium',
                        item.complete
                          ? 'border-success/20 bg-success/10 text-primary'
                          : 'border-border bg-muted/40 text-muted-foreground'
                      )}
                    >
                      <span>{item.label}</span>
                      <span className="inline-flex items-center gap-1">
                        <Check className={cn('size-3.5', item.complete ? 'opacity-100' : 'opacity-30')} />
                        {item.complete ? 'Ready' : 'Missing'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-4 md:mt-8">
            <Button type="submit" disabled={saving} size="lg" className="flex-1 rounded-xl font-bold">
              {saving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
            <Link href="/admin/products" className="flex-1">
              <Button variant="outline" size="lg" className="w-full rounded-xl font-bold" type="button">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
