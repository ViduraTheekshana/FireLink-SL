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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper
} from '@mui/material';
import {
  Mail as MailIcon,
  MailOutline as UnreadIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkReadIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Person as PersonIcon,
  DirectionsCar as VehicleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Messages = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState('');
  
  // Filter state
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Message detail dialog
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  
  // Send message dialog (for officers)
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [sendMessageData, setSendMessageData] = useState({
    recipientId: '',
    subject: '',
    content: '',
    type: 'general'
  });
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sendSuccess, setSendSuccess] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);

  useEffect(() => {
    fetchMessages();
  }, [filter, typeFilter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') params.isRead = filter === 'read';
      if (typeFilter !== 'all') params.type = typeFilter;
      
      const response = await axios.get('/api/v1/messages', { params });
      setMessages(response.data.data);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      setError('Failed to fetch messages');
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await axios.get('/api/v1/users');
      setAvailableUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleMessageClick = async (message) => {
    setSelectedMessage(message);
    setShowMessageDialog(true);
    
    // Mark as read if not already read
    if (!message.isRead) {
      try {
        await axios.put(`/api/v1/messages/${message._id}/read`);
        // Update local state
        setMessages(prev => prev.map(msg => 
          msg._id === message._id ? { ...msg, isRead: true } : msg
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put('/api/v1/messages/mark-all-read');
      setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all messages as read:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`/api/v1/messages/${messageId}`);
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      if (selectedMessage && selectedMessage._id === messageId) {
        setShowMessageDialog(false);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!sendMessageData.recipientId || !sendMessageData.subject || !sendMessageData.content) {
      setSendError('All fields are required');
      return;
    }

    setSendingMessage(true);
    setSendError('');

    try {
      await axios.post('/api/v1/messages/send', sendMessageData);
      setSendSuccess('Message sent successfully!');
      
      // Reset form
      setSendMessageData({
        recipientId: '',
        subject: '',
        content: '',
        type: 'general'
      });
      
      // Close dialog after 2 seconds
      setTimeout(() => {
        setShowSendDialog(false);
        setSendSuccess('');
      }, 2000);

    } catch (error) {
      setSendError(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString();
  };

  const getMessageIcon = (type) => {
    switch (type) {
      case 'shift_created': return <ScheduleIcon />;
      case 'change_requested': return <MailIcon />;
      case 'request_approved': return <ApproveIcon />;
      case 'request_rejected': return <RejectIcon />;
      default: return <MailIcon />;
    }
  };

  const getMessageColor = (type) => {
    switch (type) {
      case 'shift_created': return 'primary';
      case 'change_requested': return 'warning';
      case 'request_approved': return 'success';
      case 'request_rejected': return 'error';
      default: return 'default';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'shift_created': return 'Shift Assignment';
      case 'change_requested': return 'Change Request';
      case 'request_approved': return 'Request Approved';
      case 'request_rejected': return 'Request Rejected';
      default: return 'General';
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
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Messages
          {unreadCount > 0 && (
            <Badge badgeContent={unreadCount} color="error" sx={{ ml: 2 }}>
              <MailIcon />
            </Badge>
          )}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => {
              fetchAvailableUsers();
              setShowSendDialog(true);
            }}
            startIcon={<SendIcon />}
          >
            Send Message
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outlined"
              onClick={handleMarkAllAsRead}
              startIcon={<MarkReadIcon />}
            >
              Mark All Read
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Typography variant="subtitle1">Filters:</Typography>
            </Grid>
            <Grid item>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Read Status</InputLabel>
                <Select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  label="Read Status"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="unread">Unread</MenuItem>
                  <MenuItem value="read">Read</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Message Type</InputLabel>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  label="Message Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="shift_created">Shift Assignment</MenuItem>
                  <MenuItem value="change_requested">Change Request</MenuItem>
                  <MenuItem value="request_approved">Request Approved</MenuItem>
                  <MenuItem value="request_rejected">Request Rejected</MenuItem>
                  <MenuItem value="general">General</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {messages.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <MailIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No messages found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You don't have any messages at the moment.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <List>
          {messages.map((message) => (
            <React.Fragment key={message._id}>
              <ListItem
                button
                onClick={() => handleMessageClick(message)}
                sx={{
                  backgroundColor: message.isRead ? 'transparent' : 'action.hover',
                  '&:hover': {
                    backgroundColor: 'action.selected'
                  }
                }}
              >
                <ListItemIcon>
                  {message.isRead ? (
                    <MailIcon color="disabled" />
                  ) : (
                    <UnreadIcon color="primary" />
                  )}
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: message.isRead ? 'normal' : 'bold' }}
                      >
                        {message.subject}
                      </Typography>
                      <Chip
                        label={getTypeLabel(message.type)}
                        color={getMessageColor(message.type)}
                        size="small"
                        icon={getMessageIcon(message.type)}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        From: {message.sender.name} • {formatDateTime(message.createdAt)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: 600
                        }}
                      >
                        {message.content}
                      </Typography>
                    </Box>
                  }
                />
                
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMessage(message._id);
                    }}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      )}

      {/* Message Detail Dialog */}
      <Dialog
        open={showMessageDialog}
        onClose={() => setShowMessageDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedMessage?.subject}
        </DialogTitle>
        <DialogContent>
          {selectedMessage && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Chip
                  label={getTypeLabel(selectedMessage.type)}
                  color={getMessageColor(selectedMessage.type)}
                  icon={getMessageIcon(selectedMessage.type)}
                />
                <Typography variant="body2" color="text.secondary">
                  From: {selectedMessage.sender.name} • {formatDateTime(selectedMessage.createdAt)}
                </Typography>
              </Box>
              
              <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedMessage.content}
                </Typography>
              </Paper>
              
              {selectedMessage.relatedShift && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Related Shift:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon color="primary" />
                    <Typography variant="body2">
                      {selectedMessage.relatedShift.title}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowMessageDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog
        open={showSendDialog}
        onClose={() => setShowSendDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Send Message</DialogTitle>
        <DialogContent>
          {sendError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {sendError}
            </Alert>
          )}

          {sendSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {sendSuccess}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Recipient</InputLabel>
                <Select
                  value={sendMessageData.recipientId}
                  onChange={(e) => setSendMessageData(prev => ({
                    ...prev,
                    recipientId: e.target.value
                  }))}
                  label="Recipient"
                >
                  {availableUsers.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.name} (@{user.username})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject"
                value={sendMessageData.subject}
                onChange={(e) => setSendMessageData(prev => ({
                  ...prev,
                  subject: e.target.value
                }))}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                multiline
                rows={4}
                value={sendMessageData.content}
                onChange={(e) => setSendMessageData(prev => ({
                  ...prev,
                  content: e.target.value
                }))}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowSendDialog(false)}
            disabled={sendingMessage}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendMessage}
            variant="contained"
            disabled={sendingMessage}
            startIcon={sendingMessage ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {sendingMessage ? 'Sending...' : 'Send Message'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Messages;
