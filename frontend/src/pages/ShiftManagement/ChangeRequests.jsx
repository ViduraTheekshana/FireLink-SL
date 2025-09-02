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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  DirectionsCar as VehicleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ChangeRequests = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  
  // Response dialog state
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseData, setResponseData] = useState({
    action: '',
    comment: ''
  });
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [responseError, setResponseError] = useState('');
  const [responseSuccess, setResponseSuccess] = useState('');

  // Filter state
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchChangeRequests();
  }, [statusFilter]);

  const fetchChangeRequests = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await axios.get('/api/v1/shift-change-requests/all', { params });
      setRequests(response.data.data);
    } catch (error) {
      setError('Failed to fetch change requests');
      console.error('Error fetching change requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToRequest = (request) => {
    setSelectedRequest(request);
    setResponseData({
      action: '',
      comment: ''
    });
    setShowResponseDialog(true);
    setResponseError('');
    setResponseSuccess('');
  };

  const handleResponseSubmit = async () => {
    if (!responseData.action) {
      setResponseError('Please select an action');
      return;
    }

    setSubmittingResponse(true);
    setResponseError('');

    try {
      await axios.put(`/api/v1/shift-change-requests/${selectedRequest._id}/respond`, {
        action: responseData.action,
        comment: responseData.comment
      });

      setResponseSuccess(`Request ${responseData.action}d successfully!`);
      
      // Refresh the requests list
      await fetchChangeRequests();
      
      // Close dialog after 2 seconds
      setTimeout(() => {
        setShowResponseDialog(false);
        setResponseSuccess('');
      }, 2000);

    } catch (error) {
      setResponseError(error.response?.data?.message || 'Failed to respond to request');
    } finally {
      setSubmittingResponse(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <ApproveIcon />;
      case 'rejected': return <RejectIcon />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, margin: '0 auto', padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Change Requests
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/shifts')}
        >
          Back to Shifts
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Typography variant="subtitle1">Filter by status:</Typography>
            </Grid>
            <Grid item>
              <Button
                variant={statusFilter === 'all' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setStatusFilter('all')}
              >
                All ({requests.length})
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant={statusFilter === 'pending' ? 'contained' : 'outlined'}
                size="small"
                color="warning"
                onClick={() => setStatusFilter('pending')}
              >
                Pending ({requests.filter(r => r.status === 'pending').length})
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant={statusFilter === 'approved' ? 'contained' : 'outlined'}
                size="small"
                color="success"
                onClick={() => setStatusFilter('approved')}
              >
                Approved ({requests.filter(r => r.status === 'approved').length})
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant={statusFilter === 'rejected' ? 'contained' : 'outlined'}
                size="small"
                color="error"
                onClick={() => setStatusFilter('rejected')}
              >
                Rejected ({requests.filter(r => r.status === 'rejected').length})
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {requests.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No change requests found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {statusFilter === 'all' 
                ? 'There are no change requests at the moment.'
                : `There are no ${statusFilter} change requests.`
              }
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Firefighter</TableCell>
                <TableCell>Shift</TableCell>
                <TableCell>Current Time</TableCell>
                <TableCell>Requested Time</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {request.requestedBy.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          @{request.requestedBy.username}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {request.shift.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <VehicleIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {request.shift.vehicle?.name || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {formatDateTime(request.shift.startTime)}
                    </Typography>
                    <Typography variant="body2">
                      {formatDateTime(request.shift.endTime)}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {formatDateTime(request.newStartTime)}
                    </Typography>
                    <Typography variant="body2">
                      {formatDateTime(request.newEndTime)}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        maxWidth: 200, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={request.reason}
                    >
                      {request.reason}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={request.status}
                      color={getStatusColor(request.status)}
                      icon={getStatusIcon(request.status)}
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {formatDateTime(request.createdAt)}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleRespondToRequest(request)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {request.status === 'pending' && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => {
                                setSelectedRequest(request);
                                setResponseData({ action: 'approve', comment: '' });
                                setShowResponseDialog(true);
                                setResponseError('');
                                setResponseSuccess('');
                              }}
                            >
                              <ApproveIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setSelectedRequest(request);
                                setResponseData({ action: 'reject', comment: '' });
                                setShowResponseDialog(true);
                                setResponseError('');
                                setResponseSuccess('');
                              }}
                            >
                              <RejectIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Response Dialog */}
      <Dialog
        open={showResponseDialog}
        onClose={() => setShowResponseDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {responseData.action === 'approve' ? 'Approve' : responseData.action === 'reject' ? 'Reject' : 'Respond to'} Change Request
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Request Details
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Firefighter"
                    secondary={`${selectedRequest.requestedBy.name} (@${selectedRequest.requestedBy.username})`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="Shift"
                    secondary={selectedRequest.shift.title}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="Current Time"
                    secondary={`${formatDateTime(selectedRequest.shift.startTime)} - ${formatDateTime(selectedRequest.shift.endTime)}`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="Requested Time"
                    secondary={`${formatDateTime(selectedRequest.newStartTime)} - ${formatDateTime(selectedRequest.newEndTime)}`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="Reason"
                    secondary={selectedRequest.reason}
                  />
                </ListItem>
              </List>
              
              <Divider sx={{ my: 2 }} />
            </Box>
          )}

          {responseError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {responseError}
            </Alert>
          )}

          {responseSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {responseSuccess}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Comment (Optional)"
            multiline
            rows={4}
            value={responseData.comment}
            onChange={(e) => setResponseData(prev => ({
              ...prev,
              comment: e.target.value
            }))}
            placeholder="Add a comment explaining your decision..."
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowResponseDialog(false)}
            disabled={submittingResponse}
          >
            Cancel
          </Button>
          <Button
            onClick={handleResponseSubmit}
            variant="contained"
            color={responseData.action === 'approve' ? 'success' : 'error'}
            disabled={submittingResponse || !responseData.action}
            startIcon={submittingResponse ? <CircularProgress size={20} /> : null}
          >
            {submittingResponse ? 'Processing...' : `${responseData.action === 'approve' ? 'Approve' : 'Reject'} Request`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChangeRequests;
