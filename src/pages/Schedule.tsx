import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CategoryIcon from "@/components/CategoryIcon";
import { z } from "zod";

const pickupRequestSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().min(10, "Phone must be at least 10 digits").max(20, "Phone must be less than 20 digits").regex(/^[0-9+\-\s()]+$/, "Phone must contain only numbers and common separators"),
  pickupDate: z.string().refine((date) => new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0)), "Pickup date must be today or in the future"),
  pickupTime: z.string().min(1, "Time is required"),
  address: z.string().trim().min(5, "Address must be at least 5 characters").max(500, "Address must be less than 500 characters"),
  category: z.string().min(1, "Category is required"),
  confidence: z.number().min(0).max(1),
});

const Schedule = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { category, confidence, imageUrl } = location.state || {};

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pickupDate: '',
    pickupTime: '',
    address: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error("Please sign in to schedule a pickup");
        navigate('/auth');
        return;
      }
    });

    if (!category) {
      navigate('/classify');
    }
  }, [category, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.address) {
      toast.error("Please enter a pickup location");
      return;
    }

    setIsSubmitting(true);
    try {
      // Get current user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw sessionError;
      }
      
      if (!session?.user) {
        toast.error("Please sign in to schedule a pickup");
        navigate('/auth');
        return;
      }

      console.log('User authenticated:', session.user.id);

      // Validate form data
      const dataToValidate = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        pickupDate: formData.pickupDate,
        pickupTime: formData.pickupTime,
        address: formData.address,
        category,
        confidence,
      };
      
      console.log('Data to validate:', dataToValidate);

      const validationResult = pickupRequestSchema.safeParse(dataToValidate);

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast.error(firstError.message);
        return;
      }

      const { error, data } = await supabase.from('pickup_requests').insert({
        user_id: session.user.id,
        name: validationResult.data.name,
        email: validationResult.data.email,
        phone: validationResult.data.phone,
        category: validationResult.data.category,
        latitude: 0, // Default coordinate since we're using text address
        longitude: 0, // Default coordinate since we're using text address
        address: validationResult.data.address,
        pickup_date: validationResult.data.pickupDate,
        pickup_time: validationResult.data.pickupTime,
        confidence_score: validationResult.data.confidence,
        image_url: imageUrl,
      }).select().single();

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }

      // Calculate estimated pickup time (add 2-4 hours to scheduled time)
      const scheduledDateTime = new Date(`${validationResult.data.pickupDate}T${validationResult.data.pickupTime}`);
      const estimatedMinutes = 120 + Math.floor(Math.random() * 120); // 2-4 hours
      const estimatedPickupTime = new Date(scheduledDateTime.getTime() + estimatedMinutes * 60000);

      toast.success("Pickup scheduled successfully!");
      navigate('/success', {
        state: {
          pickupDetails: {
            id: data?.id,
            name: validationResult.data.name,
            category: validationResult.data.category,
            address: validationResult.data.address,
            pickupDate: validationResult.data.pickupDate,
            pickupTime: validationResult.data.pickupTime,
            estimatedPickupTime: estimatedPickupTime.toISOString(),
          }
        }
      });
    } catch (error) {
      console.error('Error scheduling pickup:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      toast.error(`Failed to schedule pickup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Schedule Pickup</h1>
          <p className="text-xl text-muted-foreground">
            Choose your preferred date, time, and location
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-soft">
            <CardContent className="p-6 text-center">
              <CategoryIcon category={category} />
              <p className="font-semibold mt-2">{category}</p>
              <p className="text-sm text-muted-foreground">
                {Math.round(confidence * 100)}% confidence
              </p>
            </CardContent>
          </Card>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Pickup Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Preferred Date</Label>
                  <Input
                    id="date"
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.pickupDate}
                    onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Preferred Time</Label>
                  <Input
                    id="time"
                    type="time"
                    required
                    value={formData.pickupTime}
                    onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Pickup Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Enter your pickup address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-hero"
            size="lg"
          >
            {isSubmitting ? 'Scheduling...' : 'Confirm Pickup'}
            <CheckCircle className="ml-2 h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Schedule;
