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
    companyName = 'MTM Windows Pty Ltd',
    companyAddress = '4 Tullamarine Park Road\nTullamarine, Victoria 3043',
    companyPhone = '+61 3 9310 5544',
    companyEmail = 'quotes@mtmaluminium.com.au'
  } = options

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  let yPosition = 20

  // Header - Company Name
  doc.setFontSize(16)
  doc.setTextColor(33, 33, 33)
  doc.text(companyName, 20, yPosition)
  
  yPosition += 6
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  const companyLines = companyAddress.split('\n')
  companyLines.forEach(line => {
    doc.text(line, 20, yPosition)
    yPosition += 4
  })
  doc.text(`Phone: ${companyPhone}`, 20, yPosition)
  yPosition += 4
  doc.text(`Email: ${companyEmail}`, 20, yPosition)
  
  // PO Number and Date boxes - Top Right (reordered)
  const rightColumnX = pageWidth - 85
  yPosition = 20
  
  // Draw boxes for PO number and date
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.5)
  
  // PO Number box (now first)
  doc.rect(rightColumnX, yPosition, 80, 12)
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('PURCHASE ORDER #', rightColumnX + 2, yPosition + 4)
  doc.setFontSize(10)
  doc.setTextColor(33, 33, 33)
  doc.text(purchaseOrder.po_number, rightColumnX + 2, yPosition + 9)
  
  // Date box (now below PO number, with both order and delivery dates)
  yPosition += 15
  doc.rect(rightColumnX, yPosition, 80, 22) // Increased height for two dates
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('ORDER DATE', rightColumnX + 2, yPosition + 4)
  doc.setFontSize(9)
  doc.setTextColor(33, 33, 33)
  doc.text(purchaseOrder.order_date ? new Date(purchaseOrder.order_date).toLocaleDateString('en-AU') : new Date().toLocaleDateString('en-AU'), rightColumnX + 2, yPosition + 9)
  
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('REQUIRED DATE', rightColumnX + 2, yPosition + 15)
  doc.setFontSize(9)
  doc.setTextColor(33, 33, 33)
  doc.text(purchaseOrder.delivery_date ? new Date(purchaseOrder.delivery_date).toLocaleDateString('en-AU') : 'TBD', rightColumnX + 2, yPosition + 20)
  
  // Vendor Section
  yPosition = 60
  doc.setFontSize(12)
  doc.setTextColor(33, 33, 33)
  doc.text('VENDOR', 20, yPosition)
  
  yPosition += 8
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  
  // Handle both supplier and suppliers properties
  const supplier = purchaseOrder.supplier || purchaseOrder.suppliers
  if (supplier) {
    doc.text(supplier.company_name, 20, yPosition)
    yPosition += 5
    
    if (supplier.address_line_1) {
      doc.text(supplier.address_line_1, 20, yPosition)
      yPosition += 4
      
      if (supplier.address_line_2) {
        doc.text(supplier.address_line_2, 20, yPosition)
        yPosition += 4
      }
      
      const addressParts = [supplier.city, supplier.state, supplier.postal_code].filter(Boolean)
      if (addressParts.length > 0) {
        doc.text(addressParts.join(', '), 20, yPosition)
        yPosition += 4
      }
    }
    
    if (supplier.phone) {
      doc.text(`Phone: ${supplier.phone}`, 20, yPosition)
      yPosition += 4
    }
    
    if (supplier.email) {
      doc.text(`Email: ${supplier.email}`, 20, yPosition)
      yPosition += 4
    }
    
    if (supplier.website) {
      doc.text(`Website: ${supplier.website}`, 20, yPosition)
      yPosition += 4
    }
    
    if (supplier.abn) {
      doc.text(`ABN: ${supplier.abn}`, 20, yPosition)
      yPosition += 4
    }
  }

  // Ship To Section - aligned with right edge of items table
  const shipToX = 140 // Align with right edge of items table (20 + 120 column width = 140)
  yPosition = 60
  doc.setFontSize(12)
  doc.setTextColor(33, 33, 33)
  doc.text('SHIP TO', shipToX, yPosition)
  
  yPosition += 8
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(companyName, shipToX, yPosition)
  yPosition += 5
  companyLines.forEach(line => {
    doc.text(line, shipToX, yPosition)
    yPosition += 4
  })
  
  // Line Items Table
  yPosition = Math.max(yPosition, 85) // Reduce whitespace
  
  if (includeLineItems && lineItems.length > 0) {
    const tableData = lineItems.map((item, index) => [
      (index + 1).toString(), // Item number
      item.item_description,
      item.quantity.toString(),
      `$${parseFloat(item.unit_price.toString()).toFixed(2)}`,
      `$${parseFloat(item.line_total.toString()).toFixed(2)}`
    ])
    
    autoTable(doc, {
      startY: yPosition,
      head: [['ITEM #', 'DESCRIPTION', 'QTY', 'UNIT PRICE', 'TOTAL']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [33, 33, 33],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [33, 33, 33]
      },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: 90 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 25, halign: 'right' }
      },
      margin: { left: 20, right: 20 },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      }
    })
    
    // Totals section - styled to match the table and aligned with right edge
    const finalY = (doc as any).lastAutoTable.finalY + 10
    const totalsTableX = 140 // Align with right edge of items table (20 margin + 120 column width = 140)
    
    // Create totals as a styled table
    autoTable(doc, {
      startY: finalY,
      head: [],
      body: [
        ['SUBTOTAL', `$${parseFloat(purchaseOrder.subtotal?.toString() || '0').toFixed(2)}`],
        ['TAX', `$${parseFloat(purchaseOrder.tax_amount?.toString() || '0').toFixed(2)}`],
        ['SHIPPING', '$0.00'],
        ['OTHER', '$0.00'],
        ['TOTAL', `$${parseFloat(purchaseOrder.total_amount.toString()).toFixed(2)}`]
      ],
      theme: 'grid',
      bodyStyles: {
        fontSize: 9,
        textColor: [33, 33, 33],
        fillColor: [250, 250, 250]
      },
      columnStyles: {
        0: { cellWidth: 25, halign: 'left', fontStyle: 'bold' },
        1: { cellWidth: 25, halign: 'right' }
      },
      margin: { left: totalsTableX },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      didParseCell: function (data) {
        // Style the TOTAL row differently
        if (data.row.index === 4) {
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.fontSize = 10
          data.cell.styles.fillColor = [220, 220, 220]
        }
      }
    })
    
    // Comments section
    const commentsY = finalY + 55
    if (purchaseOrder.notes && commentsY < pageHeight - 40) {
      doc.setFontSize(12)
      doc.setTextColor(33, 33, 33)
      doc.text('COMMENTS / SPECIAL INSTRUCTIONS', 20, commentsY)
      
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      const splitNotes = doc.splitTextToSize(purchaseOrder.notes, pageWidth - 40)
      doc.text(splitNotes, 20, commentsY + 8)
    }
  } else {
    // If no line items, just show a placeholder table
    autoTable(doc, {
      startY: yPosition,
      head: [['ITEM #', 'DESCRIPTION', 'QTY', 'UNIT PRICE', 'TOTAL']],
      body: [['', 'No line items added', '', '', '']],
      theme: 'grid',
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [33, 33, 33],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [150, 150, 150],
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 90 },
        2: { cellWidth: 20 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 }
      },
      margin: { left: 20, right: 20 }
    })
  }
  
  // Footer
  const footerY = pageHeight - 20
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text(`Generated on ${new Date().toLocaleDateString('en-AU')} at ${new Date().toLocaleTimeString('en-AU')}`, pageWidth / 2, footerY, { align: 'center' })
  
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