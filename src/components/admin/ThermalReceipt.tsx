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
  total_amount: number;
  status: string;
  created_at: string;
  order_items: {
    item_name: string;
    quantity: number;
    price: number;
  }[];
}

interface ThermalReceiptProps {
  order: Order;
  onPrint: () => void;
}

export const ThermalReceipt = ({ order, onPrint }: ThermalReceiptProps) => {
  const styles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
        @media print {
          body * {
            visibility: hidden;
          }
          .thermal-receipt, .thermal-receipt * {
            visibility: visible;
          }
          .thermal-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            background: white;
          }
          .no-print {
            display: none !important;
          }
        }

        .thermal-receipt {
          font-family: 'Courier New', monospace;
          width: 80mm;
          background: white;
          color: black;
          padding: 10mm;
          font-size: 12px;
          line-height: 1.4;
        }

        .thermal-receipt h1 {
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          margin: 0 0 8px 0;
          text-transform: uppercase;
        }

        .thermal-receipt h2 {
          text-align: center;
          font-size: 14px;
          font-weight: bold;
          margin: 0 0 8px 0;
        }

        .thermal-receipt .divider {
          border-top: 1px dashed black;
          margin: 8px 0;
        }

        .thermal-receipt .row {
          display: flex;
          justify-content: space-between;
          margin: 4px 0;
        }

        .thermal-receipt .items {
          margin: 8px 0;
        }

        .thermal-receipt .item-row {
          display: flex;
          justify-content: space-between;
          margin: 4px 0;
        }

        .thermal-receipt .total-row {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          font-size: 14px;
          margin-top: 8px;
        }

        .thermal-receipt .center {
          text-align: center;
        }

        .thermal-receipt .small {
          font-size: 10px;
        }
  `;

  return (
    <div id={`receipt-${order.id}`} className="thermal-receipt" data-styles={styles}>
      <div>
        <h1>BENGULURU BHAVAN</h1>
        <p className="center small">South Indian Restaurant</p>
        
        <div className="divider"></div>
        
        <h2>ORDER RECEIPT</h2>
        
        <div className="row small">
          <span>Order ID:</span>
          <span>#{order.id.slice(0, 8).toUpperCase()}</span>
        </div>
        
        <div className="row small">
          <span>Date:</span>
          <span>{format(new Date(order.created_at), "dd/MM/yyyy HH:mm")}</span>
        </div>
        
        <div className="row small">
          <span>Status:</span>
          <span>{order.status}</span>
        </div>
        
        <div className="divider"></div>
        
        <div>
          <p className="small" style={{ margin: '4px 0', fontWeight: 'bold' }}>CUSTOMER DETAILS:</p>
          <p className="small" style={{ margin: '2px 0' }}>Name: {order.customer_name}</p>
          <p className="small" style={{ margin: '2px 0' }}>Phone: {order.customer_phone}</p>
          <p className="small" style={{ margin: '2px 0' }}>Address:</p>
          <p className="small" style={{ margin: '2px 0', paddingLeft: '10px' }}>
            {order.flat_no && `${order.flat_no}, `}
            {order.apartment_street}
          </p>
          <p className="small" style={{ margin: '2px 0', paddingLeft: '10px' }}>
            {order.sector && `${order.sector}, `}
            {order.area}
          </p>
        </div>
        
        <div className="divider"></div>
        
        <div className="items">
          <div className="row" style={{ fontWeight: 'bold' }}>
            <span>ITEM</span>
            <span>QTY x PRICE</span>
          </div>
          
          {order.order_items.map((item, idx) => (
            <div key={idx}>
              <div className="row small">
                <span style={{ flex: 1 }}>{item.item_name}</span>
              </div>
              <div className="row small" style={{ paddingLeft: '10px' }}>
                <span>{item.quantity} x ₹{item.price.toFixed(2)}</span>
                <span>₹{(item.quantity * item.price).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="divider"></div>
        
        <div className="total-row">
          <span>TOTAL:</span>
          <span>₹{order.total_amount.toFixed(2)}</span>
        </div>
        
        <div className="divider"></div>
        
        <p className="center small" style={{ marginTop: '12px' }}>
          Thank you for your order!
        </p>
        <p className="center small">Visit us again!</p>
      </div>
    </div>
  );
};
