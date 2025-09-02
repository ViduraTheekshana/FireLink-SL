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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  DirectionsCar as VehicleIcon,
  AccessTime as TimeIcon,
  Mail as MailIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ShiftDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [stats, setStats] = useState({
    totalShifts: 0,
    activeShifts: 0,
    pendingRequests: 0,
    unreadMessages: 0
  });
  const [recentShifts, setRecentShifts] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get user role
      const userResponse = await axios.get('/api/v1/auth/me');
      const user = userResponse.data.data;
      console.log('User data:', user);
      console.log('User roles:', user.roles);
      const isOfficer = user.roles.some(role => role.name === '1st_class_officer');
      console.log('Is officer:', isOfficer);
      setUserRole(isOfficer ? 'officer' : 'firefighter');

      if (isOfficer) {
        // Fetch officer dashboard data
        const [shiftsResponse, requestsResponse, messagesResponse] = await Promise.all([
          axios.get('/api/v1/shifts/all?limit=5'),
          axios.get('/api/v1/shift-change-requests/all?status=pending&limit=5'),
          axios.get('/api/v1/messages?isRead=false')
        ]);

        setStats({
          totalShifts: shiftsResponse.data.pagination?.total || 0,
          activeShifts: shiftsResponse.data.data.filter(shift => shift.status === 'active').length,
          pendingRequests: requestsResponse.data.data.length,
          unreadMessages: messagesResponse.data.unreadCount || 0
        });

        setRecentShifts(shiftsResponse.data.data);
        setRecentRequests(requestsResponse.data.data);
      } else {
        // Fetch firefighter dashboard data
        const [shiftsResponse, messagesResponse] = await Promise.all([
          axios.get('/api/v1/shifts/my-shifts'),
          axios.get('/api/v1/messages?isRead=false')
        ]);

        setStats({
          totalShifts: shiftsResponse.data.data.length,
          activeShifts: shiftsResponse.data.data.filter(shift => shift.status === 'active').length,
          pendingRequests: 0,
          unreadMessages: messagesResponse.data.unreadCount || 0
        });

        setRecentShifts(shiftsResponse.data.data.slice(0, 5));
      }

    } catch (error) {
      setError('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
    return role === 'team_leader' ? <PersonIcon color="primary" /> : <PersonIcon />;
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
      <Typography variant="h4" gutterBottom>
        Shift Management Dashboard
      </Typography>
      
      {/* Debug info */}
      <Alert severity="info" sx={{ mb: 2 }}>
        Debug: Current user role is: {userRole}
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Quick Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            {userRole === 'officer' && (
              <>
                <Grid item>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/shifts/create')}
                  >
                    Create Shift
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    startIcon={<AssignmentIcon />}
                    onClick={() => navigate('/shifts/change-requests')}
                  >
                    Manage Requests
                    {stats.pendingRequests > 0 && (
                      <Badge badgeContent={stats.pendingRequests} color="error" sx={{ ml: 1 }}>
                        <span />
                      </Badge>
                    )}
                  </Button>
                </Grid>
              </>
            )}
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<ScheduleIcon />}
                onClick={() => navigate('/shifts/my-shifts')}
              >
                My Shifts
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<MailIcon />}
                onClick={() => navigate('/shifts/messages')}
              >
                Messages
                {stats.unreadMessages > 0 && (
                  <Badge badgeContent={stats.unreadMessages} color="error" sx={{ ml: 1 }}>
                    <span />
                  </Badge>
                )}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.totalShifts}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Shifts
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.activeShifts}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Shifts
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {userRole === 'officer' && (
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WarningIcon color="warning" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{stats.pendingRequests}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Requests
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MailIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.unreadMessages}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Unread Messages
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Shifts */}
        <Grid item xs={12} md={userRole === 'officer' ? 6 : 12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recent Shifts
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/shifts/my-shifts')}
                >
                  View All
                </Button>
              </Box>
              
              {recentShifts.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No shifts found
                </Typography>
              ) : (
                <List dense>
                  {recentShifts.map((shift) => (
                    <ListItem key={shift._id} divider>
                      <ListItemIcon>
                        {userRole === 'firefighter' ? getRoleIcon(shift.myRole) : <ScheduleIcon />}
                      </ListItemIcon>
                      <ListItemText
                        primary={shift.title}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {formatDateTime(shift.startTime)} - {formatDateTime(shift.endTime)}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <VehicleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {shift.vehicle.name}
                              </Typography>
                              <Chip
                                label={shift.status}
                                color={getStatusColor(shift.status)}
                                size="small"
                              />
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Change Requests (Officer only) */}
        {userRole === 'officer' && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Pending Requests
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => navigate('/shifts/change-requests')}
                  >
                    View All
                  </Button>
                </Box>
                
                {recentRequests.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No pending requests
                  </Typography>
                ) : (
                  <List dense>
                    {recentRequests.map((request) => (
                      <ListItem key={request._id} divider>
                        <ListItemIcon>
                          <PersonIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={request.requestedBy.name}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {request.shift.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDateTime(request.createdAt)}
                              </Typography>
                            </Box>
                          }
                        />
                        <Chip
                          label="Pending"
                          color="warning"
                          size="small"
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ShiftDashboard;
