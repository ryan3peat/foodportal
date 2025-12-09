import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { getDemoSession } from "@/lib/demoSession";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

const leadSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  companyName: z.string().min(2, "Company name required"),
  companyDomain: z.string().url("Valid domain required").optional().or(z.literal("").transform(() => undefined)),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export function LeadCaptureModal({ isOpen, onClose, onSubmitted }: LeadCaptureModalProps) {
  const { toast } = useToast();
  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      email: "",
      companyName: "",
      companyDomain: "",
    },
  });

  useEffect(() => {
    if (!isOpen) form.reset();
  }, [isOpen, form]);

  const onSubmit = async (data: LeadFormData) => {
    try {
      const session = getDemoSession();
      await apiRequest("/api/leads", "POST", {
        ...data,
        sessionId: session.sessionId,
        source: "demo_popup",
        timestamp: new Date().toISOString(),
      });

      toast({
        title: "Thanks! We'll be in touch soon.",
        description: "Your details were captured successfully.",
      });

      onSubmitted();
      onClose();
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <DialogContent className="max-w-lg gradient-border glass-card backdrop-blur-xl border-2 p-0 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-2xl font-semibold">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary via-ring to-accent flex items-center justify-center shadow-lg">
                    <Sparkles className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span>Ready to Use This for Real?</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                <p className="text-muted-foreground">
                  You've been exploring our portal. Get full access with:
                </p>

                <div className="space-y-2">
                  {[
                    "Unlimited suppliers",
                    "Real-time quotes",
                    "Document management",
                    "Custom workflows",
                  ].map((feature, idx) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </motion.div>
                  ))}
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} className="bg-background/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="you@company.com" type="email" {...field} className="bg-background/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Food Production Company" {...field} className="bg-background/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="companyDomain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Domain</FormLabel>
                          <FormControl>
                            <Input placeholder="https://company.com" {...field} className="bg-background/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center justify-between pt-4 gap-3">
                      <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
                        Continue Demo →
                      </Button>
                      <Button type="submit" className="flex-1 cta-gradient" data-testid="button-lead-submit">
                        Get Started - It's Free
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
