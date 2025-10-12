import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
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
        toast.success(result.message || 'Application approved successfully!');
        return { success: true };
      } else {
        toast.error(`Error approving application: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error(`Failed to approve application: ${error.message}`);
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
        toast.success(result.message || 'Application rejected successfully!');
        return { success: true };
      } else {
        toast.error(`Error rejecting application: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error(`Failed to reject application: ${error.message}`);
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
        toast.success(result.message || 'Application deleted successfully!');
        return { success: true };
      } else {
        toast.error(`Error deleting application: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error(`Failed to delete application: ${error.message}`);
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
        toast.success(result.message || 'Payment assigned successfully!');
        return { success: true };
      } else {
        toast.error(`Error assigning payment: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error(`Failed to assign payment: ${error.message}`);
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
        toast.success(result.message || 'Inspection notes added successfully!');
        return { success: true };
      } else {
        toast.error(`Error adding inspection notes: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error(`Failed to add inspection notes: ${error.message}`);
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
        toast.success(result.message || 'Application marked as inspected!');
        return { success: true };
      } else {
        toast.error(`Error marking as inspected: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error(`Failed to mark as inspected: ${error.message}`);
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
        toast.success(result.message || 'Application reactivated successfully!');
        return { success: true };
      } else {
        toast.error(`Error reactivating application: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error(`Failed to reactivate application: ${error.message}`);
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