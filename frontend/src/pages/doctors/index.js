import { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Avatar, 
  CardActions, 
  CircularProgress,
  TextField,
  InputAdornment,
  Box,
  Chip
} from '@mui/material';
import { Search as SearchIcon, LocationOn, MedicalServices } from '@mui/icons-material';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import { userService } from '../../services/api';
import { useRouter } from 'next/router';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchDoctors() {
      try {
        setLoading(true);
        const response = await userService.getDoctors();
        setDoctors(response.doctors || []);
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
        setError('Failed to load doctors. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(doctor => {
    const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const handleSchedule = (doctorId) => {
    router.push({
      pathname: '/appointments/schedule',
      query: { doctorId },
    });
  };

  // Placeholder specialties for demonstration
  const getRandomSpecialties = () => {
    const specialties = [
      'Family Medicine', 'Internal Medicine', 'Pediatrics', 'Cardiology',
      'Dermatology', 'Psychiatry', 'Neurology', 'Orthopedics'
    ];
    const count = Math.floor(Math.random() * 2) + 1; // 1-2 specialties
    const result = [];
    
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * specialties.length);
      if (!result.includes(specialties[randomIndex])) {
        result.push(specialties[randomIndex]);
      }
    }
    
    return result;
  };

  return (
    <ProtectedRoute>
      <Layout title="Find a Doctor">
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search by name"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">
            {error}
          </Typography>
        ) : filteredDoctors.length === 0 ? (
          <Typography align="center">
            No doctors found. Please try a different search term.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredDoctors.map((doctor) => {
              // Generate random specialties for demo
              const specialties = getRandomSpecialties();
              
              return (
                <Grid item xs={12} sm={6} md={4} key={doctor.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar 
                          sx={{ 
                            width: 70, 
                            height: 70, 
                            bgcolor: 'primary.main',
                            mr: 2
                          }}
                        >
                          {doctor.firstName.charAt(0)}{doctor.lastName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" component="h2">
                            Dr. {doctor.firstName} {doctor.lastName}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                            {specialties.map((specialty, index) => (
                              <Chip 
                                key={index} 
                                label={specialty} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                        <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Telehealth Only
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <MedicalServices fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Available for online consultations
                        </Typography>
                      </Box>
                    </CardContent>
                    
                    <CardActions>
                      <Button 
                        fullWidth 
                        variant="contained" 
                        color="primary"
                        onClick={() => handleSchedule(doctor.id)}
                      >
                        Schedule Appointment
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Layout>
    </ProtectedRoute>
  );
}