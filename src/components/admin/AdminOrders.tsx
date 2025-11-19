import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Printer, Download } from "lucide-react";
import { printOrder, downloadOrderReceipt } from "@/utils/receiptUtils";

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  flat_no: string | null;
  apartment_street: string | null;
  sector: string | null;
  area: string | null;
  latitude: number | null;
  longitude: number | null;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: {
    item_name: string;
    quantity: number;
    price: number;
  }[];
}

export const AdminOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchOrders();
    
    // Set up realtime subscription for new orders
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('New order received:', payload);
          handleNewOrder(payload.new as Order);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleNewOrder = async (newOrder: Order) => {
    // Fetch full order with items
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          item_name,
          quantity,
          price
        )
      `)
      .eq("id", newOrder.id)
      .single();

    if (!error && data) {
      setOrders(prev => [data, ...prev]);
      
      // Show notification
      toast({
        title: "🔔 New Order Received!",
        description: `Order from ${data.customer_name}`,
      });

      // Play sound
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }

      // Auto-download receipt to folder
      setTimeout(() => {
        downloadReceipt(data);
      }, 500);

      // Auto-print to thermal printer
      setTimeout(() => {
        printReceipt(data);
      }, 1000);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          item_name,
          quantity,
          price
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Order status updated" });
      fetchOrders();
    }
  };

  const downloadReceipt = (order: Order) => {
    downloadOrderReceipt(order, order.order_items);
  };


  const printReceipt = (order: Order) => {
    printOrder(order, order.order_items);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      Pending: "bg-yellow-500",
      Confirmed: "bg-blue-500",
      Preparing: "bg-purple-500",
      "Out for Delivery": "bg-orange-500",
      Delivered: "bg-green-500",
      Cancelled: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  if (loading) {
    return <div className="text-center py-12">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Hidden audio element for notification sound */}
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyBzvLZiTYIGGe77eaaSwwOUKXi8LdjHAU2kdXy0H0vBSl+zPLaizsKE2Gy6+mpVhMKRp/g8r5sIQUsgc7y2Yk2CBhnvO3mnEwND06k4vC3Yx0FNo/V8tKAMAUpfs3y2os7ChJfsuvrq1cUCkig4PK+bCEFLIHO8tmJNggYZ7vt5pxMDQ9OpOLwt2MdBTaP1fLSgDAFKX7N8tqLOwoSX7Lr66tXFApIoODyvmwhBSyBzvLZiTYIGGe77eacTA0PTqTi8Lhk"/>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No orders yet</p>
          </CardContent>
        </Card>
      ) : (
        orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <CardTitle>Order #{order.id.slice(0, 8)}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(new Date(order.created_at), "PPP 'at' p")}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadReceipt(order)}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => printReceipt(order)}
                    className="gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
                  <Select
                    value={order.status}
                    onValueChange={(value) => updateOrderStatus(order.id, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Confirmed">Confirmed</SelectItem>
                      <SelectItem value="Preparing">Preparing</SelectItem>
                      <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Customer Details:</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Name:</strong> {order.customer_name}</p>
                    <p><strong>Phone:</strong> {order.customer_phone}</p>
                    <p><strong>Address:</strong> {order.customer_address}</p>
                    {order.latitude && order.longitude && (
                      <p>
                        <strong>Location:</strong>{" "}
                        <a
                          href={`https://www.google.com/maps?q=${order.latitude},${order.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          View on Google Maps
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Order Items:</h4>
                  <div className="space-y-2">
                    {order.order_items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-sm bg-muted/50 p-2 rounded"
                      >
                        <span>
                          {item.item_name} x{item.quantity}
                        </span>
                        <span className="font-semibold">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-primary">
                      ₹{order.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
