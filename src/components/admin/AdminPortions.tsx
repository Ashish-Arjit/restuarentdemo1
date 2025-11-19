import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Portion {
  id: string;
  menu_item_id: string;
  name: string;
  price: number;
  display_order: number;
  is_available: boolean;
}

interface MenuItem {
  id: string;
  name: string;
}

export const AdminPortions = () => {
  const { toast } = useToast();
  const [portions, setPortions] = useState<Portion[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPortion, setEditingPortion] = useState<Portion | null>(null);
  const [formData, setFormData] = useState({
    menu_item_id: "",
    name: "",
    price: "",
    display_order: "0",
    is_available: true,
  });

  useEffect(() => {
    fetchPortions();
    fetchMenuItems();
  }, []);

  const fetchPortions = async () => {
    const { data } = await supabase
      .from("portions")
      .select("*")
      .order("menu_item_id")
      .order("display_order");
    if (data) setPortions(data);
  };

  const fetchMenuItems = async () => {
    const { data } = await supabase.from("menu_items").select("id, name").order("name");
    if (data) setMenuItems(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      display_order: parseInt(formData.display_order),
    };

    if (editingPortion) {
      const { error } = await supabase
        .from("portions")
        .update(data)
        .eq("id", editingPortion.id);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Portion updated" });
        setIsDialogOpen(false);
        fetchPortions();
      }
    } else {
      const { error } = await supabase.from("portions").insert(data);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Portion added" });
        setIsDialogOpen(false);
        fetchPortions();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("portions").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Portion deleted" });
      fetchPortions();
    }
  };

  const openDialog = (portion?: Portion) => {
    if (portion) {
      setEditingPortion(portion);
      setFormData({
        menu_item_id: portion.menu_item_id,
        name: portion.name,
        price: portion.price.toString(),
        display_order: portion.display_order.toString(),
        is_available: portion.is_available,
      });
    } else {
      setEditingPortion(null);
      setFormData({
        menu_item_id: "",
        name: "",
        price: "",
        display_order: "0",
        is_available: true,
      });
    }
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => openDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Portion
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPortion ? "Edit" : "Add"} Portion</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Menu Item</Label>
              <Select
                value={formData.menu_item_id}
                onValueChange={(value) => setFormData({ ...formData, menu_item_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select menu item" />
                </SelectTrigger>
                <SelectContent>
                  {menuItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Portion Name</Label>
              <Input
                placeholder="e.g., Half, Full, Large"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Price</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Display Order</Label>
              <Input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_available}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_available: checked })
                }
              />
              <Label>Available</Label>
            </div>
            <Button type="submit" className="w-full">
              Save
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {portions.map((portion) => {
          const menuItem = menuItems.find((item) => item.id === portion.menu_item_id);
          return (
            <Card key={portion.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {menuItem?.name} - {portion.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">₹{portion.price}</p>
                  {!portion.is_available && (
                    <span className="text-xs text-destructive">Unavailable</span>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => openDialog(portion)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => handleDelete(portion.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
