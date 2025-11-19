import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChefHat, Award, Zap, Leaf } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
import aboutImage from "@/assets/about-image.jpg";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBanner} 
            alt="Delicious South Indian cuisine" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary-light/80" />
        </div>
        
        <div className="container relative z-10 text-center text-primary-foreground">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Welcome to Aunty's Kitchen
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto opacity-95">
            Experience the authentic flavors of Homely Foods with premium quality ingredients
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/menu">
              <Button size="lg" variant="hero" className="text-lg px-8">
                Order Now
              </Button>
            </Link>
            <Link to="/menu">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-background/10 border-primary-foreground text-primary-foreground hover:bg-background/20">
                View Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-secondary/20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-primary mb-6">Our Story</h2>
              <p className="text-lg text-muted-foreground mb-4">
                Auntys Kitchen has been serving authentic Homely Foods for over a decade. 
                Our passion for traditional recipes combined with premium quality ingredients creates 
                an unforgettable dining experience.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                Every dish is crafted with love and care, using spices sourced directly from the finest 
                regions of India. We take pride in bringing the true taste of Home Foods to your table.
              </p>
              <Link to="/menu">
                <Button variant="accent" size="lg">
                  Explore Our Menu
                </Button>
              </Link>
            </div>
            <div className="relative">
              <img 
                src={aboutImage} 
                alt="Traditional South Indian thali" 
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10+</div>
              <div className="text-sm opacity-90">Years of Excellence</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-sm opacity-90">Menu Items</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-sm opacity-90">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-sm opacity-90">Authentic Recipes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-4xl font-bold text-center text-primary mb-12">Why Choose Us</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-primary/20 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-4">
                  <ChefHat className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Master Chefs</h3>
                <p className="text-muted-foreground">
                  Our experienced chefs bring decades of culinary expertise to every dish
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Premium Quality</h3>
                <p className="text-muted-foreground">
                  Only the finest ingredients sourced from trusted suppliers
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Swift Service</h3>
                <p className="text-muted-foreground">
                  Quick delivery without compromising on quality and taste
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quality Spices Section */}
      <section className="py-20 bg-secondary/20">
        <div className="container text-center">
          <Leaf className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-primary mb-6">Quality Spices</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            We use premium quality spices sourced directly from the finest regions of India. 
            Each spice is carefully selected to ensure authentic flavors in every bite.
          </p>
          <Link to="/menu">
            <Button size="lg" variant="hero">
              Taste the Difference
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
