'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Guests', 'isBlacklisted', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Guests', 'isBlacklisted');
  }
};
