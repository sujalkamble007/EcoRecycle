import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Recycle, MapPin, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Already signed out; normalize UX
        setUser(null);
        toast.success("You're signed out");
        navigate('/auth');
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        // Ignore the common 'Auth session missing!' noise if session just expired
        if (typeof error.message === 'string' && error.message.toLowerCase().includes('auth session missing')) {
          setUser(null);
          toast.success("You're signed out");
          navigate('/auth');
          return;
        }
        throw error;
      }
      // Immediately clear local user state to reflect UI changes
      setUser(null);
      toast.success("Signed out successfully");
      navigate('/auth');
    } catch (err: any) {
      toast.error(err?.message || "Failed to sign out");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="py-4 border-b">
        <div className="container mx-auto px-4 flex justify-end">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                Recycle Your E-Waste
                <span className="bg-gradient-hero bg-clip-text text-transparent"> Responsibly</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Upload your e-waste, get it classified by AI, and schedule a convenient pickup. 
                Together, we can make a difference for our planet.
              </p>
              <div className="flex gap-4">
                <Button 
                  size="lg"
                  onClick={() => navigate("/classify")}
                  className="bg-gradient-hero shadow-glow hover:shadow-glow hover:scale-105 transition-all"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Start Recycling
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-hero opacity-20 rounded-3xl blur-3xl"></div>
              <img 
                src={heroImage} 
                alt="E-waste recycling" 
                className="relative rounded-3xl shadow-soft w-full animate-float"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Upload,
                title: "Upload E-Waste",
                description: "Take a photo or upload an image of your electronic waste item"
              },
              {
                icon: Recycle,
                title: "AI Classification",
                description: "Our AI instantly identifies the type of e-waste for proper handling"
              },
              {
                icon: MapPin,
                title: "Schedule Pickup",
                description: "Choose your location and preferred time for collection"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-card p-8 rounded-2xl shadow-soft hover:shadow-glow transition-all hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-gradient-hero rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-hero rounded-3xl p-12 text-center">
            <h2 className="text-4xl font-bold text-primary-foreground mb-8">
              Make an Impact Today
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { value: "50M+", label: "kg CO₂ Saved" },
                { value: "100K+", label: "Items Recycled" },
                { value: "5K+", label: "Happy Users" }
              ].map((stat, index) => (
                <div key={index}>
                  <div className="text-5xl font-bold text-primary-foreground mb-2">{stat.value}</div>
                  <div className="text-primary-foreground/80 text-lg">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
