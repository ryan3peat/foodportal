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
      supplierName: "Precision Metals Co.",
      contactPerson: "Alex Turner",
      email: "alex@precisionmetals.com",
      email2: "sales@precisionmetals.com",
      phone: "+1 415 200 1234",
      location: "San Francisco, USA",
      moq: "10 units",
      leadTimes: "2-3 weeks",
      paymentTerms: "Net 30",
      certifications: ["ISO 9001", "AWS D1.1"],
      active: true,
      createdBy: "demo-admin-user",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "sup-demo-2",
      supplierName: "Atlas Fabrication",
      contactPerson: "Maria Gomez",
      email: "maria@atlasfab.io",
      email2: null,
      phone: "+1 206 555 0112",
      location: "Seattle, USA",
      moq: "25 units",
      leadTimes: "3-4 weeks",
      paymentTerms: "Net 45",
      certifications: ["ISO 14001", "CWB"],
      active: true,
      createdBy: "demo-admin-user",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "sup-demo-3",
      supplierName: "Steelworks AU",
      contactPerson: "Liam Chen",
      email: "liam@steelworks.au",
      email2: null,
      phone: "+61 2 9876 5432",
      location: "Sydney, Australia",
      moq: "50 units",
      leadTimes: "1-2 weeks",
      paymentTerms: "Net 30",
      certifications: ["ISO 9001"],
      active: true,
      createdBy: "demo-admin-user",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "sup-demo-4",
      supplierName: "Northern Alloys",
      contactPerson: "Priya Singh",
      email: "priya@northernalloys.ca",
      email2: null,
      phone: "+1 416 555 2211",
      location: "Toronto, Canada",
      moq: "15 units",
      leadTimes: "2 weeks",
      paymentTerms: "Net 30",
      certifications: ["ISO 45001"],
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
      requestNumber: "MF-2025-001",
      materialName: "Stainless Steel Bracket",
      materialType: "stainless_steel",
      materialGrade: "304",
      thickness: 3 as any,
      dimensions: { length: 120, width: 60, height: 50 },
      finish: "brushed",
      tolerance: "±0.2mm",
      weldingRequirements: "TIG weld, continuous bead",
      surfaceTreatment: "Passivation",
      materialNotes: null,
      quantityNeeded: 250 as any,
      unitOfMeasure: "units",
      specifications: {},
      additionalSpecifications: "Include mounting holes and chamfered edges.",
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
      requestNumber: "MF-2025-002",
      materialName: "Aluminum Enclosure",
      materialType: "aluminum",
      materialGrade: "6061",
      thickness: 2 as any,
      dimensions: { length: 300, width: 180, height: 120 },
      finish: "powder_coated",
      tolerance: "±0.3mm",
      weldingRequirements: "Spot welds on seams",
      surfaceTreatment: "Anodized interior",
      materialNotes: null,
      quantityNeeded: 120 as any,
      unitOfMeasure: "units",
      specifications: {},
      additionalSpecifications: "Include removable back panel and vents.",
      submitByDate: new Date(daysFromNow(5)),
      status: "active",
      findNewSuppliers: true,
      createdBy: "demo-admin-user",
      createdAt: new Date(daysFromNow(-3)),
      updatedAt: new Date(),
      invitedSupplierIds: ["sup-demo-2", "sup-demo-4"],
    },
    {
      id: "qr-demo-3",
      requestNumber: "MF-2025-003",
      materialName: "Titanium Braces",
      materialType: "titanium",
      materialGrade: "Grade 5",
      thickness: 1.5 as any,
      dimensions: { length: 80, width: 20, height: 8 },
      finish: "polished",
      tolerance: "±0.1mm",
      weldingRequirements: null,
      surfaceTreatment: null,
      materialNotes: null,
      quantityNeeded: 600 as any,
      unitOfMeasure: "units",
      specifications: {},
      additionalSpecifications: "Medical grade finishing required.",
      submitByDate: new Date(daysFromNow(2)),
      status: "draft",
      findNewSuppliers: false,
      createdBy: "demo-admin-user",
      createdAt: new Date(daysFromNow(-1)),
      updatedAt: new Date(),
      invitedSupplierIds: ["sup-demo-1", "sup-demo-4"],
    },
    {
      id: "qr-demo-4",
      requestNumber: "MF-2025-004",
      materialName: "Steel Support Frame",
      materialType: "steel",
      materialGrade: "S355",
      thickness: 8 as any,
      dimensions: { length: 2000, width: 500, height: 300 },
      finish: "galvanized",
      tolerance: "±2mm",
      weldingRequirements: "Full penetration welds, AWS D1.1 certified",
      surfaceTreatment: "Hot dip galvanizing",
      materialNotes: "Structural grade steel required",
      quantityNeeded: 50 as any,
      unitOfMeasure: "units",
      specifications: {},
      additionalSpecifications: "Must meet AS/NZS 1554.1 welding standards. Include lifting points.",
      submitByDate: new Date(daysFromNow(14)),
      status: "active",
      findNewSuppliers: false,
      createdBy: "demo-admin-user",
      createdAt: new Date(daysFromNow(-5)),
      updatedAt: new Date(daysFromNow(-2)),
      invitedSupplierIds: ["sup-demo-1", "sup-demo-2"],
    },
    {
      id: "qr-demo-5",
      requestNumber: "MF-2025-005",
      materialName: "Copper Heat Sink",
      materialType: "copper",
      materialGrade: "C110",
      thickness: 5 as any,
      dimensions: { length: 150, width: 150, height: 30 },
      finish: "polished",
      tolerance: "±0.5mm",
      weldingRequirements: "Brazing acceptable",
      surfaceTreatment: "Anti-oxidation coating",
      materialNotes: "High thermal conductivity required",
      quantityNeeded: 200 as any,
      unitOfMeasure: "units",
      specifications: {},
      additionalSpecifications: "Fins must be precision machined. Thermal testing required.",
      submitByDate: new Date(daysFromNow(12)),
      status: "active",
      findNewSuppliers: true,
      createdBy: "demo-admin-user",
      createdAt: new Date(daysFromNow(-4)),
      updatedAt: new Date(daysFromNow(-1)),
      invitedSupplierIds: ["sup-demo-3", "sup-demo-4"],
    },
    {
      id: "qr-demo-6",
      requestNumber: "MF-2025-006",
      materialName: "Brass Fittings",
      materialType: "brass",
      materialGrade: "C360",
      thickness: 10 as any,
      dimensions: { length: 50, width: 50, height: 25 },
      finish: "polished",
      tolerance: "±0.1mm",
      weldingRequirements: null,
      surfaceTreatment: "Chrome plating",
      materialNotes: "Free-machining brass preferred",
      quantityNeeded: 1000 as any,
      unitOfMeasure: "units",
      specifications: {},
      additionalSpecifications: "Threaded connections required. Must be pressure tested.",
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
      requestNumber: "MF-2025-007",
      materialName: "Aluminum Extrusion Profile",
      materialType: "aluminum",
      materialGrade: "6063",
      thickness: 3 as any,
      dimensions: { length: 6000, width: 100, height: 50 },
      finish: "anodized",
      tolerance: "±0.2mm",
      weldingRequirements: "MIG welding for assembly",
      surfaceTreatment: "Clear anodizing",
      materialNotes: "Custom die required",
      quantityNeeded: 500 as any,
      unitOfMeasure: "meters",
      specifications: {},
      additionalSpecifications: "Custom extrusion die design included. Minimum order quantity applies.",
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
      pricePerUnit: 18.75 as any,
      currency: "AUD",
      moq: "200 units",
      leadTime: "14 days",
      validityDate: new Date(daysFromNow(15)),
      paymentTerms: "Net 30",
      additionalNotes: "Includes passivation and QC reports.",
      attachments: [],
      packSize: "25 units/box",
      shippingTerms: "FOB Sydney",
      freightCost: 450 as any,
      shelfLife: null,
      storageRequirements: "Store dry, room temperature",
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
      pricePerUnit: 19.5 as any,
      currency: "AUD",
      moq: "150 units",
      leadTime: "10 days",
      validityDate: new Date(daysFromNow(10)),
      paymentTerms: "Net 30",
      additionalNotes: "Can expedite for +10%.",
      attachments: [],
      packSize: "20 units/box",
      shippingTerms: "CIF Melbourne",
      freightCost: 500 as any,
      shelfLife: null,
      storageRequirements: null,
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
      pricePerUnit: 42.0 as any,
      currency: "AUD",
      moq: "100 units",
      leadTime: "21 days",
      validityDate: new Date(daysFromNow(20)),
      paymentTerms: "Net 45",
      additionalNotes: "Powder coat in matte black.",
      attachments: [],
      packSize: "10 units/box",
      shippingTerms: "FOB Toronto",
      freightCost: 650 as any,
      shelfLife: null,
      storageRequirements: null,
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
      requestedDocuments: ["coa", "specification", "sds"],
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
      fileName: "COA-Titanium.pdf",
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
      message: "Precision Metals submitted a quote for MF-2025-001.",
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
      message: "Additional documents requested for MF-2025-001.",
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
      companyName: "Pacific Metal Works",
      abn: "12 345 678 901",
      address: "45 Industrial Way",
      city: "Brisbane",
      state: "QLD",
      postcode: "4000",
      country: "Australia",
      contactPerson: "James Mitchell",
      email: "james@pacificmetalworks.com.au",
      phone: "+61 7 3000 1234",
      website: "https://pacificmetalworks.com.au",
      servicesOffered: ["CNC Machining", "Laser Cutting", "Welding", "Fabrication"],
      specializations: ["Precision Components", "Custom Brackets", "Structural Steel"],
      equipment: ["CNC Mills", "Laser Cutters", "TIG Welders", "Press Brakes"],
      materialTypes: ["steel", "aluminum", "stainless_steel"],
      stockLevels: "Maintain stock of common grades (304 SS, 6061 Al, Mild Steel)",
      certifications: ["ISO 9001:2015", "AS/NZS 1554.1"],
      isoCertifications: ["ISO 9001:2015", "ISO 14001:2015"],
      qualityProcesses: "Comprehensive QC procedures with first article inspection and batch testing",
      qualityDocumentation: ["COA", "Material Test Reports", "Welding Certificates"],
      weldingCapabilities: ["TIG", "MIG", "Stick", "Plasma Cutting"],
      surfaceTreatmentOptions: ["Powder Coating", "Anodizing", "Passivation", "Galvanizing"],
      productionCapacity: "Up to 5000 units/month for standard components",
      leadTimes: "2-4 weeks for standard orders, expedited available",
      equipmentList: ["5-axis CNC Mill", "Fiber Laser Cutter", "TIG Welding Stations", "Powder Coating Line"],
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
      companyName: "Advanced Fabrication Solutions",
      abn: "98 765 432 109",
      address: "78 Manufacturing Drive",
      city: "Melbourne",
      state: "VIC",
      postcode: "3000",
      country: "Australia",
      contactPerson: "Sarah Chen",
      email: "sarah@advfab.com.au",
      phone: "+61 3 9000 5678",
      website: "https://advfab.com.au",
      servicesOffered: ["Sheet Metal Fabrication", "Custom Enclosures", "Prototype Development"],
      specializations: ["Electronics Enclosures", "Medical Device Components", "Aerospace Parts"],
      equipment: ["Waterjet Cutter", "CNC Press Brake", "Robotic Welding", "3D Printing"],
      materialTypes: ["aluminum", "stainless_steel", "titanium"],
      stockLevels: "Just-in-time ordering, no stock maintained",
      certifications: ["ISO 13485", "AS9100"],
      isoCertifications: ["ISO 13485:2016", "AS9100D"],
      qualityProcesses: "Medical-grade quality system with full traceability and batch control",
      qualityDocumentation: ["COA", "PIF", "SDS", "Process Validation Reports"],
      weldingCapabilities: ["TIG", "Electron Beam Welding", "Laser Welding"],
      surfaceTreatmentOptions: ["Anodizing", "Passivation", "Electropolishing"],
      productionCapacity: "Small batch production, 100-1000 units per order",
      leadTimes: "3-6 weeks standard, rush orders available",
      equipmentList: ["Waterjet Cutter", "CNC Press Brake", "Clean Room Welding", "Anodizing Line"],
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
      companyName: "Coastal Welding & Fabrication",
      abn: "11 222 333 444",
      address: "12 Harbour Road",
      city: "Newcastle",
      state: "NSW",
      postcode: "2300",
      country: "Australia",
      contactPerson: "Michael O'Brien",
      email: "michael@coastalwelding.com.au",
      phone: "+61 2 4900 9999",
      website: "https://coastalwelding.com.au",
      servicesOffered: ["Heavy Fabrication", "Structural Steel", "Marine Components"],
      specializations: ["Large Scale Projects", "Marine Grade Fabrication", "Offshore Structures"],
      equipment: ["Plasma Cutters", "Heavy Duty Press Brakes", "Overhead Cranes", "Welding Positioners"],
      materialTypes: ["steel", "stainless_steel", "aluminum"],
      stockLevels: "Bulk stock of structural steel grades",
      certifications: ["AWS D1.1", "AS/NZS 1554.1"],
      isoCertifications: ["ISO 9001:2015"],
      qualityProcesses: "Weld procedure qualifications and NDT testing",
      qualityDocumentation: ["Welding Certificates", "NDT Reports", "Material Certificates"],
      weldingCapabilities: ["Stick", "MIG", "Flux Core", "Submerged Arc"],
      surfaceTreatmentOptions: ["Galvanizing", "Painting", "Blast Cleaning"],
      productionCapacity: "Large volume production, 10,000+ units per month",
      leadTimes: "4-8 weeks for large orders",
      equipmentList: ["Plasma Cutting Table", "Heavy Press Brakes", "Overhead Cranes", "Galvanizing Facility"],
      status: "approved",
      applicationDate: new Date(daysFromNow(-10)),
      reviewDate: new Date(daysFromNow(-2)),
      reviewedBy: "demo-admin-user",
      reviewNotes: "Approved - Excellent capabilities for large-scale projects",
      createdAt: new Date(daysFromNow(-10)),
      updatedAt: new Date(daysFromNow(-2)),
    },
    {
      id: "app-demo-4",
      companyName: "Precision Components Ltd",
      abn: "55 666 777 888",
      address: "23 Engineering Street",
      city: "Perth",
      state: "WA",
      postcode: "6000",
      country: "Australia",
      contactPerson: "Lisa Wang",
      email: "lisa@precisioncomponents.com.au",
      phone: "+61 8 9000 1111",
      website: "https://precisioncomponents.com.au",
      servicesOffered: ["CNC Machining", "Precision Grinding", "EDM", "Quality Inspection"],
      specializations: ["High Precision Parts", "Tight Tolerance Work", "Complex Geometries"],
      equipment: ["5-axis CNC", "EDM Machines", "CMM", "Surface Grinders"],
      materialTypes: ["steel", "aluminum", "stainless_steel", "titanium"],
      stockLevels: "Limited stock, primarily order-based",
      certifications: ["ISO 9001:2015", "NADCAP"],
      isoCertifications: ["ISO 9001:2015", "AS9100D"],
      qualityProcesses: "First article inspection, SPC monitoring, full traceability",
      qualityDocumentation: ["COA", "First Article Reports", "CMM Reports"],
      weldingCapabilities: ["TIG", "Precision Welding"],
      surfaceTreatmentOptions: ["Anodizing", "Hard Anodizing", "Passivation"],
      productionCapacity: "Small to medium batches, 50-500 units",
      leadTimes: "2-5 weeks depending on complexity",
      equipmentList: ["5-axis CNC Mills", "EDM Machines", "CMM", "Anodizing Line"],
      status: "rejected",
      applicationDate: new Date(daysFromNow(-8)),
      reviewDate: new Date(daysFromNow(-1)),
      reviewedBy: "demo-admin-user",
      reviewNotes: "Rejected - Focus on precision machining doesn't align with our fabrication needs",
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
      companyName: "Precision Metals Co.",
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
    companyName: "MetalFab HQ",
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
