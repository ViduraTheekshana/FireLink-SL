import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  SupervisorAccount as SupervisorIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateShift = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    vehicleId: '',
    crewMembers: []
  });
  
  // Available data
  const [vehicles, setVehicles] = useState([]);
  const [availableFirefighters, setAvailableFirefighters] = useState([]);
  const [selectedFirefighters, setSelectedFirefighters] = useState([]);
  
  // UI state
  const [showFirefighterDialog, setShowFirefighterDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchVehicles();
    fetchAvailableFirefighters();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get('/api/v1/vehicles');
      setVehicles(response.data.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchAvailableFirefighters = async () => {
    try {
      const response = await axios.get('/api/v1/users/firefighters');
      setAvailableFirefighters(response.data.data);
    } catch (error) {
      console.error('Error fetching firefighters:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const addCrewMember = (firefighter, role) => {
    const newMember = {
      userId: firefighter._id,
      role: role,
      name: firefighter.name,
      username: firefighter.username
    };
    
    setFormData(prev => ({
      ...prev,
      crewMembers: [...prev.crewMembers, newMember]
    }));
    
    setSelectedFirefighters(prev => [...prev, firefighter._id]);
    setShowFirefighterDialog(false);
  };

  const removeCrewMember = (index) => {
    const removedMember = formData.crewMembers[index];
    setFormData(prev => ({
      ...prev,
      crewMembers: prev.crewMembers.filter((_, i) => i !== index)
    }));
    
    setSelectedFirefighters(prev => 
      prev.filter(id => id !== removedMember.userId)
    );
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.startTime) {
      errors.startTime = 'Start time is required';
    }
    
    if (!formData.endTime) {
      errors.endTime = 'End time is required';
    } else if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      errors.endTime = 'End time must be after start time';
    }
    
    if (!formData.vehicleId) {
      errors.vehicleId = 'Vehicle is required';
    }
    
    if (formData.crewMembers.length < 8) {
      errors.crewMembers = 'Minimum 8 crew members required';
    }
    
    const teamLeaders = formData.crewMembers.filter(member => member.role === 'team_leader');
    if (teamLeaders.length !== 1) {
      errors.crewMembers = 'Exactly one team leader is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post('/api/v1/shifts', {
        title: formData.title,
        description: formData.description,
        startTime: formData.startTime,
        endTime: formData.endTime,
        vehicleId: formData.vehicleId,
        crewMembers: formData.crewMembers.map(member => ({
          userId: member.userId,
          role: member.role
        }))
      });
      
      setSuccess('Shift created successfully! Notifications sent to all crew members.');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        vehicleId: '',
        crewMembers: []
      });
      setSelectedFirefighters([]);
      
      // Navigate to shifts list after 2 seconds
      setTimeout(() => {
        navigate('/shifts');
      }, 2000);
      
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create shift');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableFirefighters = () => {
    return availableFirefighters.filter(firefighter => 
      !selectedFirefighters.includes(firefighter._id)
    );
  };

  const getCrewValidationStatus = () => {
    const count = formData.crewMembers.length;
    const teamLeaders = formData.crewMembers.filter(member => member.role === 'team_leader').length;
    
    if (count < 8) {
      return { status: 'error', message: `Need ${8 - count} more crew members` };
    } else if (teamLeaders !== 1) {
      return { status: 'warning', message: teamLeaders === 0 ? 'Need 1 team leader' : 'Only 1 team leader allowed' };
    } else {
      return { status: 'success', message: 'Crew requirements met' };
    }
  };

  const crewStatus = getCrewValidationStatus();

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Create New Shift
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Shift Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Shift Title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  error={!!validationErrors.title}
                  helperText={validationErrors.title}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!validationErrors.vehicleId}>
                  <InputLabel>Vehicle</InputLabel>
                  <Select
                    value={formData.vehicleId}
                    onChange={(e) => handleInputChange('vehicleId', e.target.value)}
                    label="Vehicle"
                  >
                    {vehicles.map((vehicle) => (
                      <MenuItem key={vehicle._id} value={vehicle._id}>
                        {vehicle.name} ({vehicle.type}) - Capacity: {vehicle.capacity}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Start Time"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  error={!!validationErrors.startTime}
                  helperText={validationErrors.startTime}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="End Time"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  error={!!validationErrors.endTime}
                  helperText={validationErrors.endTime}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </Grid>
              
              {/* Crew Management */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Crew Members ({formData.crewMembers.length}/8+)
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setShowFirefighterDialog(true)}
                    disabled={getAvailableFirefighters().length === 0}
                  >
                    Add Crew Member
                  </Button>
                </Box>
                
                <Alert 
                  severity={crewStatus.status} 
                  sx={{ mb: 2 }}
                >
                  {crewStatus.message}
                </Alert>
                
                {validationErrors.crewMembers && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {validationErrors.crewMembers}
                  </Alert>
                )}
                
                <List>
                  {formData.crewMembers.map((member, index) => (
                    <ListItem key={index} divider>
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                        {member.role === 'team_leader' ? (
                          <SupervisorIcon color="primary" />
                        ) : (
                          <PersonIcon />
                        )}
                      </Box>
                      <ListItemText
                        primary={member.name}
                        secondary={`@${member.username} - ${member.role.replace('_', ' ')}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => removeCrewMember(index)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Grid>
              
              {/* Submit Button */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/shifts')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || formData.crewMembers.length < 8}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                  >
                    {loading ? 'Creating...' : 'Create Shift'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
      
      {/* Add Firefighter Dialog */}
      <Dialog
        open={showFirefighterDialog}
        onClose={() => setShowFirefighterDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Crew Member</DialogTitle>
        <DialogContent>
          <List>
            {getAvailableFirefighters().map((firefighter) => (
              <ListItem key={firefighter._id} divider>
                <ListItemText
                  primary={firefighter.name}
                  secondary={`@${firefighter.username}`}
                />
                <ListItemSecondaryAction>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => addCrewMember(firefighter, 'firefighter')}
                    sx={{ mr: 1 }}
                  >
                    Add as Firefighter
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => addCrewMember(firefighter, 'team_leader')}
                    disabled={formData.crewMembers.some(member => member.role === 'team_leader')}
                  >
                    Add as Team Leader
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFirefighterDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateShift;
