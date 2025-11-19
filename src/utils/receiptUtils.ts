import { format } from "date-fns";

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  flat_no: string | null;
  apartment_street: string | null;
  sector: string | null;
  area: string | null;
  status: string;
  total_amount: number;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
}

interface OrderItem {
  item_name: string;
  quantity: number;
  price: number;
  portion_name?: string | null;
}

export const generateReceiptHTML = (order: Order, items: OrderItem[]): string => {
  const fullAddress = [
    order.flat_no,
    order.apartment_street,
    order.sector,
    order.area
  ].filter(Boolean).join(', ') || order.customer_address;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Order #${order.id.slice(0, 8)}</title>
      <style>
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 10mm;
          }
        }
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          max-width: 80mm;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          border-bottom: 2px dashed #000;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        .header h1 {
          margin: 0;
          font-size: 20px;
          font-weight: bold;
        }
        .header .subtitle {
          font-size: 10px;
          margin: 2px 0;
        }
        .section {
          margin-bottom: 10px;
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
        }
        .label {
          font-weight: bold;
        }
        .items {
          margin: 10px 0;
        }
        .item {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
        }
        .item-name {
          flex: 1;
        }
        .item-qty {
          width: 30px;
          text-align: center;
        }
        .item-price {
          width: 60px;
          text-align: right;
        }
        .total {
          font-size: 16px;
          font-weight: bold;
          text-align: right;
          margin-top: 10px;
          border-top: 2px solid #000;
          padding-top: 10px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>BENGULURU BHAVAN</h1>
        <p class="subtitle">South Indian Restaurant</p>
        <p style="margin: 10px 0 5px 0; font-size: 14px; font-weight: bold;">NEW ORDER</p>
        <p>Order #${order.id.slice(0, 8).toUpperCase()}</p>
        <p>${format(new Date(order.created_at), "dd/MM/yyyy HH:mm:ss")}</p>
      </div>

      <div class="section">
        <p class="label">CUSTOMER DETAILS:</p>
        <p><span class="label">Name:</span> ${order.customer_name}</p>
        <p><span class="label">Phone:</span> ${order.customer_phone}</p>
        <p><span class="label">Address:</span></p>
        <p style="padding-left: 10px;">${fullAddress}</p>
        ${order.latitude && order.longitude ? 
          `<p style="font-size: 9px; padding-left: 10px;">Location: ${order.latitude}, ${order.longitude}</p>` 
          : ''
        }
      </div>

      <div class="section items">
        <p class="label">ORDER ITEMS:</p>
        ${items.map(item => `
          <div class="item">
            <span class="item-name">${item.item_name}${item.portion_name ? ` (${item.portion_name})` : ''}</span>
            <span class="item-qty">x${item.quantity}</span>
            <span class="item-price">₹${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        `).join('')}
      </div>

      <div class="total">
        TOTAL: ₹${order.total_amount.toFixed(2)}
      </div>

      <div class="footer">
        <p>Thank you for your order!</p>
        <p>Status: ${order.status.toUpperCase()}</p>
        <p>Visit us again!</p>
      </div>
    </body>
    </html>
  `;
};

export const printOrder = (order: Order, items: OrderItem[]) => {
  const receiptHTML = generateReceiptHTML(order, items);
  try {
    // Hidden iframe method
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.id = 'order-print-frame';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) throw new Error('Print iframe not available');

    doc.open();
    doc.write(receiptHTML);
    doc.close();

    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } finally {
        setTimeout(() => {
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }, 1000);
      }
    };
  } catch (err) {
    console.warn('printOrder: iframe method failed', err);
    throw err;
  }
};

export const downloadOrderReceipt = (order: Order, items: OrderItem[]) => {
  console.log('📥 Starting download for order:', order.id);
  
  const fullAddress = [
    order.flat_no,
    order.apartment_street,
    order.sector,
    order.area
  ].filter(Boolean).join(', ') || order.customer_address;
  
  const orderText = `
===========================================
        BENGULURU BHAVAN
     South Indian Restaurant
===========================================
          NEW ORDER RECEIVED
===========================================

Order ID: ${order.id}
Date/Time: ${format(new Date(order.created_at), "dd/MM/yyyy HH:mm:ss")}

-------------------------------------------
CUSTOMER DETAILS
-------------------------------------------
Name: ${order.customer_name}
Phone: ${order.customer_phone}

Delivery Address:
${fullAddress}
${order.latitude && order.longitude ? 
  `\nLocation: ${order.latitude}, ${order.longitude}\nGoogle Maps: https://www.google.com/maps?q=${order.latitude},${order.longitude}`
  : ''
}

-------------------------------------------
ORDER ITEMS
-------------------------------------------
${items.map(item => 
  `${item.item_name}${item.portion_name ? ` (${item.portion_name})` : ''}\n  Qty: ${item.quantity} x ₹${item.price.toFixed(2)} = ₹${(item.price * item.quantity).toFixed(2)}`
).join('\n\n')}

-------------------------------------------
TOTAL AMOUNT: ₹${order.total_amount.toFixed(2)}
STATUS: ${order.status.toUpperCase()}
===========================================
  `.trim();

  try {
    const blob = new Blob([orderText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = `Order_${order.id.slice(0, 8)}_${format(new Date(order.created_at), "yyyyMMdd_HHmmss")}.txt`;
    link.download = filename;
    
    console.log('📄 Download filename:', filename);
    
    document.body.appendChild(link);
    link.click();
    
    console.log('✅ Download link clicked');
    
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log('🧹 Download cleanup completed');
    }, 100);
  } catch (error) {
    console.error('❌ Download error:', error);
    throw error;
  }
};
