import { ProductList } from "@/components/ProductList";
import { EventFeed } from "@/components/EventFeed";

export default function Home() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground mt-1">
          Track products through the supply chain from origin to delivery
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProductList />
        </div>
        <div>
          <EventFeed />
        </div>
      </div>
    </div>
  );
}
