import { DataTypes } from 'sequelize';

export default function createPaymentModel(sequelize) {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    
    // Payment identification
    paymentNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    
    // References
    invoiceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Invoices',
        key: 'id'
      }
    },
    
    reservationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Reservations',
        key: 'id'
      }
    },
    
    guestId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Guests',
        key: 'id'
      }
    },
    
    // Payment details
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01
      }
    },
    
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD',
      validate: {
        len: [3, 3]
      }
    },
    
    // Payment method information
    paymentMethod: {
      type: DataTypes.ENUM,
      values: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'check', 'digital_wallet', 'other'],
      allowNull: false,
      defaultValue: 'cash'
    },
    
    // Payment provider/gateway info
    paymentProvider: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'stripe, paypal, square, etc.'
    },
    
    // External transaction details
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'External payment gateway transaction ID'
    },
    
    referenceNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Check number, authorization code, etc.'
    },
    
    // Card details (for card payments - store minimal info)
    cardLast4: {
      type: DataTypes.STRING(4),
      allowNull: true,
      validate: {
        len: [4, 4]
      }
    },
    
    cardBrand: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'visa, mastercard, amex, etc.'
    },
    
    // Payment status
    status: {
      type: DataTypes.ENUM,
      values: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
      allowNull: false,
      defaultValue: 'pending'
    },
    
    // Dates
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    
    // Refund information
    refundAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0
      }
    },
    
    refundedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    
    refundReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    
    // Gateway response data
    gatewayResponse: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Raw response from payment gateway'
    },
    
    // Fees
    processingFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0
      }
    },
    
    // Notes
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    
    internalNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    
    // Audit fields
    processedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    
    createdBy: {
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
    tableName: 'Payments',
    paranoid: true,
    
    hooks: {
      beforeCreate: async (payment) => {
        if (!payment.paymentNumber) {
          payment.paymentNumber = await generatePaymentNumber(sequelize);
        }
      }
    },
    
    indexes: [
      {
        fields: ['paymentNumber']
      },
      {
        fields: ['invoiceId']
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
        fields: ['paymentMethod']
      },
      {
        fields: ['paymentDate']
      },
      {
        fields: ['transactionId']
      }
    ]
  });
  
  // Instance methods
  Payment.prototype.canBeRefunded = function() {
    return this.status === 'completed' && 
           this.refundAmount < this.amount &&
           !this.deletedAt;
  };
  
  Payment.prototype.getNetAmount = function() {
    return parseFloat(this.amount) - parseFloat(this.processingFee);
  };
  
  Payment.prototype.getRemainingRefundAmount = function() {
    return parseFloat(this.amount) - parseFloat(this.refundAmount);
  };
  
  Payment.prototype.processRefund = async function(refundAmount, reason = null, processedBy = null) {
    const remainingAmount = this.getRemainingRefundAmount();
    
    if (refundAmount > remainingAmount) {
      throw new Error(`Refund amount cannot exceed remaining amount of ${remainingAmount}`);
    }
    
    this.refundAmount = parseFloat(this.refundAmount) + parseFloat(refundAmount);
    this.refundedAt = new Date();
    this.refundReason = reason;
    this.processedBy = processedBy;
    
    // Update status if fully refunded
    if (this.refundAmount >= this.amount) {
      this.status = 'refunded';
    }
    
    return await this.save();
  };
  
  return Payment;
}

// Helper function to generate payment number
async function generatePaymentNumber(sequelize) {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  // Get the last payment number for this month
  const lastPayment = await sequelize.models.Payment.findOne({
    where: {
      paymentNumber: {
        [sequelize.Sequelize.Op.like]: `PAY-${year}${month}-%`
      }
    },
    order: [['paymentNumber', 'DESC']]
  });
  
  let nextNumber = 1;
  if (lastPayment) {
    const lastNumber = parseInt(lastPayment.paymentNumber.split('-').pop());
    nextNumber = lastNumber + 1;
  }
  
  return `PAY-${year}${month}-${String(nextNumber).padStart(6, '0')}`;
}