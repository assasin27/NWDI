import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Heart, Users, Award } from "lucide-react";
import farmerImage from "@/assets/farmer-portrait.jpg";

const features = [
  {
    icon: Leaf,
    title: "100% Organic",
    description: "All our products are certified organic, grown without harmful chemicals or pesticides"
  },
  {
    icon: Heart,
    title: "Nareshwadi Fresh",
    description: "Harvested daily and delivered within 24 hours to ensure maximum freshness"
  },
  {
    icon: Users,
    title: "Supporting Farmers",
    description: "We work directly with local farmers, ensuring fair prices and sustainable farming"
  },
  {
    icon: Award,
    title: "Quality Assured",
    description: "Every product goes through rigorous quality checks before reaching your table"
  }
];

export const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-background animate-fade-in">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            About <span className="font-script text-leaf-green">Nareshwadi</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We bridge the gap between local farmers and conscious consumers, 
            bringing you the freshest organic produce while supporting sustainable farming practices.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-fresh rounded-2xl p-8 mb-16 text-center">
          <h3 className="text-2xl font-bold text-primary mb-4">Our Mission</h3>
          <p className="text-lg text-primary/80 max-w-2xl mx-auto">
            "To connect local farmers with health-conscious consumers through organic, 
            sustainable products that nourish communities and support the environment."
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-card transition-all duration-300 hover:scale-[1.03] rounded-xl">
              <CardContent className="p-6">
                <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Farmer Spotlight */}
        <div className="bg-muted/30 rounded-2xl p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <Badge className="mb-4 bg-leaf-green text-white">Meet Our Farmers</Badge>
              <h3 className="text-3xl font-bold mb-4">
                <span className="font-script text-leaf-green">Meet</span> Ramesh Patel
              </h3>
              <p className="text-muted-foreground mb-6">
                Ramesh has been practicing organic farming for over 15 years in the fertile lands 
                near Nareshwadi. His dedication to sustainable agriculture and chemical-free practices 
                has made him one of our most trusted partners.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">15+ Years Experience</Badge>
                  <Badge variant="outline" className="text-xs">Organic Certified</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Sustainable Farming</Badge>
                  <Badge variant="outline" className="text-xs">Local Community Leader</Badge>
                </div>
              </div>
              <Button variant="organic">
                Meet All Our Farmers
              </Button>
            </div>
            
            <div className="lg:order-first">
              <div className="relative">
                <img 
                  src={farmerImage} 
                  alt="Ramesh Patel - Organic Farmer"
                  className="rounded-lg shadow-organic w-full h-auto"
                />
                <div className="absolute -bottom-4 -right-4 bg-harvest-gold text-soil-brown px-4 py-2 rounded-lg shadow-button">
                  <div className="text-sm font-semibold">Farmer Since</div>
                  <div className="text-lg font-bold">2009</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};