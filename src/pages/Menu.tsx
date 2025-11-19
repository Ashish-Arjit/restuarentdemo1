import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Search, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_vegetarian: boolean;
  is_available: boolean;
  category_id: string;
  display_order: number;
}

interface Category {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  display_order: number;
}

interface Portion {
  id: string;
  menu_item_id: string;
  name: string;
  price: number;
  is_available: boolean;
}

interface Banner {
  id: string;
  section: string;
  title: string;
  description: string;
  image_url: string;
  is_vegetarian: boolean;
  is_active: boolean;
}

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  portionId?: string;
  portionName?: string;
  selectedPrice?: number;
}

const Menu = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [portions, setPortions] = useState<{ [key: string]: Portion[] }>({});
  const [banners, setBanners] = useState<Banner[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    fetchData();
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCart = (newCart: CartItem[]) => {
    localStorage.setItem("cart", JSON.stringify(newCart));
    setCart(newCart);
  };

  const fetchData = async () => {
    const { data: categoriesData } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order");

    const { data: itemsData } = await supabase
      .from("menu_items")
      .select("*")
      .eq("is_available", true)
      .order("display_order");

    const { data: portionsData } = await supabase
      .from("portions")
      .select("*")
      .eq("is_available", true)
      .order("display_order");

    const { data: bannersData } = await supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("display_order");

    const portionsByItem: { [key: string]: Portion[] } = {};
    portionsData?.forEach((portion) => {
      if (!portionsByItem[portion.menu_item_id]) {
        portionsByItem[portion.menu_item_id] = [];
      }
      portionsByItem[portion.menu_item_id].push(portion);
    });

    setCategories(categoriesData || []);
    setMenuItems(itemsData || []);
    setPortions(portionsByItem);
    setBanners(bannersData || []);
  };

  const addToCart = (item: MenuItem, portionId?: string, portionName?: string, portionPrice?: number) => {
    const existingItem = cart.find((i) => 
      portionId ? (i.menuItemId === item.id && i.portionId === portionId) : (i.menuItemId === item.id && !i.portionId)
    );
    
    const finalPrice = portionPrice || item.price;
    
    if (existingItem) {
      const newCart = cart.map((i) => 
        (portionId ? (i.menuItemId === item.id && i.portionId === portionId) : (i.menuItemId === item.id && !i.portionId))
          ? { ...i, quantity: i.quantity + 1 } 
          : i
      );
      saveCart(newCart);
    } else {
      const newCart = [...cart, { 
        menuItemId: item.id,
        name: item.name,
        price: finalPrice,
        quantity: 1,
        image_url: item.image_url,
        portionId,
        portionName,
        selectedPrice: finalPrice
      }];
      saveCart(newCart);
    }
    
    toast({
      title: "Added to cart",
      description: `${item.name}${portionName ? ` (${portionName})` : ''} added to your cart`,
    });
  };

  const updateQuantity = (menuItemId: string, portionId: string | undefined, delta: number) => {
    const newCart = cart
      .map((item) => {
        if (portionId ? (item.menuItemId === menuItemId && item.portionId === portionId) : (item.menuItemId === menuItemId && !item.portionId)) {
          const newQuantity = item.quantity + delta;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      })
      .filter((item): item is CartItem => item !== null);
    saveCart(newCart);
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const scrollToCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    categoryRefs.current[categoryId]?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start'
    });
  };

  const itemsByCategory = categories.map(category => ({
    category,
    items: filteredItems.filter(item => item.category_id === category.id)
  })).filter(group => group.items.length > 0);

  const cartTotal = cart.reduce((sum, item) => sum + (item.selectedPrice || item.price) * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar cartItemCount={cartCount} />

      <div className="flex-1">
        {/* Today's Specials Banner - Complete Redesign */}
        {banners.length > 0 && (
          <section className="bg-gradient-to-br from-primary via-red-600 to-accent py-8 shadow-xl border-b-4 border-accent">
            <div className="container max-w-6xl">
              <div className="text-center mb-6">
                <h2 className="text-4xl font-bold text-white drop-shadow-lg flex items-center justify-center gap-3">
                  <span>🌟</span>
                  <span>Today's Special Menu</span>
                  <span>🌟</span>
                </h2>
                <p className="text-white/90 mt-2">Fresh & Delicious Homemade Meals</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {["Lunch Menu", "Dinner Menu"].map((section) => {
                  const sectionBanners = banners.filter((b) => b.section === section);
                  if (sectionBanners.length === 0) return null;

                  const vegItems = sectionBanners.filter((b) => b.is_vegetarian);
                  const nonVegItems = sectionBanners.filter((b) => !b.is_vegetarian);

                  return (
                    <div key={section} className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-2xl border-2 border-white/50">
                      <h3 className="text-2xl font-bold text-primary mb-4 text-center pb-2 border-b-2 border-primary/20">
                        {section === "Lunch Menu" ? "🌞 Lunch Menu" : "🌙 Dinner Menu"}
                      </h3>

                      <div className="space-y-4">
                        {/* Vegetarian Items */}
                        {vegItems.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-5 h-5 border-2 border-green-600 flex items-center justify-center rounded">
                                <div className="w-2.5 h-2.5 rounded-full bg-green-600"></div>
                              </div>
                              <h4 className="font-bold text-green-700 text-lg">Vegetarian</h4>
                            </div>
                            <div className="space-y-1.5 pl-4">
                              {vegItems.map((banner) => (
                                <div key={banner.id} className="flex items-start gap-2 group">
                                  <span className="text-accent text-xl mt-0.5">•</span>
                                  <div className="flex-1">
                                    <span className="font-semibold text-gray-800 group-hover:text-primary transition-colors">
                                      {banner.title}
                                    </span>
                                    {banner.description && (
                                      <p className="text-sm text-muted-foreground">{banner.description}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Non-Vegetarian Items */}
                        {nonVegItems.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-5 h-5 border-2 border-red-600 flex items-center justify-center rounded">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-600"></div>
                              </div>
                              <h4 className="font-bold text-red-700 text-lg">Non-Vegetarian</h4>
                            </div>
                            <div className="space-y-1.5 pl-4">
                              {nonVegItems.map((banner) => (
                                <div key={banner.id} className="flex items-start gap-2 group">
                                  <span className="text-accent text-xl mt-0.5">•</span>
                                  <div className="flex-1">
                                    <span className="font-semibold text-gray-800 group-hover:text-primary transition-colors">
                                      {banner.title}
                                    </span>
                                    {banner.description && (
                                      <p className="text-sm text-muted-foreground">{banner.description}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Search Bar */}
        <section className="py-4 border-b bg-white sticky top-16 z-40">
          <div className="container">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-2"
              />
            </div>
          </div>
        </section>

        {/* Category Tabs */}
        <section className="sticky top-[136px] z-40 bg-white border-b py-3">
          <div className="container">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <Button
                onClick={() => setSelectedCategory("all")}
                variant={selectedCategory === "all" ? "default" : "outline"}
                className="whitespace-nowrap rounded-full px-6"
                size="sm"
              >
                All Items
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => scrollToCategory(category.id)}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className="whitespace-nowrap rounded-full px-6"
                  size="sm"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Menu Items by Category - List Layout */}
        <section className="py-6 bg-secondary/10">
          <div className="container max-w-4xl space-y-8">
            {itemsByCategory.map(({ category, items }) => (
              <div 
                key={category.id} 
                ref={(el) => categoryRefs.current[category.id] = el}
                className="scroll-mt-32"
              >
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-muted-foreground mb-1">
                    {category.description || category.name}
                  </h2>
                </div>

                <div className="space-y-4">
                  {items.map((item) => {
                    const itemPortions = portions[item.id] || [];
                    const hasPortions = itemPortions.length > 0;
                    const cartItem = cart.find((i) => i.menuItemId === item.id && !i.portionId);
                    
                    return (
                      <Card 
                        key={item.id} 
                        className="overflow-hidden bg-white border-0 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-4 p-4">
                          {/* Left side - Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 mb-2">
                              {item.is_vegetarian && (
                                <div className="flex-shrink-0 w-5 h-5 border-2 border-green-600 flex items-center justify-center rounded-sm mt-0.5">
                                  <div className="w-2 h-2 rounded-full bg-green-600"></div>
                                </div>
                              )}
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg leading-tight mb-1">
                                  {item.name}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                            
                            {/* Portions or Regular Price */}
                            {hasPortions ? (
                              <div className="mt-3 space-y-2">
                                {itemPortions.map((portion) => {
                                  const portionCartItem = cart.find((i) => i.menuItemId === item.id && i.portionId === portion.id);
                                  return (
                                    <div key={portion.id} className="flex items-center justify-between">
                                      <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium text-muted-foreground">
                                          {portion.name}
                                        </span>
                                        <span className="text-base font-bold text-primary">
                                          ₹{portion.price}
                                        </span>
                                      </div>
                                      {portionCartItem ? (
                                        <div className="flex items-center gap-2 bg-primary/10 rounded px-2">
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => updateQuantity(item.id, portion.id, -1)}
                                            className="h-7 w-7"
                                          >
                                            <Minus className="h-3 w-3" />
                                          </Button>
                                          <span className="font-semibold min-w-[1.5ch] text-center">
                                            {portionCartItem.quantity}
                                          </span>
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => updateQuantity(item.id, portion.id, 1)}
                                            className="h-7 w-7"
                                          >
                                            <Plus className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ) : (
                                        <Button
                                          size="sm"
                                          onClick={() => addToCart(item, portion.id, portion.name, portion.price)}
                                          variant="accent"
                                          className="h-8 px-6 font-semibold"
                                        >
                                          Add
                                        </Button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="flex items-center justify-between mt-3">
                                <span className="text-lg font-bold text-primary">
                                  ₹{item.price}
                                </span>
                                {cartItem ? (
                                  <div className="flex items-center gap-2 bg-primary/10 rounded px-2">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => updateQuantity(item.id, undefined, -1)}
                                      className="h-8 w-8"
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="font-semibold min-w-[2ch] text-center">
                                      {cartItem.quantity}
                                    </span>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => updateQuantity(item.id, undefined, 1)}
                                      className="h-8 w-8"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    onClick={() => addToCart(item)}
                                    variant="accent"
                                    size="sm"
                                    className="h-9 px-8 font-semibold"
                                  >
                                    Add
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Right side - Image */}
                          <div className="flex-shrink-0 w-32 h-32">
                            {item.image_url ? (
                              <img 
                                src={item.image_url} 
                                alt={item.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 rounded-lg flex items-center justify-center text-4xl">
                                {item.is_vegetarian ? "🥗" : "🍖"}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">No items found</p>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom">
          <Button
            onClick={() => navigate("/cart")}
            size="lg"
            variant="hero"
            className="rounded-full shadow-2xl h-16 px-8"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            <span className="font-semibold">{cartCount} items</span>
            <span className="mx-2">|</span>
            <span className="font-bold">₹{cartTotal.toFixed(2)}</span>
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Menu;
