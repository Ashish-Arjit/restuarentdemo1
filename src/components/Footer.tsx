import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        {/* --- Main Footer Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* --- About --- */}
          <div>
            <h3 className="text-xl font-bold text-primary mb-4">
              Aunty's Kitchen
            </h3>
            <p className="text-muted-foreground">
              Authentic Homely Foods Delivered at your Doorstep.
            </p>
          </div>

          {/* --- Contact Info --- */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <a
                  href="tel:+918139984675"
                  className="hover:text-primary transition-colors"
                >
                  +91 8139984675
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <a
                  href="https://wa.me/918139984675"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  WhatsApp: +91 8139984675
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <a
                  href="mailto:auntyskitchen.site@gmail.com"
                  className="hover:text-primary transition-colors"
                >
                  auntyskitchen.site@gmail.com
                </a>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <span>Greater Noida</span>
              </div>
            </div>
          </div>

          {/* --- Operating Hours --- */}
          <div>
            <h4 className="font-semibold mb-4">Operating Hours</h4>
            <div className="flex items-start gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p>Monday - Saturday: 11:00 AM - 10:00 PM</p>
                <p className="mt-1">Sunday: 12:00 PM - 9:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- Divider --- */}
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">

          {/* --- Sahora Branding (💎 visually dominant) --- */}
          <div className="mb-8 flex flex-col items-center justify-center gap-3">
            <p className="text-sm sm:text-base font-medium text-primary/90">
              Designed & Developed by
            </p>
            <img
              src="/sahora.png"
              alt="Sahora"
              className="h-12 sm:h-14 md:h-16 object-contain cursor-pointer rounded-lg transition-transform duration-300 hover:scale-110 drop-shadow-md"
              onClick={() => (window.location.href = "https://sahora.in/")}
            />
          </div>

          {/* --- Copyright --- */}
          <p className="text-xs sm:text-sm text-muted-foreground/80">
            &copy; {new Date().getFullYear()} Aunty's Kitchen. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
