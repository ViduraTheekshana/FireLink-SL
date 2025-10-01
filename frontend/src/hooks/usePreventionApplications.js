import { useState, useEffect, useCallback } from 'react';
import preventionCertificateAPI from '../services/preventionCertificateAPI';

// Custom hook for managing prevention applications
export const usePreventionApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Show notification helper
  const showNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    const notification = {
      id,
      message,
      type,
      timestamp: new Date().toLocaleTimeString(),
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only 5 notifications

    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  // Remove notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Fetch applications from API
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const result = await preventionCertificateAPI.getAllApplications();
      if (result.success) {
        setApplications(result.data);
        setError(null);
      } else {
        setError(result.error);
        showNotification(`Error loading applications: ${result.error}`, 'error');
      }
    } catch (err) {
      setError(err.message);
      showNotification(`Failed to load applications: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Approve application
  const approveApplication = useCallback(async (id) => {
    try {
      const result = await preventionCertificateAPI.approveApplication(id);
      if (result.success) {
        setApplications(prev => prev.map(app => 
          app._id === id ? result.data : app
        ));
        showNotification(result.message || 'Application approved successfully!', 'success');
        return { success: true };
      } else {
        showNotification(`Error approving application: ${result.error}`, 'error');
        return { success: false, error: result.error };
      }
    } catch (error) {
      showNotification(`Failed to approve application: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }, [showNotification]);

  // Reject application
  const rejectApplication = useCallback(async (id, rejectionReason) => {
    try {
      const result = await preventionCertificateAPI.rejectApplication(id, rejectionReason);
      if (result.success) {
        setApplications(prev => prev.map(app => 
          app._id === id ? result.data : app
        ));
        showNotification(result.message || 'Application rejected successfully!', 'success');
        return { success: true };
      } else {
        showNotification(`Error rejecting application: ${result.error}`, 'error');
        return { success: false, error: result.error };
      }
    } catch (error) {
      showNotification(`Failed to reject application: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }, [showNotification]);

  // Delete application - ACTUALLY REMOVES FROM DATABASE
  const deleteApplication = useCallback(async (id) => {
    try {
      const result = await preventionCertificateAPI.deleteApplication(id);
      if (result.success) {
        // Remove from local state
        setApplications(prev => prev.filter(app => app._id !== id));
        showNotification(result.message || 'Application deleted successfully!', 'success');
        return { success: true };
      } else {
        showNotification(`Error deleting application: ${result.error}`, 'error');
        return { success: false, error: result.error };
      }
    } catch (error) {
      showNotification(`Failed to delete application: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }, [showNotification]);

  // Assign payment
  const assignPayment = useCallback(async (id, payment) => {
    try {
      const result = await preventionCertificateAPI.updateToPaymentAssigned(id, payment);
      if (result.success) {
        setApplications(prev => prev.map(app => 
          app._id === id ? result.data : app
        ));
        showNotification(result.message || 'Payment assigned successfully!', 'success');
        return { success: true };
      } else {
        showNotification(`Error assigning payment: ${result.error}`, 'error');
        return { success: false, error: result.error };
      }
    } catch (error) {
      showNotification(`Failed to assign payment: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }, [showNotification]);

  // Add inspection notes
  const addInspectionNotes = useCallback(async (id, inspectionNotes) => {
    try {
      const result = await preventionCertificateAPI.addInspectionNotes(id, inspectionNotes);
      if (result.success) {
        setApplications(prev => prev.map(app => 
          app._id === id ? result.data : app
        ));
        showNotification(result.message || 'Inspection notes added successfully!', 'success');
        return { success: true };
      } else {
        showNotification(`Error adding inspection notes: ${result.error}`, 'error');
        return { success: false, error: result.error };
      }
    } catch (error) {
      showNotification(`Failed to add inspection notes: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }, [showNotification]);

  // Mark as inspected
  const markAsInspected = useCallback(async (id, inspectionNotes) => {
    try {
      const result = await preventionCertificateAPI.markAsInspected(id, inspectionNotes);
      if (result.success) {
        setApplications(prev => prev.map(app => 
          app._id === id ? result.data : app
        ));
        showNotification(result.message || 'Application marked as inspected!', 'success');
        return { success: true };
      } else {
        showNotification(`Error marking as inspected: ${result.error}`, 'error');
        return { success: false, error: result.error };
      }
    } catch (error) {
      showNotification(`Failed to mark as inspected: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }, [showNotification]);

  // Reactivate rejected application
  const reactivateApplication = useCallback(async (id) => {
    try {
      const result = await preventionCertificateAPI.reactivateApplication(id);
      if (result.success) {
        setApplications(prev => prev.map(app => 
          app._id === id ? result.data : app
        ));
        showNotification(result.message || 'Application reactivated successfully!', 'success');
        return { success: true };
      } else {
        showNotification(`Error reactivating application: ${result.error}`, 'error');
        return { success: false, error: result.error };
      }
    } catch (error) {
      showNotification(`Failed to reactivate application: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }, [showNotification]);

  // Computed values
  const pendingApplications = applications.filter(app => app.status === 'Pending');
  const approvedApplications = applications.filter(app => app.status === 'Approved');
  const rejectedApplications = applications.filter(app => app.status === 'Rejected');
  const paymentAssignedApplications = applications.filter(app => app.status === 'Payment Assigned');
  const inspectedApplications = applications.filter(app => app.status === 'Inspected');

  // Initialize on mount
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return {
    // State
    applications,
    loading,
    error,
    notifications,
    
    // Computed values
    pendingApplications,
    approvedApplications,
    rejectedApplications,
    paymentAssignedApplications,
    inspectedApplications,
    
    // Actions
    fetchApplications,
    approveApplication,
    rejectApplication,
    deleteApplication,
    assignPayment,
    addInspectionNotes,
    markAsInspected,
    reactivateApplication,
    
    // Notification actions
    showNotification,
    removeNotification,
  };
};

export default usePreventionApplications;