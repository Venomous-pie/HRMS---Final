import { DataTypes } from 'sequelize';

export default function createInvoiceItemModel(sequelize) {
  const InvoiceItem = sequelize.define('InvoiceItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    
    // Reference to invoice
    invoiceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Invoices',
        key: 'id'
      }
    },
    
    // Item details
    itemType: {
      type: DataTypes.ENUM,
      values: ['room', 'service', 'tax', 'fee', 'discount', 'other'],
      allowNull: false,
      defaultValue: 'other'
    },
    
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    
    // Quantities and rates
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 1.00,
      validate: {
        min: 0
      }
    },
    
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    
    // Line total
    lineTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const quantity = parseFloat(this.getDataValue('quantity') || 0);
        const unitPrice = parseFloat(this.getDataValue('unitPrice') || 0);
        return quantity * unitPrice;
      }
    },
    
    // Dates (for room charges, service periods)
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    
    // Tax information
    taxable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    
    taxRate: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      defaultValue: 0.0000,
      validate: {
        min: 0,
        max: 1
      }
    },
    
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      get() {
        if (!this.getDataValue('taxable')) return 0;
        const lineTotal = this.lineTotal;
        const taxRate = parseFloat(this.getDataValue('taxRate') || 0);
        return lineTotal * taxRate;
      }
    },
    
    // Additional metadata
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Additional data like room number, service ID, etc.'
    },
    
    // Sort order
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'InvoiceItems',
    
    hooks: {
      beforeCreate: (item) => {
        // Calculate line total if not set
        if (!item.lineTotal) {
          const quantity = parseFloat(item.quantity || 1);
          const unitPrice = parseFloat(item.unitPrice || 0);
          item.setDataValue('lineTotal', quantity * unitPrice);
        }
      },
      
      beforeUpdate: (item) => {
        // Recalculate line total
        const quantity = parseFloat(item.quantity || 1);
        const unitPrice = parseFloat(item.unitPrice || 0);
        item.setDataValue('lineTotal', quantity * unitPrice);
      }
    },
    
    indexes: [
      {
        fields: ['invoiceId']
      },
      {
        fields: ['itemType']
      },
      {
        fields: ['sortOrder']
      }
    ]
  });
  
  // Instance methods
  InvoiceItem.prototype.calculateTaxAmount = function() {
    if (!this.taxable) return 0;
    const lineTotal = this.lineTotal;
    const taxRate = parseFloat(this.taxRate || 0);
    return lineTotal * taxRate;
  };
  
  InvoiceItem.prototype.getTotalWithTax = function() {
    return this.lineTotal + this.calculateTaxAmount();
  };
  
  return InvoiceItem;
}