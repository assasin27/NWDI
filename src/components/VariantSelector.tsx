import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { X } from 'lucide-react';

export interface VariantSelectorProps {
  product: any;
  onSelect: (variant: any) => void;
  onClose: () => void;
  productType: 'rice' | 'dhoopbatti';
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  product,
  onSelect,
  onClose,
  productType
}) => {
  const getSelectionText = () => {
    return productType === 'rice' ? 'Select grain length' : 'Select fragrance';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">{product.name}</CardTitle>
            <CardDescription>{getSelectionText()}</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {product.variants?.map((variant: any, index: number) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-between h-auto p-4"
                onClick={() => onSelect(variant)}
              >
                <div className="text-left">
                  <div className="font-medium">{variant.name}</div>
                  <div className="text-sm text-gray-500">₹{variant.price}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 