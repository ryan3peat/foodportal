import { storage } from './server/storage';
import { readFileSync } from 'fs';

async function importSuppliers() {
  try {
    // Read the CSV file
    const csvContent = readFileSync('attached_assets/Suppliers_1762473921521.csv', 'utf-8');
    const lines = csvContent.trim().split('\n');
    
    // Skip header row
    const dataLines = lines.slice(1);
    
    // Get admin user ID to use as createdBy
    const adminUser = await storage.getUserByEmail('ryan@essentialflavours.com.au');
    if (!adminUser) {
      console.error('Admin user not found. Please create an admin user first.');
      return;
    }
    
    console.log(`Starting import of ${dataLines.length} suppliers...`);
    console.log(`Using admin user: ${adminUser.email} (${adminUser.id})`);
    console.log('---');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const line of dataLines) {
      // Parse CSV line (handle commas in quoted fields)
      const regex = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/;
      const columns = line.split(regex).map(col => col.trim().replace(/^"|"$/g, ''));
      
      if (columns.length < 3) {
        console.warn(`Skipping invalid line: ${line}`);
        errorCount++;
        continue;
      }
      
      const [supplierName, contactPerson, emailField] = columns;
      
      // Split emails by semicolon
      const emails = emailField.split(';').map(e => e.trim()).filter(e => e.length > 0);
      const email = emails[0] || '';
      const email2 = emails[1] || null;
      
      // Extract clean email (remove name prefix if present)
      const extractEmail = (emailStr: string): string => {
        const match = emailStr.match(/[\w.-]+@[\w.-]+\.\w+/);
        return match ? match[0] : emailStr;
      };
      
      const cleanEmail = extractEmail(email);
      const cleanEmail2 = email2 ? extractEmail(email2) : null;
      
      try {
        await storage.createSupplier({
          supplierName,
          contactPerson,
          email: cleanEmail,
          email2: cleanEmail2 || undefined,
          active: true,
          createdBy: adminUser.id,
        });
        
        console.log(`✓ Imported: ${supplierName} (${cleanEmail}${cleanEmail2 ? ', ' + cleanEmail2 : ''})`);
        successCount++;
      } catch (error: any) {
        console.error(`✗ Error importing ${supplierName}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('---');
    console.log(`Import complete: ${successCount} success, ${errorCount} errors`);
    
    process.exit(0);
  } catch (error) {
    console.error('Fatal error during import:', error);
    process.exit(1);
  }
}

importSuppliers();
