'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Tasks', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      department: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      itemName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      startTime: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Format: HH:mm',
      },
      endTime: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Format: HH:mm',
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'scheduled',
      },
      assignedStaff: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Comma-separated staff names',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('Tasks', ['department'], {
      name: 'idx_tasks_department',
    });
    await queryInterface.addIndex('Tasks', ['date'], {
      name: 'idx_tasks_date',
    });
    await queryInterface.addIndex('Tasks', ['status'], {
      name: 'idx_tasks_status',
    });
    await queryInterface.addIndex('Tasks', ['department', 'date'], {
      name: 'idx_tasks_department_date',
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes first
    await queryInterface.removeIndex('Tasks', 'idx_tasks_department');
    await queryInterface.removeIndex('Tasks', 'idx_tasks_date');
    await queryInterface.removeIndex('Tasks', 'idx_tasks_status');
    await queryInterface.removeIndex('Tasks', 'idx_tasks_department_date');
    
    // Drop the table
    await queryInterface.dropTable('Tasks');
  },
};

