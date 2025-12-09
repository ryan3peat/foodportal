import { v4 as uuidv4 } from "uuid";
import type {
  Supplier,
  QuoteRequest,
  SupplierQuote,
  Notification,
  DocumentRequest,
  SupplierDocument,
  DemoLead,
  SupplierApplication,
} from "@shared/schema";

export type DemoRole = "procurement" | "supplier";

export interface DemoSession {
  sessionId: string;
  userId: string;
  role: DemoRole;
  currentSupplierId?: string;
  createdAt: number;
  expiresAt: number;
  data: {
    suppliers: Supplier[];
    quoteRequests: Array<QuoteRequest & { invitedSupplierIds: string[] }>;
    supplierQuotes: SupplierQuote[];
    documentRequests: DocumentRequest[];
    documents: SupplierDocument[];
    notifications: Notification[];
    leads: DemoLead[];
    supplierApplications: SupplierApplication[];
  };
}

const SESSION_KEY = "demo_session_v2";

function now() {
  return Date.now();
}

function daysFromNow(days: number) {
  return now() + days * 24 * 60 * 60 * 1000;
}

function buildSuppliers(): Supplier[] {
  return [
    {
      id: "sup-demo-1",
      supplierName: "Australian Dairy Ingredients",
      contactPerson: "Sarah Mitchell",
      email: "sarah@ausdairyingredients.com.au",
      email2: "sales@ausdairyingredients.com.au",
      phone: "+61 3 9000 1234",
      location: "Melbourne, VIC, Australia",
      moq: "500 kg",
      leadTimes: "2-3 weeks",
      paymentTerms: "Net 30",
      certifications: ["HACCP", "ISO 22000", "FSANZ", "Halal"],
      active: true,
      createdBy: "demo-admin-user",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "sup-demo-2",
      supplierName: "Premium Foods Manufacturing",
      contactPerson: "James Thompson",
      email: "james@premiumfoods.com.au",
      email2: null,
      phone: "+61 2 9876 5432",
      location: "Sydney, NSW, Australia",
      moq: "200 kg",
      leadTimes: "1-2 weeks",
      paymentTerms: "Net 30",
      certifications: ["HACCP", "ISO 22000", "Organic", "Kosher"],
      active: true,
      createdBy: "demo-admin-user",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "sup-demo-3",
      supplierName: "Southern Dairy Co-operative",
      contactPerson: "Emma Williams",
      email: "emma@southerndairy.coop",
      email2: null,
      phone: "+61 7 3000 5678",
      location: "Brisbane, QLD, Australia",
      moq: "1000 L",
      leadTimes: "1 week",
      paymentTerms: "Net 21",
      certifications: ["HACCP", "FSANZ", "Organic"],
      active: true,
      createdBy: "demo-admin-user",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "sup-demo-4",
      supplierName: "Pacific Food Ingredients",
      contactPerson: "Michael Chen",
      email: "michael@pacificfoodingredients.com.au",
      email2: null,
      phone: "+61 8 9000 9876",
      location: "Perth, WA, Australia",
      moq: "250 kg",
      leadTimes: "2-4 weeks",
      paymentTerms: "Net 30",
      certifications: ["HACCP", "ISO 22000", "BRC", "SQF"],
      active: true,
      createdBy: "demo-admin-user",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}

function buildQuoteRequests(): Array<QuoteRequest & { invitedSupplierIds: string[] }> {
  return [
    {
      id: "qr-demo-1",
      requestNumber: "RFQ-2025-001",
      productName: "Whole Milk Powder",
      materialName: "Whole Milk Powder",
      productCategory: "dairy_processed",
      productType: "Spray-dried whole milk powder",
      ingredients: "Whole milk, Vitamin D3",
      allergenInformation: "Contains: Milk. May contain traces of: Soy (from processing equipment)",
      nutritionalRequirements: "Per 100g: Energy 2100kJ, Protein 26g, Fat 26g, Carbs 38g, Calcium 900mg",
      packagingRequirements: "25kg food-grade bags, inner liner, outer woven polypropylene",
      shelfLife: "18 months from production date",
      storageConditions: "Store in cool, dry place below 25°C. Protect from light and moisture",
      certificationsRequired: ["HACCP", "ISO 22000", "FSANZ", "Halal"],
      foodSafetyStandards: ["FSANZ", "Export Standards"],
      materialNotes: null,
      quantityNeeded: 5000 as any,
      unitOfMeasure: "kg",
      specifications: {},
      additionalSpecifications: "Minimum protein content 26%. Must meet export standards for China market. Batch traceability required.",
      submitByDate: new Date(daysFromNow(10)),
      status: "active",
      findNewSuppliers: false,
      createdBy: "demo-admin-user",
      createdAt: new Date(daysFromNow(-7)),
      updatedAt: new Date(daysFromNow(-1)),
      invitedSupplierIds: ["sup-demo-1", "sup-demo-2", "sup-demo-3"],
    },
    {
      id: "qr-demo-2",
      requestNumber: "RFQ-2025-002",
      productName: "Cheddar Cheese",
      materialName: "Cheddar Cheese",
      productCategory: "dairy_processed",
      productType: "Matured Cheddar Cheese",
      ingredients: "Pasteurised milk, salt, starter culture, rennet",
      allergenInformation: "Contains: Milk",
      nutritionalRequirements: "Per 100g: Energy 1700kJ, Protein 25g, Fat 33g, Carbs <1g, Sodium 650mg",
      packagingRequirements: "20kg blocks, vacuum-sealed, food-grade plastic wrap, outer cartons",
      shelfLife: "12 months unopened, 6 months opened",
      storageConditions: "Store at 2-4°C. Keep refrigerated",
      certificationsRequired: ["HACCP", "ISO 22000", "FSANZ"],
      foodSafetyStandards: ["FSANZ"],
      materialNotes: null,
      quantityNeeded: 2000 as any,
      unitOfMeasure: "kg",
      specifications: {},
      additionalSpecifications: "Maturation period 12-18 months. Sharp cheddar flavor profile. Suitable for retail and foodservice.",
      submitByDate: new Date(daysFromNow(5)),
      status: "active",
      findNewSuppliers: true,
      createdBy: "demo-admin-user",
      createdAt: new Date(daysFromNow(-3)),
      updatedAt: new Date(),
      invitedSupplierIds: ["sup-demo-1", "sup-demo-4"],
    },
    {
      id: "qr-demo-3",
      requestNumber: "RFQ-2025-003",
      productName: "Tomato Sauce",
      materialName: "Tomato Sauce",
      productCategory: "finished_goods",
      productType: "Premium Tomato Sauce",
      ingredients: "Tomatoes (85%), sugar, vinegar, salt, spices (onion, garlic, cloves), natural flavourings",
      allergenInformation: "May contain traces of: Celery, Mustard",
      nutritionalRequirements: "Per 100g: Energy 450kJ, Protein 1.5g, Fat <0.5g, Carbs 25g, Sodium 800mg",
      packagingRequirements: "Glass bottles, 500g net weight, screw cap, tamper-evident seal",
      shelfLife: "24 months unopened",
      storageConditions: "Store in cool, dry place. Refrigerate after opening",
      certificationsRequired: ["HACCP", "ISO 22000", "FSANZ", "Organic"],
      foodSafetyStandards: ["FSANZ"],
      materialNotes: null,
      quantityNeeded: 5000 as any,
      unitOfMeasure: "units",
      specifications: {},
      additionalSpecifications: "Organic certified preferred. BPA-free packaging. Product must meet FSANZ Food Standards Code.",
      submitByDate: new Date(daysFromNow(2)),
      status: "draft",
      findNewSuppliers: false,
      createdBy: "demo-admin-user",
      createdAt: new Date(daysFromNow(-1)),
      updatedAt: new Date(),
      invitedSupplierIds: ["sup-demo-2", "sup-demo-4"],
    },
    {
      id: "qr-demo-4",
      requestNumber: "RFQ-2025-004",
      productName: "Fresh A2 Milk",
      materialName: "Fresh A2 Milk",
      productCategory: "dairy_raw",
      productType: "Fresh A2 Beta-Casein Milk",
      ingredients: "Fresh A2 milk, Vitamin D",
      allergenInformation: "Contains: Milk",
      nutritionalRequirements: "Per 100mL: Energy 280kJ, Protein 3.4g, Fat 3.6g, Carbs 4.8g, Calcium 120mg",
      packagingRequirements: "Aseptic cartons, 1L volume, UHT treated",
      shelfLife: "9 months unopened, 7 days after opening",
      storageConditions: "Store at ambient temperature before opening. Refrigerate after opening (2-4°C)",
      certificationsRequired: ["HACCP", "FSANZ", "Halal"],
      foodSafetyStandards: ["FSANZ", "Export Standards"],
      materialNotes: "A2 beta-casein protein only. No A1 protein",
      quantityNeeded: 10000 as any,
      unitOfMeasure: "L",
      specifications: {},
      additionalSpecifications: "Must be A2 certified. Suitable for export to Asian markets. UHT processing required. Batch traceability essential.",
      submitByDate: new Date(daysFromNow(14)),
      status: "active",
      findNewSuppliers: false,
      createdBy: "demo-admin-user",
      createdAt: new Date(daysFromNow(-5)),
      updatedAt: new Date(daysFromNow(-2)),
      invitedSupplierIds: ["sup-demo-1", "sup-demo-3"],
    },
    {
      id: "qr-demo-5",
      requestNumber: "RFQ-2025-005",
      productName: "Vanilla Extract",
      materialName: "Vanilla Extract",
      productCategory: "ingredients",
      productType: "Pure Vanilla Extract",
      ingredients: "Vanilla beans (35%), alcohol, water",
      allergenInformation: "Contains: Alcohol. No major allergens",
      nutritionalRequirements: "Per 100mL: Energy 1050kJ, Alcohol 35%",
      packagingRequirements: "Glass bottles, 250mL, amber glass for light protection, tamper-evident cap",
      shelfLife: "36 months",
      storageConditions: "Store in cool, dry place away from direct sunlight. Room temperature",
      certificationsRequired: ["HACCP", "ISO 22000", "FSANZ", "Organic"],
      foodSafetyStandards: ["FSANZ"],
      materialNotes: "Pure vanilla extract, no artificial flavors",
      quantityNeeded: 500 as any,
      unitOfMeasure: "L",
      specifications: {},
      additionalSpecifications: "Minimum 35% vanilla bean extractives. Organic certified preferred. Suitable for premium food applications.",
      submitByDate: new Date(daysFromNow(12)),
      status: "active",
      findNewSuppliers: true,
      createdBy: "demo-admin-user",
      createdAt: new Date(daysFromNow(-4)),
      updatedAt: new Date(daysFromNow(-1)),
      invitedSupplierIds: ["sup-demo-2", "sup-demo-4"],
    },
    {
      id: "qr-demo-6",
      requestNumber: "RFQ-2025-006",
      productName: "Sweetened Condensed Milk",
      materialName: "Sweetened Condensed Milk",
      productCategory: "dairy_processed",
      productType: "Sweetened Condensed Milk",
      ingredients: "Milk, sugar, stabiliser (sodium phosphate)",
      allergenInformation: "Contains: Milk",
      nutritionalRequirements: "Per 100g: Energy 1350kJ, Protein 8g, Fat 8g, Carbs 54g, Calcium 250mg",
      packagingRequirements: "Tins, 397g net weight, easy-open pull tab, food-grade lining",
      shelfLife: "24 months",
      storageConditions: "Store in cool, dry place. Refrigerate after opening",
      certificationsRequired: ["HACCP", "ISO 22000", "FSANZ"],
      foodSafetyStandards: ["FSANZ"],
      materialNotes: null,
      quantityNeeded: 2000 as any,
      unitOfMeasure: "units",
      specifications: {},
      additionalSpecifications: "Standard 397g tins. Must meet Australian food standards. Suitable for baking and confectionery applications.",
      submitByDate: new Date(daysFromNow(8)),
      status: "active",
      findNewSuppliers: false,
      createdBy: "demo-admin-user",
      createdAt: new Date(daysFromNow(-2)),
      updatedAt: new Date(),
      invitedSupplierIds: ["sup-demo-1", "sup-demo-3"],
    },
    {
      id: "qr-demo-7",
      requestNumber: "RFQ-2025-007",
      productName: "Organic Superfood Blend",
      materialName: "Organic Superfood Blend",
      productCategory: "finished_goods",
      productType: "Organic Superfood Powder Blend",
      ingredients: "Organic spirulina, organic chlorella, organic wheatgrass, organic barley grass, organic maca powder",
      allergenInformation: "Contains: Gluten (from wheatgrass, barley grass). May contain traces of: Nuts, Soy",
      nutritionalRequirements: "Per 20g serving: Energy 300kJ, Protein 10g, Fat 1g, Carbs 4g, Iron 15mg",
      packagingRequirements: "Food-grade pouches, 200g net weight, resealable zip lock, outer carton",
      shelfLife: "18 months",
      storageConditions: "Store in cool, dry place below 25°C. Keep sealed to maintain freshness",
      certificationsRequired: ["HACCP", "ISO 22000", "FSANZ", "Organic"],
      foodSafetyStandards: ["FSANZ"],
      materialNotes: "Organic certified blend for health food market",
      quantityNeeded: 1000 as any,
      unitOfMeasure: "units",
      specifications: {},
      additionalSpecifications: "Organic certification required (NASAA or ACO). Suitable for direct-to-consumer sales. Cold-pressed ingredients preferred.",
      submitByDate: new Date(daysFromNow(21)),
      status: "active",
      findNewSuppliers: true,
      createdBy: "demo-admin-user",
      createdAt: new Date(daysFromNow(-6)),
      updatedAt: new Date(daysFromNow(-3)),
      invitedSupplierIds: ["sup-demo-2", "sup-demo-4"],
    },
  ];
}

function buildSupplierQuotes(): SupplierQuote[] {
  return [
    {
      id: "quote-demo-1",
      requestId: "qr-demo-1",
      supplierId: "sup-demo-1",
      pricePerUnit: 6.50 as any,
      currency: "AUD",
      moq: "2000 kg",
      leadTime: "2-3 weeks",
      validityDate: new Date(daysFromNow(30)),
      paymentTerms: "Net 30",
      additionalNotes: "Includes COA and batch traceability documentation. Can provide Halal certification.",
      attachments: [],
      packSize: "25 kg bags",
      shippingTerms: "FOB Melbourne",
      freightCost: 450 as any,
      shelfLife: "18 months from production date",
      storageRequirements: "Store in cool, dry place below 25°C. Protect from moisture and light",
      dangerousGoodsHandling: null,
      preliminaryApprovalStatus: "pending_documentation",
      preliminaryApprovedAt: null,
      preliminaryApprovedBy: null,
      submittedAt: new Date(daysFromNow(-1)),
      status: "submitted",
      createdAt: new Date(daysFromNow(-1)),
      updatedAt: new Date(),
    },
    {
      id: "quote-demo-2",
      requestId: "qr-demo-1",
      supplierId: "sup-demo-2",
      pricePerUnit: 6.75 as any,
      currency: "AUD",
      moq: "1500 kg",
      leadTime: "2 weeks",
      validityDate: new Date(daysFromNow(30)),
      paymentTerms: "Net 30",
      additionalNotes: "Can expedite production for +15%. Organic certified available at higher cost.",
      attachments: [],
      packSize: "25 kg bags",
      shippingTerms: "CIF Sydney",
      freightCost: 500 as any,
      shelfLife: "18 months from production date",
      storageRequirements: "Store below 25°C in dry conditions. Avoid direct sunlight",
      dangerousGoodsHandling: null,
      preliminaryApprovalStatus: "initial_submitted",
      preliminaryApprovedAt: null,
      preliminaryApprovedBy: null,
      submittedAt: new Date(daysFromNow(-2)),
      status: "submitted",
      createdAt: new Date(daysFromNow(-2)),
      updatedAt: new Date(daysFromNow(-1)),
    },
    {
      id: "quote-demo-3",
      requestId: "qr-demo-2",
      supplierId: "sup-demo-4",
      pricePerUnit: 12.50 as any,
      currency: "AUD",
      moq: "500 kg",
      leadTime: "3-4 weeks",
      validityDate: new Date(daysFromNow(45)),
      paymentTerms: "Net 30",
      additionalNotes: "Premium cheddar, aged 12 months minimum. Kosher certification available.",
      attachments: [],
      packSize: "20 kg blocks",
      shippingTerms: "FOB Perth",
      freightCost: 650 as any,
      shelfLife: "12 months unopened, 6 months after opening",
      storageRequirements: "Store at 2-4°C. Maintain cold chain during transport",
      dangerousGoodsHandling: null,
      preliminaryApprovalStatus: "final_submitted",
      preliminaryApprovedAt: new Date(daysFromNow(-1)),
      preliminaryApprovedBy: "demo-admin-user",
      submittedAt: new Date(daysFromNow(-4)),
      status: "submitted",
      createdAt: new Date(daysFromNow(-4)),
      updatedAt: new Date(daysFromNow(-1)),
    },
  ];
}

function buildDocumentRequests(): DocumentRequest[] {
  return [
    {
      id: "docreq-demo-1",
      quoteId: "quote-demo-1",
      requestedDocuments: ["coa", "specification", "haccp_cert", "halal"],
      requestedBy: "demo-admin-user",
      requestedAt: new Date(daysFromNow(-1)),
      status: "pending",
      emailSentAt: new Date(daysFromNow(-1)),
      createdAt: new Date(daysFromNow(-1)),
    },
  ];
}

function buildDocuments(): SupplierDocument[] {
  return [
    {
      id: "doc-demo-1",
      supplierQuoteId: "quote-demo-3",
      documentType: "coa",
      fileUrl: "/demo/coa.pdf",
      fileName: "COA-Cheddar-Cheese.pdf",
      fileSize: 500000 as any,
      mimeType: "application/pdf",
      uploadedBy: "sup-demo-4",
      uploadedAt: new Date(daysFromNow(-1)),
      createdAt: new Date(daysFromNow(-1)),
    },
  ];
}

function buildNotifications(): Notification[] {
  return [
    {
      id: "notif-demo-1",
      userId: "demo-admin-user",
      type: "quote_submitted",
      title: "New quote submitted",
      message: "Australian Dairy Ingredients submitted a quote for RFQ-2025-001 (Whole Milk Powder).",
      relatedQuoteId: "quote-demo-1",
      relatedRequestId: "qr-demo-1",
      isRead: false,
      createdAt: new Date(daysFromNow(-1)),
    },
    {
      id: "notif-demo-2",
      userId: "demo-admin-user",
      type: "document_uploaded",
      title: "Documents pending",
      message: "Additional documents requested for RFQ-2025-001 (Whole Milk Powder).",
      relatedQuoteId: "quote-demo-1",
      relatedRequestId: "qr-demo-1",
      isRead: false,
      createdAt: new Date(),
    },
  ];
}

function buildLeads(): DemoLead[] {
  return [];
}

function buildSupplierApplications(): SupplierApplication[] {
  return [
    {
      id: "app-demo-1",
      companyName: "Tasmanian Dairy Products",
      abn: "12 345 678 901",
      address: "45 Dairy Farm Road",
      city: "Launceston",
      state: "TAS",
      postcode: "7250",
      country: "Australia",
      contactPerson: "James Mitchell",
      email: "james@tasdairy.com.au",
      phone: "+61 3 6000 1234",
      website: "https://tasdairy.com.au",
      servicesOffered: ["Dairy Processing", "Cheese Production", "Pasteurization", "Packaging"],
      specializations: ["Artisan Cheese", "Organic Dairy", "Premium Milk Products"],
      equipment: ["Pasteurizers", "Cheese Vats", "Packaging Lines", "Cold Storage"],
      materialTypes: ["Raw Dairy", "Processed Dairy", "Finished Goods"],
      stockLevels: "Seasonal production, fresh dairy products. Limited shelf life stock",
      certifications: ["HACCP", "ISO 22000", "Organic", "FSANZ"],
      isoCertifications: ["ISO 22000:2018", "HACCP"],
      qualityProcesses: "Comprehensive HACCP system with batch traceability and regular testing",
      qualityDocumentation: ["COA", "HACCP Certificates", "Organic Certificates", "Batch Records"],
      foodSafetySystems: ["HACCP Implementation", "Traceability Systems", "Batch Tracking", "Allergen Management"],
      traceabilitySystems: ["Batch tracking", "Farm-to-fork traceability", "LOT numbering system"],
      productionCapacity: "Up to 5000 kg/month for cheese products, 10,000L/month for milk",
      leadTimes: "2-4 weeks for cheese production, 1 week for fresh milk",
      equipmentList: ["Pasteurization Equipment", "Cheese Vats", "Packaging Lines", "Cold Storage Facilities"],
      status: "pending",
      applicationDate: new Date(daysFromNow(-5)),
      reviewDate: null,
      reviewedBy: null,
      reviewNotes: null,
      createdAt: new Date(daysFromNow(-5)),
      updatedAt: new Date(daysFromNow(-5)),
    },
    {
      id: "app-demo-2",
      companyName: "Golden Coast Food Manufacturing",
      abn: "98 765 432 109",
      address: "78 Food Processing Drive",
      city: "Gold Coast",
      state: "QLD",
      postcode: "4217",
      country: "Australia",
      contactPerson: "Sarah Chen",
      email: "sarah@goldencoastfoods.com.au",
      phone: "+61 7 5000 5678",
      website: "https://goldencoastfoods.com.au",
      servicesOffered: ["Blending & Mixing", "Packaging", "Quality Testing", "Canning/Bottling"],
      specializations: ["Sauces & Condiments", "Finished Goods", "Organic Products"],
      equipment: ["Blending Tanks", "Heat Exchangers", "Filling Lines", "Labeling Machines"],
      materialTypes: ["Finished Goods", "Ingredients", "Packaging Materials"],
      stockLevels: "Just-in-time production, minimal stock maintained for finished goods",
      certifications: ["HACCP", "ISO 22000", "BRC", "Organic"],
      isoCertifications: ["ISO 22000:2018", "BRC AA Grade"],
      qualityProcesses: "Full quality management system with allergen controls and batch testing",
      qualityDocumentation: ["COA", "PIF", "SDS", "Process Validation Reports", "Allergen Statements"],
      foodSafetySystems: ["HACCP Implementation", "Allergen Management", "Pathogen Control", "Cleaning & Sanitation"],
      traceabilitySystems: ["Batch tracking", "Supplier verification", "LOT traceability"],
      productionCapacity: "Medium batch production, 5,000-20,000 units per order",
      leadTimes: "3-6 weeks standard, rush orders available",
      equipmentList: ["Blending Equipment", "Heat Processing", "Filling Lines", "Quality Lab"],
      status: "pending",
      applicationDate: new Date(daysFromNow(-3)),
      reviewDate: null,
      reviewedBy: null,
      reviewNotes: null,
      createdAt: new Date(daysFromNow(-3)),
      updatedAt: new Date(daysFromNow(-3)),
    },
    {
      id: "app-demo-3",
      companyName: "Murray Valley Dairy Co-operative",
      abn: "11 222 333 444",
      address: "12 Valley Road",
      city: "Shepparton",
      state: "VIC",
      postcode: "3630",
      country: "Australia",
      contactPerson: "Michael O'Brien",
      email: "michael@murrayvalleydairy.com.au",
      phone: "+61 3 5800 9999",
      website: "https://murrayvalleydairy.com.au",
      servicesOffered: ["Dairy Processing", "Spray Drying", "UHT Processing", "Packaging"],
      specializations: ["Milk Powders", "UHT Milk", "Large Scale Production"],
      equipment: ["Spray Dryers", "UHT Plants", "Packaging Lines", "Cold Storage"],
      materialTypes: ["Raw Dairy", "Processed Dairy", "Finished Goods"],
      stockLevels: "Bulk production, maintain stock of powder products",
      certifications: ["HACCP", "ISO 22000", "FSANZ", "Halal"],
      isoCertifications: ["ISO 22000:2018", "HACCP"],
      qualityProcesses: "Comprehensive quality system with testing at every stage",
      qualityDocumentation: ["COA", "HACCP Certificates", "Halal Certificates", "Test Reports"],
      foodSafetySystems: ["HACCP Implementation", "Traceability Systems", "Temperature Monitoring", "Supplier Verification"],
      traceabilitySystems: ["Full traceability", "Farm source tracking", "Batch records"],
      productionCapacity: "Large volume production, 50,000+ kg per month for powders",
      leadTimes: "4-8 weeks for large orders",
      equipmentList: ["Spray Dryers", "UHT Processing", "Packaging Lines", "Cold Storage"],
      status: "approved",
      applicationDate: new Date(daysFromNow(-10)),
      reviewDate: new Date(daysFromNow(-2)),
      reviewedBy: "demo-admin-user",
      reviewNotes: "Approved - Excellent capabilities for large-scale dairy production",
      createdAt: new Date(daysFromNow(-10)),
      updatedAt: new Date(daysFromNow(-2)),
    },
    {
      id: "app-demo-4",
      companyName: "Pacific Organic Ingredients",
      abn: "55 666 777 888",
      address: "23 Organic Way",
      city: "Adelaide",
      state: "SA",
      postcode: "5000",
      country: "Australia",
      contactPerson: "Lisa Wang",
      email: "lisa@pacificorganic.com.au",
      phone: "+61 8 8000 1111",
      website: "https://pacificorganic.com.au",
      servicesOffered: ["Blending & Mixing", "Drying/Spray Drying", "Quality Testing", "Packaging"],
      specializations: ["Organic Ingredients", "Superfood Blends", "Health Products"],
      equipment: ["Blending Equipment", "Spray Dryers", "Quality Lab", "Packaging Lines"],
      materialTypes: ["Ingredients", "Finished Goods", "Packaging Materials"],
      stockLevels: "Limited stock, primarily order-based production",
      certifications: ["HACCP", "ISO 22000", "Organic", "FSANZ"],
      isoCertifications: ["ISO 22000:2018", "HACCP"],
      qualityProcesses: "Organic certification compliance, full traceability, batch testing",
      qualityDocumentation: ["COA", "Organic Certificates", "HACCP Certificates", "Batch Records"],
      foodSafetySystems: ["HACCP Implementation", "Traceability Systems", "Allergen Management"],
      traceabilitySystems: ["Organic certification tracking", "Ingredient sourcing", "Batch records"],
      productionCapacity: "Small to medium batches, 500-5,000 units per order",
      leadTimes: "2-5 weeks depending on complexity and organic certification requirements",
      equipmentList: ["Blending Tanks", "Spray Dryers", "Quality Lab", "Packaging Equipment"],
      status: "rejected",
      applicationDate: new Date(daysFromNow(-8)),
      reviewDate: new Date(daysFromNow(-1)),
      reviewedBy: "demo-admin-user",
      reviewNotes: "Rejected - Focus on organic superfoods doesn't align with our dairy production needs",
      createdAt: new Date(daysFromNow(-8)),
      updatedAt: new Date(daysFromNow(-1)),
    },
  ];
}

function createSeedSession(): DemoSession {
  return {
    sessionId: uuidv4(),
    userId: "demo-admin-user",
    role: "procurement",
    currentSupplierId: "sup-demo-1",
    createdAt: now(),
    expiresAt: daysFromNow(1),
      data: {
        suppliers: buildSuppliers(),
        quoteRequests: buildQuoteRequests(),
        supplierQuotes: buildSupplierQuotes(),
        documentRequests: buildDocumentRequests(),
        documents: buildDocuments(),
        notifications: buildNotifications(),
        leads: buildLeads(),
        supplierApplications: buildSupplierApplications(),
      },
  };
}

export function getDemoSession(): DemoSession {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) {
    const session = createSeedSession();
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  try {
    const parsed: DemoSession = JSON.parse(raw);
    // Migrate old sessions that don't have supplierApplications or have old structure
    let needsSave = false;
    if (!parsed.data.supplierApplications) {
      parsed.data.supplierApplications = buildSupplierApplications();
      needsSave = true;
    }
    // Ensure all new quote requests are present (migrate from v1 to v2)
    const expectedRequestIds = ["qr-demo-1", "qr-demo-2", "qr-demo-3", "qr-demo-4", "qr-demo-5", "qr-demo-6", "qr-demo-7"];
    const existingRequestIds = parsed.data.quoteRequests.map(qr => qr.id);
    const missingRequests = expectedRequestIds.filter(id => !existingRequestIds.includes(id));
    if (missingRequests.length > 0) {
      // Rebuild quote requests to include new ones
      parsed.data.quoteRequests = buildQuoteRequests();
      needsSave = true;
    }
    if (needsSave) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(parsed));
    }
    // refresh expired sessions
    if (parsed.expiresAt < now()) {
      const session = createSeedSession();
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    }
    return parsed;
  } catch {
    const session = createSeedSession();
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }
}

export function saveDemoSession(session: DemoSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("demo-session-updated"));
}

export function updateDemoSession(
  updater: (session: DemoSession) => DemoSession | void,
): DemoSession {
  const session = getDemoSession();
  const maybe = updater(session);
  const nextSession = (maybe as DemoSession) || session;
  saveDemoSession(nextSession);
  return nextSession;
}

export function setDemoRole(role: DemoRole) {
  updateDemoSession((session) => {
    session.role = role;
    if (role === "supplier" && !session.currentSupplierId) {
      session.currentSupplierId = session.data.suppliers[0]?.id;
    }
    return session;
  });
}

export function setCurrentSupplier(supplierId: string) {
  updateDemoSession((session) => {
    session.currentSupplierId = supplierId;
    return session;
  });
}

export function buildUserForRole(role: DemoRole) {
  if (role === "supplier") {
    return {
      id: "demo-supplier-user",
      email: "supplier@demo.com",
      firstName: "Demo",
      lastName: "Supplier",
      role: "supplier",
      active: true,
      companyName: "Australian Dairy Ingredients",
      profileImageUrl: null,
      passwordHash: null,
      passwordSetAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return {
    id: "demo-admin-user",
    email: "admin@demo.com",
    firstName: "Demo",
    lastName: "Procurement",
    role: "procurement",
    active: true,
    companyName: "Food Production Australia",
    profileImageUrl: null,
    passwordHash: null,
    passwordSetAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function resetDemoSession() {
  const session = createSeedSession();
  saveDemoSession(session);
  return session;
}
