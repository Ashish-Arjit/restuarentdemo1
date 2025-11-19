import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";

export const AdminBanners = () => {
  const { toast } = useToast();
  const [banners, setBanners] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ section: "Lunch Menu", title: "", description: "", is_vegetarian: true, is_active: true });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    const { data } = await supabase.from("banners").select("*");
    if (data) setBanners(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("banners").insert(formData);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Banner added" });
      setFormData({ section: "Lunch Menu", title: "", description: "", is_vegetarian: true, is_active: true });
      setIsDialogOpen(false);
      fetchBanners();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Banner deleted" });
      fetchBanners();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Today's Specials</h3>
          <p className="text-sm text-muted-foreground">Manage daily curry specials that appear at the top of the menu</p>
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button><Plus className="h-4 w-4 mr-2" />Add Special</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Today's Special</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Menu Section</label>
              <select 
                value={formData.section} 
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="Lunch Menu">Lunch Menu</option>
                <option value="Dinner Menu">Dinner Menu</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Item Name</label>
              <Input placeholder="e.g., Chicken Curry" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description (Optional)</label>
              <Input placeholder="e.g., Spicy and delicious" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.is_vegetarian} onCheckedChange={(checked) => setFormData({ ...formData, is_vegetarian: checked })} />
              <span>Vegetarian</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
              <span>Display on menu</span>
            </div>
            <Button type="submit" className="w-full">Save Special</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-3">
        {banners.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No specials added yet. Click "Add Special" to create your first daily special.
            </CardContent>
          </Card>
        ) : (
          banners.map((banner) => (
            <Card key={banner.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-accent">{banner.section}</span>
                    {banner.is_vegetarian ? (
                      <div className="w-4 h-4 border-2 border-green-600 flex items-center justify-center rounded-sm">
                        <div className="w-2 h-2 rounded-full bg-green-600"></div>
                      </div>
                    ) : (
                      <div className="w-4 h-4 border-2 border-red-600 flex items-center justify-center rounded-sm">
                        <div className="w-2 h-2 rounded-full bg-red-600"></div>
                      </div>
                    )}
                  </div>
                  <div className="font-semibold text-lg">{banner.title}</div>
                  {banner.description && (
                    <div className="text-sm text-muted-foreground mt-1">{banner.description}</div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${banner.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {banner.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <Button size="icon" variant="destructive" onClick={() => handleDelete(banner.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
