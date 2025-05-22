// src/components/leads/LeadForm.tsx
import React, { useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select, 
  CircularProgress,
  Alert
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { createLead, updateLead, fetchLeadById, clearSelectedLead, clearLeadError } from '../../redux/slices/leadSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { Lead } from '../../types';

const LeadForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { selectedLead, isLoading, error } = useSelector((state: RootState) => state.leads);

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchLeadById(parseInt(id)));
    }

    return () => {
      dispatch(clearSelectedLead());
    };
  }, [dispatch, id, isEditMode]);

  const initialValues: Partial<Lead> = {
    first_name: selectedLead?.first_name || '',
    last_name: selectedLead?.last_name || '',
    email: selectedLead?.email || '',
    phone_number: selectedLead?.phone_number || '',
    lead_source: selectedLead?.lead_source || '',
    language_preference: selectedLead?.language_preference || 'english',
    status: selectedLead?.status || 'new',
    notes: selectedLead?.notes || '',
  };

  const validationSchema = Yup.object({
    first_name: Yup.string().required('First name is required'),
    last_name: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    phone_number: Yup.string()
      .matches(/^\+?[0-9]{10,15}$/, 'Phone number must be between 10-15 digits')
      .required('Phone number is required'),
    language_preference: Yup.string().required('Language preference is required'),
    status: Yup.string().required('Status is required'),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (isEditMode && id) {
        const resultAction = await dispatch(updateLead({ id: parseInt(id), leadData: values }));
        if (updateLead.fulfilled.match(resultAction)) {
          navigate('/leads');
        }
      } else {
        const resultAction = await dispatch(createLead(values));
        if (createLead.fulfilled.match(resultAction)) {
          navigate('/leads');
        }
      }
    },
  });

  if (isLoading && isEditMode && !selectedLead) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{isEditMode ? 'Edit Lead' : 'Add New Lead'}</Typography>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => dispatch(clearLeadError())}
        >
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="first_name"
                name="first_name"
                label="First Name"
                value={formik.values.first_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                helperText={formik.touched.first_name && formik.errors.first_name}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="last_name"
                name="last_name"
                label="Last Name"
                value={formik.values.last_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                helperText={formik.touched.last_name && formik.errors.last_name}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="phone_number"
                name="phone_number"
                label="Phone Number"
                value={formik.values.phone_number}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phone_number && Boolean(formik.errors.phone_number)}
                helperText={formik.touched.phone_number && formik.errors.phone_number}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="lead_source"
                name="lead_source"
                label="Lead Source"
                value={formik.values.lead_source}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.lead_source && Boolean(formik.errors.lead_source)}
                helperText={formik.touched.lead_source && formik.errors.lead_source}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="language-preference-label">Language Preference</InputLabel>
                <Select
                  labelId="language-preference-label"
                  id="language_preference"
                  name="language_preference"
                  value={formik.values.language_preference}
                  label="Language Preference"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.language_preference && Boolean(formik.errors.language_preference)}
                >
                  <MenuItem value="english">English</MenuItem>
                  <MenuItem value="hindi">Hindi</MenuItem>
                  <MenuItem value="tamil">Tamil</MenuItem>
                  <MenuItem value="telugu">Telugu</MenuItem>
                  <MenuItem value="kannada">Kannada</MenuItem>
                  <MenuItem value="malayalam">Malayalam</MenuItem>
                  <MenuItem value="marathi">Marathi</MenuItem>
                  <MenuItem value="bengali">Bengali</MenuItem>
                  <MenuItem value="gujarati">Gujarati</MenuItem>
                  <MenuItem value="punjabi">Punjabi</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formik.values.status}
                  label="Status"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.status && Boolean(formik.errors.status)}
                >
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="contacted">Contacted</MenuItem>
                  <MenuItem value="qualified">Qualified</MenuItem>
                  <MenuItem value="converted">Converted</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="notes"
                name="notes"
                label="Notes"
                multiline
                rows={4}
                value={formik.values.notes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
                helperText={formik.touched.notes && formik.errors.notes}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/leads')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : isEditMode ? 'Update Lead' : 'Add Lead'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default LeadForm;
