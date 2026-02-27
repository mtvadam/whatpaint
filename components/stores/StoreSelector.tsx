'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { StoreCard } from './StoreCard';
import { paintStores } from '@/data/stores';

type StoreSelectorProps = {
  onStoresSelected: (storeIds: string[]) => void;
};

export function StoreSelector({ onStoresSelected }: StoreSelectorProps) {
  const [selectedStores, setSelectedStores] = useState<string[]>([]);

  const toggleStore = (storeId: string) => {
    setSelectedStores(prev =>
      prev.includes(storeId)
        ? prev.filter(id => id !== storeId)
        : [...prev, storeId]
    );
  };

  const handleContinue = () => {
    if (selectedStores.length > 0) {
      onStoresSelected(selectedStores);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">
          Select paint stores
        </h2>
        <p className="text-gray-400">
          Choose which stores you want to match colors from
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {paintStores.map(store => (
          <StoreCard
            key={store.id}
            store={store}
            selected={selectedStores.includes(store.id)}
            onToggle={() => toggleStore(store.id)}
          />
        ))}
      </div>

      <div className="text-center">
        <Button
          onClick={handleContinue}
          disabled={selectedStores.length === 0}
          size="lg"
          className="px-12"
        >
          Continue {selectedStores.length > 0 && `(${selectedStores.length} selected)`}
        </Button>
      </div>
    </div>
  );
}
