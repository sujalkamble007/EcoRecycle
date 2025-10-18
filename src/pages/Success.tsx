import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Home, Leaf, Clock, Calendar, MapPin, Package } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Success = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pickupDetails } = location.state || {};

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="shadow-glow border-primary/20">
          <CardContent className="p-12 text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-hero rounded-full flex items-center justify-center mx-auto animate-scale-in">
              <CheckCircle className="h-16 w-16 text-primary-foreground" />
            </div>
            
            <h1 className="text-4xl font-bold">Pickup Scheduled!</h1>
            
            <p className="text-xl text-muted-foreground">
              Thank you for choosing to recycle responsibly. 
              We've received your request and will send a confirmation email shortly.
            </p>

            {pickupDetails && (
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 space-y-4 border border-primary/20">
                <h3 className="font-semibold text-lg mb-4">Pickup Details</h3>
                
                <div className="grid gap-3 text-left">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Pickup Time</p>
                      <p className="font-semibold text-lg text-primary">
                        {new Date(pickupDetails.estimatedPickupTime).toLocaleString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Scheduled Date & Time</p>
                      <p className="font-medium">
                        {new Date(`${pickupDetails.pickupDate}T${pickupDetails.pickupTime}`).toLocaleString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Item Category</p>
                      <p className="font-medium">{pickupDetails.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Pickup Address</p>
                      <p className="font-medium">{pickupDetails.address}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-primary/20">
                  <p className="text-sm text-muted-foreground text-center">
                    Pickup ID: <span className="font-mono font-semibold">{pickupDetails.id?.substring(0, 8)}</span>
                  </p>
                </div>
              </div>
            )}

            <div className="bg-muted/50 rounded-2xl p-6">
              <div className="flex items-start gap-4 text-left">
                <Leaf className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Environmental Impact</h3>
                  <p className="text-sm text-muted-foreground">
                    By recycling your e-waste, you're helping reduce harmful emissions 
                    and conserving valuable resources. Every item counts!
                  </p>
                </div>
              </div>
            </div>

            {pickupDetails && (
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                <p className="text-sm text-center">
                  <span className="font-semibold">What's Next?</span><br />
                  Our team will arrive within the estimated time window. 
                  You'll receive updates via email at <span className="font-medium">{pickupDetails.name}</span>
                </p>
              </div>
            )}

            <div className="flex gap-4 justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => navigate('/classify')}
              >
                Recycle More Items
              </Button>
              <Button
                onClick={() => navigate('/')}
                className="bg-gradient-hero"
              >
                <Home className="mr-2 h-5 w-5" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Success;
