import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product } from "./ProductCard";
import { Store, Mail, ArrowRight } from "lucide-react";

interface ProductModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductModal({ product, open, onOpenChange }: ProductModalProps) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden p-0">
        <div className="grid md:grid-cols-2">
          <div className="aspect-square bg-secondary md:aspect-auto">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="p-6">
            <DialogHeader>
              <span className="inline-block w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {product.category}
              </span>
              <DialogTitle className="font-heading text-2xl font-bold mt-2">
                {product.name}
              </DialogTitle>
            </DialogHeader>
            
            <p className="mt-4 text-muted-foreground">
              {product.description}
            </p>

            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Store className="h-4 w-4" />
              <span>Sold by <strong className="text-foreground">{product.seller}</strong></span>
            </div>

            <div className="mt-6 border-t border-border pt-6">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Price</span>
                <span className="font-heading text-3xl font-bold text-foreground">
                  ₹{product.price.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Button variant="hero" size="lg" className="w-full">
                <Mail className="h-4 w-4" />
                Contact Seller
              </Button>
              <Button variant="outline" size="lg" className="w-full">
                Request Quote
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
