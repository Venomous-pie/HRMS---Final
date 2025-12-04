import { DataTypes } from 'sequelize';

export default function createInvoiceModel(sequelize) {
  const Invoice = sequelize.define('Invoice', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    
    // Invoice identification
    invoiceNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    
    // Reference to reservation
    reservationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Reservations',
        key: 'id'
      }
    },
    
    // Reference to guest
    guestId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Guests',
        key: 'id'
      }
    },
    
    // Invoice dates
    issueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    
    // Financial details
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0
      }
    },
    
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0
      }
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
    
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0
      }
    },
    
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0
      }
    },
    
    paidAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0
      }
    },
    
    balanceAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      get() {
        return parseFloat(this.getDataValue('totalAmount')) - parseFloat(this.getDataValue('paidAmount'));
      }
    },
    
    // Invoice status
    status: {
      type: DataTypes.ENUM,
      values: ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded'],
      allowNull: false,
      defaultValue: 'draft'
    },
    
    // Payment status
    paymentStatus: {
      type: DataTypes.ENUM,
      values: ['unpaid', 'partial', 'paid', 'refunded'],
      allowNull: false,
      defaultValue: 'unpaid'
    },
    
    // Currency
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD',
      validate: {
        len: [3, 3]
      }
    },
    
    // Additional information
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    
    internalNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    
    // Terms and conditions
    paymentTerms: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    
    // Audit fields
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    
    // Soft delete
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'Invoices',
    paranoid: true,
    
    hooks: {
      beforeCreate: async (invoice) => {
        if (!invoice.invoiceNumber) {
          invoice.invoiceNumber = await generateInvoiceNumber(sequelize);
        }
        
        // Set due date if not provided (default 30 days)
        if (!invoice.dueDate) {
          const issueDate = new Date(invoice.issueDate);
          invoice.dueDate = new Date(issueDate.getTime() + (30 * 24 * 60 * 60 * 1000));
        }
        
        // Calculate total amount
        invoice.totalAmount = calculateTotal(invoice);
      },
      
      beforeUpdate: (invoice) => {
        // Recalculate total amount
        invoice.totalAmount = calculateTotal(invoice);
        
        // Update payment status based on amounts
        updatePaymentStatus(invoice);
      }
    },
    
    indexes: [
      {
        fields: ['invoiceNumber']
      },
      {
        fields: ['reservationId']
      },
      {
        fields: ['guestId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['paymentStatus']
      },
      {
        fields: ['issueDate']
      },
      {
        fields: ['dueDate']
      }
    ]
  });
  
  // Instance methods
  Invoice.prototype.calculateBalance = function() {
    return parseFloat(this.totalAmount) - parseFloat(this.paidAmount);
  };
  
  Invoice.prototype.isOverdue = function() {
    return new Date() > new Date(this.dueDate) && this.paymentStatus !== 'paid';
  };
  
  Invoice.prototype.markAsPaid = async function(paymentAmount = null) {
    const amount = paymentAmount || this.totalAmount;
    this.paidAmount = amount;
    this.paymentStatus = 'paid';
    this.status = 'paid';
    return await this.save();
  };
  
  Invoice.prototype.addPayment = async function(paymentAmount) {
    this.paidAmount = parseFloat(this.paidAmount) + parseFloat(paymentAmount);
    updatePaymentStatus(this);
    return await this.save();
  };
  
  return Invoice;
}

// Helper functions
async function generateInvoiceNumber(sequelize) {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  // Get the last invoice number for this month
  const lastInvoice = await sequelize.models.Invoice.findOne({
    where: {
      invoiceNumber: {
        [sequelize.Sequelize.Op.like]: `INV-${year}${month}-%`
      }
    },
    order: [['invoiceNumber', 'DESC']]
  });
  
  let nextNumber = 1;
  if (lastInvoice) {
    const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-').pop());
    nextNumber = lastNumber + 1;
  }
  
  return `INV-${year}${month}-${String(nextNumber).padStart(4, '0')}`;
}

function calculateTotal(invoice) {
  const subtotal = parseFloat(invoice.subtotal || 0);
  const taxAmount = parseFloat(invoice.taxAmount || 0);
  const discountAmount = parseFloat(invoice.discountAmount || 0);
  
  return Math.max(0, subtotal + taxAmount - discountAmount);
}

function updatePaymentStatus(invoice) {
  const total = parseFloat(invoice.totalAmount);
  const paid = parseFloat(invoice.paidAmount);
  
  if (paid <= 0) {
    invoice.paymentStatus = 'unpaid';
  } else if (paid >= total) {
    invoice.paymentStatus = 'paid';
    if (invoice.status !== 'refunded') {
      invoice.status = 'paid';
    }
  } else {
    invoice.paymentStatus = 'partial';
  }
}