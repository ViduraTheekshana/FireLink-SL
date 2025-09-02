import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  SupervisorAccount as SupervisorIcon,
  DirectionsCar as VehicleIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MyShifts = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [shifts, setShifts] = useState([]);
  const [error, setError] = useState('');
  
  // Change request dialog state
  const [showChangeRequestDialog, setShowChangeRequestDialog] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [changeRequestData, setChangeRequestData] = useState({
    newStartTime: '',
    newEndTime: '',
    reason: ''
  });
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState('');

  useEffect(() => {
    fetchMyShifts();
  }, []);

  const fetchMyShifts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/shifts/my-shifts');
      setShifts(response.data.data);
    } catch (error) {
      setError('Failed to fetch shifts');
      console.error('Error fetching shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestChange = (shift) => {
    setSelectedShift(shift);
    setChangeRequestData({
      newStartTime: shift.startTime.slice(0, 16), // Convert to datetime-local format
      newEndTime: shift.endTime.slice(0, 16),
      reason: ''
    });
    setShowChangeRequestDialog(true);
    setRequestError('');
    setRequestSuccess('');
  };

  const handleChangeRequestSubmit = async () => {
    if (!changeRequestData.reason.trim()) {
      setRequestError('Reason is required');
      return;
    }

    if (new Date(changeRequestData.newEndTime) <= new Date(changeRequestData.newStartTime)) {
      setRequestError('New end time must be after new start time');
      return;
    }

    setSubmittingRequest(true);
    setRequestError('');

    try {
      await axios.post('/api/v1/shift-change-requests', {
        shiftId: selectedShift._id,
        newStartTime: changeRequestData.newStartTime,
        newEndTime: changeRequestData.newEndTime,
        reason: changeRequestData.reason
      });

      setRequestSuccess('Change request submitted successfully! You will be notified once reviewed.');
      
      // Close dialog after 2 seconds
      setTimeout(() => {
        setShowChangeRequestDialog(false);
        setRequestSuccess('');
      }, 2000);

    } catch (error) {
      setRequestError(error.response?.data?.message || 'Failed to submit change request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'active': return 'success';
      case 'completed': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getRoleIcon = (role) => {
    return role === 'team_leader' ? <SupervisorIcon /> : <PersonIcon />;
  };

  const getRoleColor = (role) => {
    return role === 'team_leader' ? 'primary' : 'default';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          My Shifts
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ScheduleIcon />}
          onClick={() => navigate('/shifts/change-requests')}
        >
          View Change Requests
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {shifts.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No shifts assigned
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You don't have any shifts assigned at the moment.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {shifts.map((shift) => (
            <Grid item xs={12} md={6} key={shift._id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      {shift.title}
                    </Typography>
                    <Chip
                      label={shift.status}
                      color={getStatusColor(shift.status)}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <VehicleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {shift.vehicle.name} ({shift.vehicle.type})
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatDateTime(shift.startTime)} - {formatDateTime(shift.endTime)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getRoleIcon(shift.myRole)}
                    <Chip
                      label={shift.myRole.replace('_', ' ')}
                      color={getRoleColor(shift.myRole)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>

                  {shift.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {shift.description}
                    </Typography>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Created by: {shift.createdBy.name}
                    </Typography>
                    
                    {shift.status === 'scheduled' && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleRequestChange(shift)}
                      >
                        Request Change
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Change Request Dialog */}
      <Dialog
        open={showChangeRequestDialog}
        onClose={() => setShowChangeRequestDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Request Shift Change</DialogTitle>
        <DialogContent>
          {selectedShift && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Current Shift: {selectedShift.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current Time: {formatDateTime(selectedShift.startTime)} - {formatDateTime(selectedShift.endTime)}
              </Typography>
            </Box>
          )}

          {requestError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {requestError}
            </Alert>
          )}

          {requestSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {requestSuccess}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="New Start Time"
                type="datetime-local"
                value={changeRequestData.newStartTime}
                onChange={(e) => setChangeRequestData(prev => ({
                  ...prev,
                  newStartTime: e.target.value
                }))}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="New End Time"
                type="datetime-local"
                value={changeRequestData.newEndTime}
                onChange={(e) => setChangeRequestData(prev => ({
                  ...prev,
                  newEndTime: e.target.value
                }))}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason for Change"
                multiline
                rows={4}
                value={changeRequestData.reason}
                onChange={(e) => setChangeRequestData(prev => ({
                  ...prev,
                  reason: e.target.value
                }))}
                placeholder="Please provide a detailed reason for the shift change request..."
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowChangeRequestDialog(false)}
            disabled={submittingRequest}
          >
            Cancel
          </Button>
          <Button
            onClick={handleChangeRequestSubmit}
            variant="contained"
            disabled={submittingRequest || !changeRequestData.reason.trim()}
            startIcon={submittingRequest ? <CircularProgress size={20} /> : null}
          >
            {submittingRequest ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyShifts;
