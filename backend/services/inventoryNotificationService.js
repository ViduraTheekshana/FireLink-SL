const Inventory = require('../models/Inventory');
const InventoryLog = require('../models/InventoryLog');

class InventoryNotificationService {
  /**
   * Check for low stock items and create notifications
   */
  static async checkLowStockItems() {
    try {
      const lowStockItems = await Inventory.findLowStock();
      
      if (lowStockItems.length === 0) {
        return { message: 'No low stock items found', count: 0 };
      }

      // Create log entries for low stock alerts
      const logPromises = lowStockItems.map(item => {
        const log = new InventoryLog({
          action: 'STOCK_CHANGE',
          itemId: item._id,
          itemName: item.item_name,
          itemCategory: item.category,
          description: `Low stock alert: ${item.item_name} - Current: ${item.quantity}, Threshold: ${item.threshold}`,
          performedBy: 'system',
          performedByName: 'System Alert',
          quantityChange: 0,
          timestamp: new Date()
        });
        return log.save();
      });

      await Promise.all(logPromises);

      return {
        message: `Found ${lowStockItems.length} low stock items`,
        count: lowStockItems.length,
        items: lowStockItems.map(item => ({
          id: item._id,
          name: item.item_name,
          category: item.category,
          quantity: item.quantity,
          threshold: item.threshold,
          location: item.location
        }))
      };
    } catch (error) {
      console.error('Error checking low stock items:', error);
      throw error;
    }
  }

  /**
   * Check for expired items and create notifications
   */
  static async checkExpiredItems() {
    try {
      const expiredItems = await Inventory.findExpired();
      
      if (expiredItems.length === 0) {
        return { message: 'No expired items found', count: 0 };
      }

      // Create log entries for expired items
      const logPromises = expiredItems.map(item => {
        const log = new InventoryLog({
          action: 'STOCK_CHANGE',
          itemId: item._id,
          itemName: item.item_name,
          itemCategory: item.category,
          description: `Expired item alert: ${item.item_name} - Expired on: ${item.expire_date}`,
          performedBy: 'system',
          performedByName: 'System Alert',
          quantityChange: 0,
          timestamp: new Date()
        });
        return log.save();
      });

      await Promise.all(logPromises);

      return {
        message: `Found ${expiredItems.length} expired items`,
        count: expiredItems.length,
        items: expiredItems.map(item => ({
          id: item._id,
          name: item.item_name,
          category: item.category,
          quantity: item.quantity,
          expire_date: item.expire_date,
          location: item.location
        }))
      };
    } catch (error) {
      console.error('Error checking expired items:', error);
      throw error;
    }
  }

  /**
   * Check for items approaching expiry (within 30 days)
   */
  static async checkItemsApproachingExpiry() {
    try {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const approachingExpiryItems = await Inventory.find({
        expire_date: {
          $gte: new Date(),
          $lte: thirtyDaysFromNow
        }
      });

      if (approachingExpiryItems.length === 0) {
        return { message: 'No items approaching expiry', count: 0 };
      }

      // Create log entries for approaching expiry
      const logPromises = approachingExpiryItems.map(item => {
        const daysUntilExpiry = Math.ceil((item.expire_date - new Date()) / (1000 * 60 * 60 * 24));
        
        const log = new InventoryLog({
          action: 'STOCK_CHANGE',
          itemId: item._id,
          itemName: item.item_name,
          itemCategory: item.category,
          description: `Expiry warning: ${item.item_name} expires in ${daysUntilExpiry} days`,
          performedBy: 'system',
          performedByName: 'System Alert',
          quantityChange: 0,
          timestamp: new Date()
        });
        return log.save();
      });

      await Promise.all(logPromises);

      return {
        message: `Found ${approachingExpiryItems.length} items approaching expiry`,
        count: approachingExpiryItems.length,
        items: approachingExpiryItems.map(item => {
          const daysUntilExpiry = Math.ceil((item.expire_date - new Date()) / (1000 * 60 * 60 * 24));
          return {
            id: item._id,
            name: item.item_name,
            category: item.category,
            quantity: item.quantity,
            expire_date: item.expire_date,
            daysUntilExpiry,
            location: item.location
          };
        })
      };
    } catch (error) {
      console.error('Error checking items approaching expiry:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive inventory health report
   */
  static async getInventoryHealthReport() {
    try {
      const [lowStockItems, expiredItems, approachingExpiryItems] = await Promise.all([
        this.checkLowStockItems(),
        this.checkExpiredItems(),
        this.checkItemsApproachingExpiry()
      ]);

      return {
        timestamp: new Date(),
        summary: {
          totalLowStock: lowStockItems.count,
          totalExpired: expiredItems.count,
          totalApproachingExpiry: approachingExpiryItems.count,
          totalAlerts: lowStockItems.count + expiredItems.count + approachingExpiryItems.count
        },
        details: {
          lowStock: lowStockItems,
          expired: expiredItems,
          approachingExpiry: approachingExpiryItems
        }
      };
    } catch (error) {
      console.error('Error generating inventory health report:', error);
      throw error;
    }
  }

  /**
   * Send email notifications (placeholder for future implementation)
   */
  static async sendEmailNotification(recipients, subject, content) {
    // TODO: Implement email sending logic
    console.log('Email notification would be sent:', { recipients, subject, content });
    return { success: true, message: 'Email notification logged (not yet implemented)' };
  }

  /**
   * Send SMS notifications (placeholder for future implementation)
   */
  static async sendSMSNotification(phoneNumbers, message) {
    // TODO: Implement SMS sending logic
    console.log('SMS notification would be sent:', { phoneNumbers, message });
    return { success: true, message: 'SMS notification logged (not yet implemented)' };
  }
}

module.exports = InventoryNotificationService;
