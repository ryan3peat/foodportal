import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight, FlaskConical, FileText, Users, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Supplier } from "@shared/schema";

const quoteRequestSchema = z.object({
  // Step 1: Material Details
  materialName: z.string().min(1, "Material name is required"),
  casNumber: z.string().optional(),
  femaNumber: z.string().optional(),
  materialForm: z.enum(["liquid", "powder", "paste"]).optional(),
  materialGrade: z.string().optional(),
  materialOrigin: z.string().optional(),
  packagingRequirements: z.string().optional(),
  materialNotes: z.string().optional(),
  
  // Step 2: Specifications
  quantityNeeded: z.string().min(1, "Quantity is required"),
  unitOfMeasure: z.string().min(1, "Unit of measure is required"),
  additionalSpecifications: z.string().optional(),
  submitByDate: z.date({
    required_error: "Submit by date is required",
  }),
  
  // Step 3: Supplier Selection
  supplierIds: z.array(z.string()),
  findNewSuppliers: z.boolean().default(false),
}).refine((data) => {
  return data.supplierIds.length > 0 || data.findNewSuppliers;
}, {
  message: "Select at least one supplier or enable 'Find new suppliers'",
  path: ["supplierIds"],
});

const draftSchema = z.object({
  materialName: z.string().optional(),
  casNumber: z.string().optional(),
  femaNumber: z.string().optional(),
  materialForm: z.enum(["liquid", "powder", "paste"]).optional(),
  materialGrade: z.string().optional(),
  materialOrigin: z.string().optional(),
  packagingRequirements: z.string().optional(),
  materialNotes: z.string().optional(),
  quantityNeeded: z.string().optional(),
  unitOfMeasure: z.string().optional(),
  additionalSpecifications: z.string().optional(),
  submitByDate: z.date().optional(),
  supplierIds: z.array(z.string()),
  findNewSuppliers: z.boolean().default(false),
});

type QuoteRequestFormData = z.infer<typeof quoteRequestSchema>;

const steps = [
  { id: 1, name: "Material Details", icon: FlaskConical },
  { id: 2, name: "Specifications", icon: FileText },
  { id: 3, name: "Supplier Selection", icon: Users },
  { id: 4, name: "Review & Submit", icon: CheckCircle2 },
];

export default function CreateQuoteRequest() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();

  const form = useForm<QuoteRequestFormData>({
    resolver: zodResolver(quoteRequestSchema),
    defaultValues: {
      materialName: "",
      casNumber: "",
      femaNumber: "",
      materialGrade: "",
      materialOrigin: "",
      packagingRequirements: "",
      materialNotes: "",
      quantityNeeded: "",
      unitOfMeasure: "kg",
      additionalSpecifications: "",
      supplierIds: [],
      findNewSuppliers: false,
    },
  });

  const { data: suppliers = [], isLoading: loadingSuppliers } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: QuoteRequestFormData) => {
      return apiRequest("POST", "/api/quote-requests", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quote-requests"] });
      toast({
        title: "Success",
        description: "Quote request created successfully",
      });
      setLocation("/quote-requests");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create quote request",
        variant: "destructive",
      });
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: async (data: Partial<QuoteRequestFormData>) => {
      return apiRequest("POST", "/api/quote-requests/draft", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quote-requests"] });
      toast({
        title: "Draft saved",
        description: "Your quote request has been saved as a draft",
      });
      setLocation("/quote-requests");
    },
  });

  const onSubmit = (data: QuoteRequestFormData) => {
    createMutation.mutate(data);
  };

  const saveDraft = () => {
    const currentData = form.getValues();
    const draftPayload = draftSchema.parse(currentData);
    saveDraftMutation.mutate(draftPayload);
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    
    if (currentStep === 3) {
      const supplierIds = form.getValues("supplierIds");
      const findNewSuppliers = form.getValues("findNewSuppliers");
      
      if (supplierIds.length === 0 && !findNewSuppliers) {
        form.setError("supplierIds", {
          type: "manual",
          message: "Select at least one supplier or enable 'Find new suppliers'"
        });
        return;
      }
      form.clearErrors("supplierIds");
    } else if (fieldsToValidate.length > 0) {
      const isValid = await form.trigger(fieldsToValidate as any);
      if (!isValid) return;
    }
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getFieldsForStep = (step: number): (keyof QuoteRequestFormData)[] => {
    switch (step) {
      case 1:
        return ["materialName"];
      case 2:
        return ["quantityNeeded", "unitOfMeasure", "submitByDate"];
      case 3:
        return [];
      default:
        return [];
    }
  };

  const activeSuppliers = suppliers.filter(s => s.active);
  const selectedSuppliers = activeSuppliers.filter(s => 
    form.watch("supplierIds").includes(s.id)
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Create Quote Request</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Request quotes from suppliers for raw materials
        </p>
      </div>

      {/* Step Indicator */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center h-10 w-10 rounded-full border-2 transition-colors ${
                      currentStep === step.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : currentStep > step.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground"
                    }`}
                    data-testid={`step-indicator-${step.id}`}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className={`text-xs mt-2 font-medium ${
                    currentStep === step.id ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.id ? "bg-primary" : "bg-border"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Material Details */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Material Details</CardTitle>
                <CardDescription>
                  Provide information about the raw material you need
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="materialName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Vanillin" 
                          {...field} 
                          data-testid="input-material-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="casNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CAS Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., 121-33-5" 
                            {...field} 
                            data-testid="input-cas-number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="femaNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>FEMA Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., 3107" 
                            {...field} 
                            data-testid="input-fema-number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="materialForm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Form</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-material-form">
                              <SelectValue placeholder="Select form" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="liquid">Liquid</SelectItem>
                            <SelectItem value="powder">Powder</SelectItem>
                            <SelectItem value="paste">Paste</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="materialGrade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Food Grade" 
                            {...field} 
                            data-testid="input-material-grade"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="materialOrigin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Origin</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Natural, Synthetic" 
                            {...field} 
                            data-testid="input-material-origin"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="packagingRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Packaging Requirements</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., 25kg drums, nitrogen flushed" 
                          {...field} 
                          data-testid="input-packaging"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="materialNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional information about the material..."
                          className="resize-none"
                          rows={3}
                          {...field}
                          data-testid="textarea-material-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 2: Specifications */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
                <CardDescription>
                  Specify quantity and requirements for this quote request
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantityNeeded"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity Needed *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 500" 
                            {...field} 
                            data-testid="input-quantity"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unitOfMeasure"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit of Measure *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., kg, L, g" 
                            {...field} 
                            data-testid="input-unit"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="submitByDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Submit Quotes By *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                              data-testid="button-submit-by-date"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Deadline for suppliers to submit their quotes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalSpecifications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Specifications</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Purity requirements, testing standards, delivery terms..."
                          className="resize-none"
                          rows={4}
                          {...field}
                          data-testid="textarea-specifications"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 3: Supplier Selection */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Supplier Selection</CardTitle>
                <CardDescription>
                  Select suppliers to receive this quote request
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingSuppliers ? (
                  <div className="text-center py-8">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Loading suppliers...</p>
                  </div>
                ) : activeSuppliers.length === 0 ? (
                  <div className="text-center py-8 bg-muted/50 rounded-md">
                    <p className="text-muted-foreground">No active suppliers available</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Add suppliers in the Suppliers page first
                    </p>
                  </div>
                ) : (
                  <FormField
                    control={form.control}
                    name="supplierIds"
                    render={() => (
                      <FormItem>
                        <div className="space-y-2">
                          {activeSuppliers.map((supplier) => (
                            <FormField
                              key={supplier.id}
                              control={form.control}
                              name="supplierIds"
                              render={({ field }) => (
                                <FormItem
                                  key={supplier.id}
                                  className="flex items-start space-x-3 space-y-0 p-4 border border-border rounded-md hover-elevate"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(supplier.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, supplier.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== supplier.id
                                              )
                                            );
                                      }}
                                      data-testid={`checkbox-supplier-${supplier.id}`}
                                    />
                                  </FormControl>
                                  <div className="flex-1 space-y-1">
                                    <FormLabel className="text-sm font-medium cursor-pointer">
                                      {supplier.supplierName}
                                    </FormLabel>
                                    <p className="text-xs text-muted-foreground">
                                      {supplier.contactPerson} • {supplier.email}
                                    </p>
                                    {supplier.location && (
                                      <p className="text-xs text-muted-foreground">
                                        {supplier.location}
                                      </p>
                                    )}
                                  </div>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="findNewSuppliers"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-3 space-y-0 p-4 border border-border rounded-md">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-find-new-suppliers"
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel className="cursor-pointer">
                          Help find new suppliers
                        </FormLabel>
                        <FormDescription>
                          Essential Flavours will search for additional suppliers for this material
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Review & Submit</CardTitle>
                <CardDescription>
                  Review your quote request before submitting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-3">Material Details</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Material:</span>
                        <p className="font-medium" data-testid="review-material-name">{form.watch("materialName")}</p>
                      </div>
                      {form.watch("casNumber") && (
                        <div>
                          <span className="text-muted-foreground">CAS:</span>
                          <p className="font-medium">{form.watch("casNumber")}</p>
                        </div>
                      )}
                      {form.watch("femaNumber") && (
                        <div>
                          <span className="text-muted-foreground">FEMA:</span>
                          <p className="font-medium">{form.watch("femaNumber")}</p>
                        </div>
                      )}
                      {form.watch("materialForm") && (
                        <div>
                          <span className="text-muted-foreground">Form:</span>
                          <p className="font-medium capitalize">{form.watch("materialForm")}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <h3 className="font-medium text-sm text-muted-foreground mb-3">Specifications</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Quantity:</span>
                        <p className="font-medium" data-testid="review-quantity">
                          {form.watch("quantityNeeded")} {form.watch("unitOfMeasure")}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Submit By:</span>
                        <p className="font-medium">
                          {form.watch("submitByDate") && format(form.watch("submitByDate"), "PPP")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <h3 className="font-medium text-sm text-muted-foreground mb-3">
                      Selected Suppliers ({selectedSuppliers.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedSuppliers.map((supplier) => (
                        <div
                          key={supplier.id}
                          className="text-sm p-3 bg-muted/50 rounded-md"
                          data-testid={`review-supplier-${supplier.id}`}
                        >
                          <p className="font-medium">{supplier.supplierName}</p>
                          <p className="text-muted-foreground text-xs">{supplier.email}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={previousStep}
                      data-testid="button-previous"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={saveDraft}
                    disabled={saveDraftMutation.isPending}
                    data-testid="button-save-draft"
                  >
                    {saveDraftMutation.isPending ? "Saving..." : "Save Draft"}
                  </Button>

                  {currentStep < 4 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      data-testid="button-next"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                      data-testid="button-submit-request"
                    >
                      {createMutation.isPending ? "Submitting..." : "Submit Request"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
