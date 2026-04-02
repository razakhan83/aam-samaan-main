import { getStoreCategories, getStoreSettings } from "@/lib/data";
import { getServerSession } from "next-auth";
import AuthProvider from "@/components/AuthProvider";
import LayoutWrapper from "@/components/LayoutWrapper";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { authOptions } from "@/lib/auth";

export default async function StoreLayout({ children }) {
  const [categories, settings, session] = await Promise.all([
    getStoreCategories(),
    getStoreSettings(),
    getServerSession(authOptions),
  ]);

  return (
    <AuthProvider session={session}>
      <CartProvider>
        <WishlistProvider>
          <TooltipProvider>
            <LayoutWrapper categories={categories} settings={settings}>
              {children}
            </LayoutWrapper>
          </TooltipProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
