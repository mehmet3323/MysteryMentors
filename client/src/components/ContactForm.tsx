import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export function ContactForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    company: "", // honeypot (bots usually fill this)
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (formData.company.trim().length > 0) {
        // Pretend success for bots.
        toast({
          title: "Teşekkürler!",
          description: "Mesajınız alındı. En kısa sürede size dönüş yapacağız.",
        });
        setFormData({ name: "", email: "", subject: "", message: "", company: "" });
        return;
      }

      const res = await apiRequest("POST", "/api/contact", {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });

      const body = (await res.json()) as { success?: boolean; message?: string };
      toast({
        title: body?.success ? "Gönderildi" : "Teşekkürler!",
        description: body?.message || "Mesajınız alındı. En kısa sürede size dönüş yapacağız.",
      });
      
      // Formu sıfırla
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        company: "",
      });
    } catch (error) {
      toast({
        title: "Hata!",
        description: "Mesajınız gönderilirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="hover-lift">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="company">Company</label>
            <input
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Adınız
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Adınızı girin"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email adresinizi girin"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">
              Konu
            </label>
            <Input
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Mesajınızın konusu"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Mesajınız
            </label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Mesajınızı buraya yazın..."
              rows={4}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? "Gönderiliyor..." : "Gönder"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 