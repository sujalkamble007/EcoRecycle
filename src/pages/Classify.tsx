import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Loader2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CategoryIcon from "@/components/CategoryIcon";

const Classify = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error("Please sign in to classify e-waste");
        navigate('/auth');
      }
    });
  }, [navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a JPEG, PNG, or WebP image");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const classifyImage = async () => {
    if (!selectedImage) return;

    setIsClassifying(true);
    try {
      // Ensure user is authenticated just before invoking the function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to classify e-waste");
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.functions.invoke('classify-ewaste', {
        body: { image: selectedImage },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setResult(data);
      toast.success("E-waste classified successfully!");
    } catch (error) {
      console.error('Classification error:', error);
      const message = error instanceof Error ? error.message : String(error);
      if (message.toLowerCase().includes('auth session missing')) {
        toast.error("Session expired. Please sign in again.");
        navigate('/auth');
      } else {
        toast.error("Failed to classify e-waste. Please try again.");
      }
    } finally {
      setIsClassifying(false);
    }
  };

  const schedulePickup = () => {
    if (result) {
      navigate('/schedule', { 
        state: { 
          category: result.category,
          confidence: result.confidence,
          imageUrl: selectedImage 
        } 
      });
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Classify Your E-Waste</h1>
          <p className="text-xl text-muted-foreground">
            Upload an image and let our AI identify the type of electronic waste
          </p>
        </div>

        <Card className="shadow-soft">
          <CardContent className="p-8">
            {!selectedImage ? (
              <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center hover:border-primary transition-colors">
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Click to upload image</p>
                  <p className="text-sm text-muted-foreground">
                    Supports JPG, PNG, WEBP
                  </p>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative rounded-2xl overflow-hidden">
                  <img 
                    src={selectedImage} 
                    alt="E-waste to classify"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                </div>

                {!result && (
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedImage(null);
                        setResult(null);
                      }}
                      className="flex-1"
                    >
                      Choose Different Image
                    </Button>
                    <Button
                      onClick={classifyImage}
                      disabled={isClassifying}
                      className="flex-1 bg-gradient-hero"
                    >
                      {isClassifying ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Classifying...
                        </>
                      ) : (
                        'Classify E-Waste'
                      )}
                    </Button>
                  </div>
                )}

                {result && (
                  <div className="bg-muted/50 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <CategoryIcon category={result.category} />
                      <div>
                        <h3 className="text-2xl font-bold">{result.category}</h3>
                        <p className="text-muted-foreground">
                          Confidence: {Math.round(result.confidence * 100)}%
                        </p>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{result.description}</p>
                    <Button 
                      onClick={schedulePickup}
                      className="w-full bg-gradient-hero"
                      size="lg"
                    >
                      Schedule Pickup
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Classify;
