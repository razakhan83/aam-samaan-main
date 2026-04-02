'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  Loader2,
  ChevronLeft,
  Navigation,
  Building2,
  ShieldCheck,
  MapPinned,
  Check,
  ChevronsUpDown,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { PAKISTAN_CITIES } from '@/lib/cities';
import { cn } from '@/lib/utils';

export default function SettingsClient() {
  const { status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    landmark: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    if (status === 'authenticated') {
      fetchSettings();
    }
  }, [status, router]);

  async function fetchSettings() {
    try {
      const response = await fetch('/api/user/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        city: data.city || '',
        address: data.address || '',
        landmark: data.landmark || '',
      });
    } catch (error) {
      console.error(error);
      toast.error('Could not load your settings');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          city: formData.city,
          address: formData.address,
          landmark: formData.landmark,
        }),
      });

      if (!response.ok) throw new Error('Failed to update settings');
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        onClick={() => router.back()}
      >
        <ChevronLeft data-icon="inline-start" />
        Back
      </Button>

      <div className="mb-6 flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Account settings</span>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Your default checkout details</h1>
        <p className="max-w-2xl text-sm text-muted-foreground [text-wrap:pretty]">
          Keep one default delivery address here. It will auto-fill your checkout to make ordering faster.
        </p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <Card className="surface-card border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="size-5 text-primary" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Basic account details synced from your sign-in profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                    className="pl-10"
                    placeholder="Your full name"
                  />
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="email" className="flex items-center gap-2">
                  Email Address
                  <ShieldCheck className="size-3 text-primary" title="Locked to your account" />
                </FieldLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                  <Input id="email" value={formData.email} disabled className="bg-muted/30 pl-10" />
                </div>
                <FieldDescription className="px-1 text-[11px]">
                  Email is locked to your signed-in account for security.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card className="surface-card border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MapPin className="size-5 text-primary" />
              Default Delivery Info
            </CardTitle>
            <CardDescription>
              This one saved address will auto-fill the checkout form.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                    className="pl-10"
                    placeholder="0300 1234567"
                  />
                </div>
              </Field>

              <FieldGroup className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="city">City</FieldLabel>
                  <Popover open={cityOpen} onOpenChange={setCityOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={cityOpen}
                        className={cn('w-full justify-between font-normal', !formData.city && 'text-muted-foreground')}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <Building2 className="size-4 text-muted-foreground/60" />
                          {formData.city || 'Select your city'}
                        </span>
                        <ChevronsUpDown />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search city..." />
                        <CommandList className="max-h-60 overflow-y-auto">
                          <CommandEmpty>No city found.</CommandEmpty>
                          <CommandGroup>
                            {PAKISTAN_CITIES.map((city) => (
                              <CommandItem
                                key={city}
                                value={city}
                                onSelect={(currentValue) => {
                                  const exactCity = PAKISTAN_CITIES.find((candidate) => candidate.toLowerCase() === currentValue.toLowerCase()) || currentValue;
                                  setFormData({
                                    ...formData,
                                    city: exactCity === formData.city ? '' : exactCity,
                                  });
                                  setCityOpen(false);
                                }}
                              >
                                <Check className={cn('mr-2 size-4', formData.city === city ? 'opacity-100' : 'opacity-0')} />
                                {city}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </Field>

                <Field>
                  <FieldLabel htmlFor="landmark">Nearest Landmark</FieldLabel>
                  <div className="relative">
                    <Navigation className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                    <Input
                      id="landmark"
                      value={formData.landmark}
                      onChange={(event) => setFormData({ ...formData, landmark: event.target.value })}
                      className="pl-10"
                      placeholder="Near main road, school, plaza"
                    />
                  </div>
                </Field>
              </FieldGroup>

              <Field>
                <FieldLabel htmlFor="address">Complete Address</FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <MapPinned className="absolute left-3 top-3 size-4 text-muted-foreground/60" />
                    <Textarea
                      id="address"
                      className="min-h-[110px] pl-10"
                      placeholder="Street, area, house, flat, office, floor details"
                      value={formData.address}
                      onChange={(event) => setFormData({ ...formData, address: event.target.value })}
                    />
                  </div>
                  <FieldDescription>
                    This address will be used as your default checkout auto-fill.
                  </FieldDescription>
                </FieldContent>
              </Field>
            </FieldGroup>
          </CardContent>

          <CardFooter className="border-t border-border/40 bg-muted/10 px-6 py-4">
            <Button type="submit" className="ml-auto min-w-[140px] font-semibold" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Save data-icon="inline-start" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
