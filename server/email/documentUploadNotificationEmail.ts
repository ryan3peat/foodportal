export interface DocumentUploadNotificationData {
  supplierName: string;
  rfqNumber: string;
  materialName: string;
  documentType: string;
  fileName: string;
  quoteDetailUrl: string;
  totalUploaded: number;
  totalRequested: number;
}

const DOCUMENT_LABELS: Record<string, string> = {
  coa: "Certificate of Analysis (COA)",
  pif: "PIF",
  specification: "Specification",
  sds: "SDS",
  halal: "Halal Certificate",
  kosher: "Kosher Certificate",
  natural_status: "Natural Status",
  process_flow: "Process Flow",
  gfsi_cert: "GFSI Certificate",
  organic: "Organic Certificate",
};

export function createDocumentUploadNotificationTemplate(
  data: DocumentUploadNotificationData
): { subject: string; html: string } {
  const documentLabel = DOCUMENT_LABELS[data.documentType] || data.documentType;
  const isComplete = data.totalUploaded >= data.totalRequested && data.totalRequested > 0;

  const subject = isComplete
    ? `All Documents Received - ${data.rfqNumber} - ${data.supplierName}`
    : `New Document Uploaded - ${data.rfqNumber} - ${data.supplierName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
    .header p { margin: 8px 0 0; opacity: 0.95; font-size: 16px; }
    .content { padding: 32px 24px; }
    .section { margin-bottom: 28px; }
    .section-title { font-size: 18px; font-weight: 600; color: #3b82f6; margin-bottom: 12px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
    .detail-row { display: flex; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { font-weight: 600; color: #6b7280; width: 180px; flex-shrink: 0; }
    .detail-value { color: #1f2937; flex: 1; }
    .notification-box { background: ${isComplete ? '#d1fae5' : '#dbeafe'}; border-left: 4px solid ${isComplete ? '#10b981' : '#3b82f6'}; padding: 20px; border-radius: 6px; margin: 24px 0; }
    .notification-box .icon { font-size: 48px; margin-bottom: 12px; text-align: center; }
    .notification-box h2 { color: ${isComplete ? '#065f46' : '#1e40af'}; margin: 0 0 8px; font-size: 20px; }
    .notification-box p { color: ${isComplete ? '#047857' : '#1e3a8a'}; margin: 0; font-size: 15px; }
    .progress-bar { background: #e5e7eb; height: 24px; border-radius: 12px; overflow: hidden; margin: 16px 0; }
    .progress-fill { background: ${isComplete ? '#10b981' : '#3b82f6'}; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 13px; transition: width 0.3s; }
    .cta-section { text-align: center; margin: 32px 0; padding: 24px; background: #f9fafb; border-radius: 8px; }
    .cta-button { display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; transition: background 0.3s; }
    .cta-button:hover { background: #2563eb; }
    .footer { background: #f9fafb; padding: 24px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb; }
    @media only screen and (max-width: 600px) {
      .detail-row { flex-direction: column; }
      .detail-label { width: 100%; margin-bottom: 4px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isComplete ? '✅' : '📄'} Document ${isComplete ? 'Complete' : 'Upload'} Notification</h1>
      <p>${data.rfqNumber}</p>
    </div>

    <div class="content">
      <div class="notification-box">
        ${isComplete ? `
          <div class="icon">🎉</div>
          <h2>All Documents Received!</h2>
          <p>${data.supplierName} has uploaded all requested documents for ${data.materialName}</p>
        ` : `
          <div class="icon">📎</div>
          <h2>New Document Uploaded</h2>
          <p>${data.supplierName} has uploaded a new document for ${data.materialName}</p>
        `}
      </div>

      <div class="section">
        <div class="section-title">Upload Details</div>
        <div class="detail-row">
          <div class="detail-label">Supplier:</div>
          <div class="detail-value"><strong>${data.supplierName}</strong></div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Material:</div>
          <div class="detail-value">${data.materialName}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Document Type:</div>
          <div class="detail-value">${documentLabel}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">File Name:</div>
          <div class="detail-value">${data.fileName}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Upload Progress</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${(data.totalUploaded / data.totalRequested * 100).toFixed(0)}%">
            ${data.totalUploaded} / ${data.totalRequested} Documents
          </div>
        </div>
        <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 8px;">
          ${isComplete
            ? '✓ All requested documents have been uploaded'
            : `${data.totalRequested - data.totalUploaded} document${data.totalRequested - data.totalUploaded !== 1 ? 's' : ''} remaining`}
        </p>
      </div>

      <div class="cta-section">
        <p style="margin-bottom: 16px; font-size: 15px;"><strong>Review the Documents:</strong></p>
        <a href="${data.quoteDetailUrl}" class="cta-button">View Quote Details</a>
      </div>

      <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
        You can view and download all uploaded documents from the quote detail page in the admin portal.
      </p>
    </div>

    <div class="footer">
      <p><strong>Essential Flavours</strong></p>
      <p>Supplier Portal - Automated Notification</p>
      <p style="margin-top: 12px;">This is an automated message. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html };
}
