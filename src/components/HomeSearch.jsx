'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
    InputGroupText,
} from '@/components/ui/input-group';

export default function HomeSearch() {
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`, { scroll: true });
        }
    };

    return (
        <div className="container mx-auto mb-2 max-w-[600px] px-4 pt-6">
            <form onSubmit={handleSearch} className="w-full">
                <InputGroup className="min-h-14 rounded-[1.35rem] border-[color:color-mix(in_oklab,var(--color-primary)_18%,var(--color-border))] bg-[color:color-mix(in_oklab,var(--color-card)_92%,white)] shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-border)_10%,transparent),0_18px_42px_-30px_color-mix(in_oklab,var(--color-primary)_38%,transparent)]">
                    <InputGroupAddon align="inline-start" className="pl-4 text-primary">
                        <InputGroupText>
                            <Search />
                        </InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                        id="home-search"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-14 px-1 text-base"
                        placeholder="Search for premium products..."
                    />
                    <InputGroupAddon align="inline-end" className="pr-2">
                        <InputGroupButton
                            type="submit"
                            size="sm"
                            className="h-10 rounded-xl px-5"
                            disabled={!searchTerm.trim()}
                        >
                            Search
                        </InputGroupButton>
                    </InputGroupAddon>
                </InputGroup>
            </form>
        </div>
    );
}
