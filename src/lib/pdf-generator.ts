import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { PurchaseOrder } from '@/lib/supabase-types'

export interface PDFGenerationOptions {
  includeLineItems?: boolean
  companyLogo?: string
  companyName?: string
  companyAddress?: string
  companyPhone?: string
  companyEmail?: string
}

export const generatePurchaseOrderPDF = async (
  purchaseOrder: PurchaseOrder,
  lineItems: any[] = [],
  options: PDFGenerationOptions = {}
) => {
  const {
    includeLineItems = true,
    companyName = 'Your Company Name',
    companyAddress = '123 Business Street\nCity, State 12345',
    companyPhone = '+61 2 1234 5678',
    companyEmail = 'info@yourcompany.com.au'
  } = options

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  let yPosition = 20

  // Header
  doc.setFontSize(20)
  doc.setTextColor(33, 33, 33)
  doc.text('PURCHASE ORDER', pageWidth / 2, yPosition, { align: 'center' })
  
  yPosition += 15
  
  // Company Information
  doc.setFontSize(12)
  doc.setTextColor(100, 100, 100)
  const companyLines = companyAddress.split('\n')
  doc.text(companyName, 20, yPosition)
  yPosition += 5
  
  companyLines.forEach(line => {
    doc.text(line, 20, yPosition)
    yPosition += 5
  })
  
  doc.text(`Phone: ${companyPhone}`, 20, yPosition)
  yPosition += 5
  doc.text(`Email: ${companyEmail}`, 20, yPosition)
  
  // PO Details Box
  yPosition = 20
  const rightColumnX = pageWidth - 80
  
  doc.setFontSize(14)
  doc.setTextColor(33, 33, 33)
  doc.text('PO Details', rightColumnX, yPosition)
  
  yPosition += 10
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  
  // PO Information
  const poInfo = [
    ['PO Number:', purchaseOrder.po_number],
    ['Status:', purchaseOrder.status.toUpperCase()],
    ['Order Date:', purchaseOrder.order_date ? new Date(purchaseOrder.order_date).toLocaleDateString() : 'N/A'],
    ['Delivery Date:', purchaseOrder.delivery_date ? new Date(purchaseOrder.delivery_date).toLocaleDateString() : 'N/A'],
    ['Currency:', purchaseOrder.currency || 'AUD']
  ]
  
  poInfo.forEach(([label, value]) => {
    doc.text(label, rightColumnX, yPosition)
    doc.text(value, rightColumnX + 25, yPosition)
    yPosition += 5
  })
  
  // Supplier Information
  yPosition = 80
  doc.setFontSize(14)
  doc.setTextColor(33, 33, 33)
  doc.text('Supplier Information', 20, yPosition)
  
  yPosition += 10
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  
  if (purchaseOrder.supplier) {
    const supplier = purchaseOrder.supplier
    doc.text(`Company: ${supplier.company_name}`, 20, yPosition)
    yPosition += 5
    
    if (supplier.abn) {
      doc.text(`ABN: ${supplier.abn}`, 20, yPosition)
      yPosition += 5
    }
    
    if (supplier.address_line_1) {
      doc.text(`Address: ${supplier.address_line_1}`, 20, yPosition)
      yPosition += 5
      
      if (supplier.address_line_2) {
        doc.text(`         ${supplier.address_line_2}`, 20, yPosition)
        yPosition += 5
      }
      
      const addressParts = [supplier.city, supplier.state, supplier.postal_code].filter(Boolean)
      if (addressParts.length > 0) {
        doc.text(`         ${addressParts.join(', ')}`, 20, yPosition)
        yPosition += 5
      }
    }
    
    if (supplier.phone) {
      doc.text(`Phone: ${supplier.phone}`, 20, yPosition)
      yPosition += 5
    }
    
    if (supplier.email) {
      doc.text(`Email: ${supplier.email}`, 20, yPosition)
      yPosition += 5
    }
  }
  
  // Line Items Table
  if (includeLineItems && lineItems.length > 0) {
    yPosition += 15
    
    const tableData = lineItems.map(item => [
      item.item_description,
      item.quantity.toString(),
      `$${parseFloat(item.unit_price).toFixed(2)}`,
      `$${parseFloat(item.line_total).toFixed(2)}`
    ])
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Description', 'Quantity', 'Unit Price', 'Line Total']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: 255,
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [33, 33, 33]
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' }
      },
      margin: { left: 20, right: 20 }
    })
    
    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10
    
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    
    const totalsX = pageWidth - 80
    
    doc.text('Subtotal:', totalsX, finalY)
    doc.text(`$${parseFloat(purchaseOrder.subtotal?.toString() || '0').toFixed(2)}`, totalsX + 25, finalY)
    
    doc.text('Tax:', totalsX, finalY + 5)
    doc.text(`$${parseFloat(purchaseOrder.tax_amount?.toString() || '0').toFixed(2)}`, totalsX + 25, finalY + 5)
    
    doc.setFontSize(12)
    doc.setTextColor(33, 33, 33)
    doc.text('Total:', totalsX, finalY + 12)
    doc.text(`$${parseFloat(purchaseOrder.total_amount.toString()).toFixed(2)}`, totalsX + 25, finalY + 12)
  }
  
  // Notes
  if (purchaseOrder.notes) {
    const notesY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 30 : yPosition + 30
    
    doc.setFontSize(12)
    doc.setTextColor(33, 33, 33)
    doc.text('Notes:', 20, notesY)
    
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    const splitNotes = doc.splitTextToSize(purchaseOrder.notes, pageWidth - 40)
    doc.text(splitNotes, 20, notesY + 8)
  }
  
  // Footer
  const footerY = doc.internal.pageSize.height - 20
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, pageWidth / 2, footerY, { align: 'center' })
  
  return doc
}

export const downloadPurchaseOrderPDF = async (
  purchaseOrder: PurchaseOrder,
  lineItems: any[] = [],
  options: PDFGenerationOptions = {}
) => {
  const doc = await generatePurchaseOrderPDF(purchaseOrder, lineItems, options)
  const filename = `PO-${purchaseOrder.po_number}-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}