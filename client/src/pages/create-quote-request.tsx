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
  // Step 1: Product Details (Food Production)
  productName: z.string().min(1, "Product name is required"),
  materialName: z.string().min(1, "Product name is required"), // Kept for backward compatibility
  productCategory: z.enum(["dairy_raw", "dairy_processed", "finished_goods", "ingredients", "packaging", "other"]).optional(),
  productType: z.string().optional(),
  ingredients: z.string().optional(),
  allergenInformation: z.string().optional(),
  nutritionalRequirements: z.string().optional(),
  packagingRequirements: z.string().optional(),
  shelfLife: z.string().optional(),
  storageConditions: z.string().optional(),
  certificationsRequired: z.array(z.string()).default([]),
  foodSafetyStandards: z.array(z.string()).default([]),
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
  productName: z.string().optional(),
  materialName: z.string().optional(),
  productCategory: z.enum(["dairy_raw", "dairy_processed", "finished_goods", "ingredients", "packaging", "other"]).optional(),
  productType: z.string().optional(),
  ingredients: z.string().optional(),
  allergenInformation: z.string().optional(),
  nutritionalRequirements: z.string().optional(),
  packagingRequirements: z.string().optional(),
  shelfLife: z.string().optional(),
  storageConditions: z.string().optional(),
  certificationsRequired: z.array(z.string()).default([]),
  foodSafetyStandards: z.array(z.string()).default([]),
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
  { id: 1, name: "Product Details", icon: FlaskConical },
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
      productName: "",
      materialName: "",
      productCategory: undefined,
      productType: "",
      ingredients: "",
      allergenInformation: "",
      nutritionalRequirements: "",
      packagingRequirements: "",
      shelfLife: "",
      storageConditions: "",
      certificationsRequired: [],
      foodSafetyStandards: [],
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
      return apiRequest("/api/quote-requests", "POST", data);
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
      return apiRequest("/api/quote-requests/draft", "POST", data);
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
    console.log('=== FORM ONSUBMIT CALLED ===');
    console.log('Stack trace:', new Error().stack);
    console.log('Current step:', currentStep);
    console.log('Form data:', data);
    
    // CRITICAL: Only submit if we're on step 4 (Review & Submit)
    if (currentStep !== 4) {
      console.log('=== SUBMISSION BLOCKED - Not on step 4 ===');
      console.log('Attempted submission on step:', currentStep);
      return;
    }
    
    createMutation.mutate(data);
  };

  const saveDraft = () => {
    const currentData = form.getValues();
    const draftPayload = draftSchema.parse(currentData);
    saveDraftMutation.mutate(draftPayload);
  };

  const nextStep = async () => {
    console.log('=== NEXT STEP CALLED ===');
    console.log('Current step before validation:', currentStep);
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
        return ["productName", "materialName"];
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
          Request quotes from suppliers for food products
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
        <form 
          onSubmit={(e) => {
            e.preventDefault(); // Always prevent default form submission
            console.log('=== FORM SUBMIT EVENT TRIGGERED ===');
            console.log('Current step:', currentStep);
            
            // Only proceed if on step 4
            if (currentStep === 4) {
              form.handleSubmit(onSubmit)(e);
            } else {
              console.log('=== SUBMIT PREVENTED - Not on step 4 ===');
            }
          }}
          onKeyDown={(e) => {
            // Prevent Enter key from submitting form on steps 1-3
            if (e.key === 'Enter' && currentStep < 4) {
              e.preventDefault();
              console.log('=== ENTER KEY PRESSED - PREVENTED ===');
              console.log('Current step:', currentStep);
            }
          }}
          className="space-y-6"
        >
          {/* Step 1: Product Details */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>
                  Provide information about the food product you need
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="productName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Milk Powder, Cheese, Sauce" 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            // Also update materialName for backward compatibility
                            form.setValue("materialName", e.target.value);
                          }}
                          data-testid="input-product-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="productCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-product-category">
                              <SelectValue placeholder="Select product category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="dairy_raw">Raw Dairy</SelectItem>
                            <SelectItem value="dairy_processed">Processed Dairy</SelectItem>
                            <SelectItem value="finished_goods">Finished Goods</SelectItem>
                            <SelectItem value="ingredients">Ingredients</SelectItem>
                            <SelectItem value="packaging">Packaging</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="productType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Type</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Milk Powder, Cheddar Cheese, Tomato Sauce" 
                            {...field} 
                            data-testid="input-product-type"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="ingredients"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ingredients</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="List all ingredients, including any additives or preservatives..." 
                          {...field} 
                          rows={3}
                          data-testid="textarea-ingredients"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allergenInformation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allergen Information</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g., Contains: Milk, Soy. May contain traces of: Nuts, Eggs. Common allergens: Milk, Eggs, Soy, Nuts, Wheat, Fish, Shellfish" 
                          {...field} 
                          rows={3}
                          data-testid="textarea-allergen-information"
                        />
                      </FormControl>
                      <FormDescription>
                        List all allergens present in the product or potential cross-contamination risks
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nutritionalRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nutritional Requirements</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g., Per 100g: Calories 250, Protein 15g, Fat 10g, Carbs 25g. Or specify any specific nutritional targets or restrictions..." 
                          {...field} 
                          rows={3}
                          data-testid="textarea-nutritional-requirements"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="packagingRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Packaging Requirements</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g., Aseptic cartons, 1L volume. Or: Glass jars, 500g net weight. Include packaging type, size, materials, and any special requirements..." 
                          {...field} 
                          rows={3}
                          data-testid="textarea-packaging-requirements"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="shelfLife"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shelf Life</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., 12 months, 6 months unopened" 
                            {...field} 
                            data-testid="input-shelf-life"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="storageConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Storage Conditions</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="e.g., Store at 2-4°C, Keep frozen at -18°C, Store in dry place below 25°C" 
                            {...field} 
                            rows={3}
                            data-testid="textarea-storage-conditions"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="certificationsRequired"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Required Certifications</FormLabel>
                        <FormDescription>
                          Select all certifications required for this product
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          { value: "HACCP", label: "HACCP" },
                          { value: "ISO 22000", label: "ISO 22000" },
                          { value: "FSANZ", label: "FSANZ Compliance" },
                          { value: "Organic", label: "Organic" },
                          { value: "Halal", label: "Halal" },
                          { value: "Kosher", label: "Kosher" },
                          { value: "GFSI", label: "GFSI Certified" },
                          { value: "BRC", label: "BRC" },
                          { value: "SQF", label: "SQF" },
                        ].map((cert) => (
                          <FormField
                            key={cert.value}
                            control={form.control}
                            name="certificationsRequired"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={cert.value}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(cert.value)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, cert.value])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== cert.value
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {cert.label}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="foodSafetyStandards"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Food Safety Standards</FormLabel>
                        <FormDescription>
                          Select applicable food safety standards and compliance requirements
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { value: "FSANZ", label: "FSANZ (Food Standards Australia New Zealand)" },
                          { value: "Export Standards", label: "Export Standards" },
                          { value: "AQIS Compliance", label: "AQIS Compliance" },
                          { value: "EU Standards", label: "EU Standards" },
                        ].map((standard) => (
                          <FormField
                            key={standard.value}
                            control={form.control}
                            name="foodSafetyStandards"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={standard.value}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(standard.value)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, standard.value])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== standard.value
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {standard.label}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
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
                          placeholder="Any additional information about the product..."
                          className="resize-none"
                          rows={3}
                          {...field}
                          data-testid="textarea-product-notes"
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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-unit">
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="kg">Kilograms (kg)</SelectItem>
                            <SelectItem value="g">Grams (g)</SelectItem>
                            <SelectItem value="L">Litres (L)</SelectItem>
                            <SelectItem value="mL">Millilitres (mL)</SelectItem>
                            <SelectItem value="units">Units</SelectItem>
                            <SelectItem value="cartons">Cartons</SelectItem>
                            <SelectItem value="pallets">Pallets</SelectItem>
                            <SelectItem value="cases">Cases</SelectItem>
                          </SelectContent>
                        </Select>
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
                          placeholder="Quality requirements, testing standards, delivery terms, special handling instructions, batch traceability requirements..."
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
                          We will search for additional suppliers for this product
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
                    <h3 className="font-medium text-sm text-muted-foreground mb-3">Product Details</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Product:</span>
                        <p className="font-medium" data-testid="review-product-name">{form.watch("productName") || form.watch("materialName")}</p>
                      </div>
                      {form.watch("productCategory") && (
                        <div>
                          <span className="text-muted-foreground">Category:</span>
                          <p className="font-medium capitalize">{form.watch("productCategory")?.replace("_", " ")}</p>
                        </div>
                      )}
                      {form.watch("productType") && (
                        <div>
                          <span className="text-muted-foreground">Type:</span>
                          <p className="font-medium">{form.watch("productType")}</p>
                        </div>
                      )}
                      {form.watch("ingredients") && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Ingredients:</span>
                          <p className="font-medium whitespace-pre-wrap">{form.watch("ingredients")}</p>
                        </div>
                      )}
                      {form.watch("allergenInformation") && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Allergen Information:</span>
                          <p className="font-medium whitespace-pre-wrap">{form.watch("allergenInformation")}</p>
                        </div>
                      )}
                      {form.watch("nutritionalRequirements") && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Nutritional Requirements:</span>
                          <p className="font-medium whitespace-pre-wrap">{form.watch("nutritionalRequirements")}</p>
                        </div>
                      )}
                      {form.watch("packagingRequirements") && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Packaging Requirements:</span>
                          <p className="font-medium whitespace-pre-wrap">{form.watch("packagingRequirements")}</p>
                        </div>
                      )}
                      {form.watch("shelfLife") && (
                        <div>
                          <span className="text-muted-foreground">Shelf Life:</span>
                          <p className="font-medium">{form.watch("shelfLife")}</p>
                        </div>
                      )}
                      {form.watch("storageConditions") && (
                        <div>
                          <span className="text-muted-foreground">Storage Conditions:</span>
                          <p className="font-medium whitespace-pre-wrap">{form.watch("storageConditions")}</p>
                        </div>
                      )}
                      {form.watch("certificationsRequired") && form.watch("certificationsRequired").length > 0 && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Required Certifications:</span>
                          <p className="font-medium">{form.watch("certificationsRequired")?.join(", ")}</p>
                        </div>
                      )}
                      {form.watch("foodSafetyStandards") && form.watch("foodSafetyStandards").length > 0 && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Food Safety Standards:</span>
                          <p className="font-medium">{form.watch("foodSafetyStandards")?.join(", ")}</p>
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
