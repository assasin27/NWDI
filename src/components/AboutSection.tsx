import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Heart, Users, Award } from "lucide-react";
import farmerImage from "@/assets/farmer-portrait.jpg";
import fruitsImg from "@/assets/fruits.jpg";
import vegetablesImg from "@/assets/vegetables.jpg";
import heroFarm from "@/assets/hero-farm.jpg";

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
      <div className="px-4">
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
        <div className="bg-gradient-fresh rounded-2xl p-8 mb-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <img src={heroFarm} alt="Nareshwadi Farm" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-primary mb-4">Our Mission</h3>
            <p className="text-lg text-primary/80 max-w-2xl mx-auto">
              "To connect local farmers with health-conscious consumers through organic, 
              sustainable products that nourish communities and support the environment."
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-card transition-all duration-300 hover:scale-[1.03] rounded-xl overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                <feature.icon className="h-12 w-12 text-green-600" />
              </div>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Visual Impact Section */}
        <div className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <img src={fruitsImg} alt="Fresh Fruits" className="w-full h-48 object-cover rounded-xl shadow-lg mb-4" />
            <h3 className="text-lg font-semibold text-green-700">Fresh Fruits</h3>
            <p className="text-sm text-gray-600">Handpicked from local orchards</p>
          </div>
          <div className="text-center">
            <img src={vegetablesImg} alt="Organic Vegetables" className="w-full h-48 object-cover rounded-xl shadow-lg mb-4" />
            <h3 className="text-lg font-semibold text-green-700">Organic Vegetables</h3>
            <p className="text-sm text-gray-600">Chemical-free, naturally grown</p>
          </div>
          <div className="text-center">
            <img src={heroFarm} alt="Nareshwadi Farm" className="w-full h-48 object-cover rounded-xl shadow-lg mb-4" />
            <h3 className="text-lg font-semibold text-green-700">Our Farm</h3>
            <p className="text-sm text-gray-600">Sustainable farming practices</p>
          </div>
        </div>

        {/* Social Impact Callout */}
        <div className="mb-16 max-w-2xl mx-auto text-center bg-orange-50 rounded-xl p-6 shadow border border-orange-200 flex flex-col md:flex-row items-center gap-6">
          <img src={farmerImage} alt="Nareshwadi Youth" className="rounded-full w-24 h-24 object-cover shadow-md mx-auto md:mx-0" />
          <div>
            <h3 className="text-lg font-bold text-orange-700 mb-2">Every purchase supports a cause</h3>
            <p className="text-gray-700">These products are made from waste wood and hand painted by gifted youth and students, trained in carpentry and Warli art. Your purchase helps promote this rich heritage and supports our young artists become economically self-reliant.</p>
          </div>
        </div>

        {/* Testimonials Carousel */}
        <div className="mb-16 relative">
          <div className="absolute inset-0 opacity-5">
            <img src={fruitsImg} alt="Fresh Fruits Background" className="w-full h-full object-cover rounded-2xl" />
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-center mb-6">What People Say About Us</h3>
            <div className="flex overflow-x-auto gap-6 pb-4 px-2">
              <div className="min-w-[300px] bg-white/90 backdrop-blur-sm rounded-xl shadow p-6 flex-shrink-0">
                <p className="text-gray-700 mb-4">Impressed by both the institution and the children. Very humbling and inspiring. Thank you!</p>
                <div className="font-bold text-green-700">Eric Kalali</div>
              </div>
              <div className="min-w-[300px] bg-white/90 backdrop-blur-sm rounded-xl shadow p-6 flex-shrink-0">
                <p className="text-gray-700 mb-4">The learning centre truly focussed on growing the community, rather than imposing ideals. Every time I visit, I learn something new from the children.</p>
                <div className="font-bold text-green-700">Anonymous Visitor</div>
              </div>
              <div className="min-w-[300px] bg-white/90 backdrop-blur-sm rounded-xl shadow p-6 flex-shrink-0">
                <p className="text-gray-700 mb-4">The Vocational Training at Nareshwadi helped me to become a Warli artist and taught me to stand on my feet.</p>
                <div className="font-bold text-green-700">Jayesh Dhanap</div>
              </div>
              <div className="min-w-[300px] bg-white/90 backdrop-blur-sm rounded-xl shadow p-6 flex-shrink-0">
                <p className="text-gray-700 mb-4">I am very grateful for Nareshwadi and its teachers who supported me. Now I am a lecturer in Junior college.</p>
                <div className="font-bold text-green-700">Nilam Tumbada</div>
              </div>
            </div>
          </div>
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