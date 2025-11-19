import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Plus, Minus } from "lucide-react";

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
}

const Cart = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [flatNo, setFlatNo] = useState("");
  const [apartmentStreet, setApartmentStreet] = useState("");
  const [sector, setSector] = useState("");
  const [area, setArea] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    loadCart();
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    
    if (session?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      
      if (profile) {
        setCustomerName(profile.full_name || "");
        setCustomerPhone(profile.phone || "");
        setCustomerAddress(profile.address || "");
      }
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setGettingLocation(false);
        toast({
          title: "Location captured",
          description: "Your location has been saved",
        });
      },
      (error) => {
        setGettingLocation(false);
        toast({
          title: "Location error",
          description: "Could not get your location. Please try again.",
          variant: "destructive",
        });
      }
    );
  };

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

  const updateQuantity = (menuItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const newCart = cart.map((item) =>
      item.menuItemId === menuItemId ? { ...item, quantity: newQuantity } : item
    );
    saveCart(newCart);
  };

  const removeItem = (menuItemId: string) => {
    const newCart = cart.filter((item) => item.menuItemId !== menuItemId);
    saveCart(newCart);
    toast({ title: "Item removed from cart" });
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to place an order",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!customerName || !customerPhone || !flatNo || !apartmentStreet || !sector || !area) {
      toast({
        title: "Missing information",
        description: "Please fill in all address details",
        variant: "destructive",
      });
      return;
    }

    if (!latitude || !longitude) {
      toast({
        title: "Location required",
        description: "Please capture your location for delivery",
        variant: "destructive",
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some items to your cart first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const fullAddress = `${flatNo}, ${apartmentStreet}, ${sector}, ${area}`;
      
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_address: fullAddress,
          flat_no: flatNo,
          apartment_street: apartmentStreet,
          sector: sector,
          area: area,
          latitude: latitude,
          longitude: longitude,
          total_amount: totalAmount,
          status: "Pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map((item) => ({
        order_id: order.id,
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
        price: item.price,
        item_name: item.name,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      localStorage.removeItem("cart");
      toast({
        title: "Order placed successfully!",
        description: "You can track your order in My Orders page",
      });
      navigate("/orders");
    } catch (error: any) {
      toast({
        title: "Error placing order",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar cartItemCount={cart.reduce((sum, item) => sum + item.quantity, 0)} />

      <div className="flex-1 py-12">
        <div className="container">
          <h1 className="text-4xl font-bold text-primary mb-8">Your Cart</h1>

          {cart.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-lg text-muted-foreground mb-4">Your cart is empty</p>
                <Button onClick={() => navigate("/menu")} variant="hero">
                  Browse Menu
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => (
                  <Card key={item.menuItemId}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 rounded-lg bg-muted flex-shrink-0">
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <p className="text-primary font-semibold mt-1">
                            ₹{item.price.toFixed(2)}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-12 text-center">{item.quantity}</span>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => removeItem(item.menuItemId)}
                              className="ml-auto"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Customer Details</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="+91 1234567890"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Delivery Address</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="flatNo">Flat No.</Label>
                        <Input
                          id="flatNo"
                          value={flatNo}
                          onChange={(e) => setFlatNo(e.target.value)}
                          placeholder="101"
                        />
                      </div>
                      <div>
                        <Label htmlFor="apartmentStreet">Apartment Name / Street Name</Label>
                        <Input
                          id="apartmentStreet"
                          value={apartmentStreet}
                          onChange={(e) => setApartmentStreet(e.target.value)}
                          placeholder="Green Valley Apartments"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sector">Sector</Label>
                        <Input
                          id="sector"
                          value={sector}
                          onChange={(e) => setSector(e.target.value)}
                          placeholder="Sector 21"
                        />
                      </div>
                      <div>
                        <Label htmlFor="area">Area</Label>
                        <Input
                          id="area"
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                          placeholder="Dwarka, New Delhi"
                        />
                      </div>
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={getCurrentLocation}
                          disabled={gettingLocation}
                        >
                          {gettingLocation
                            ? "Getting Location..."
                            : latitude && longitude
                            ? "Location Captured ✓"
                            : "Capture My Location"}
                        </Button>
                        {latitude && longitude && (
                          <p className="text-xs text-muted-foreground mt-1 text-center">
                            Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>₹{totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                        <span>Total</span>
                        <span className="text-primary">₹{totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                    <Button
                      onClick={handleCheckout}
                      className="w-full mt-6"
                      size="lg"
                      variant="hero"
                      disabled={loading}
                    >
                      {loading ? "Placing Order..." : "Place Order"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
