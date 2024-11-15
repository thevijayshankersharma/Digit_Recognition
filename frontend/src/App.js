import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider, createTheme } from '@material-ui/core/styles';
import { CssBaseline, Container, Grid, Paper, Typography, Button, IconButton, Switch, FormControlLabel, CircularProgress } from '@material-ui/core';
import { Brush, Delete, CloudUpload, Brightness4, Brightness7 } from '@material-ui/icons';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const API_URL = 'https://digit-recognition-xjwj.onrender.com/predict';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [currentPrediction, setCurrentPrediction] = useState(null);
  const [probabilities, setProbabilities] = useState([]);
  const [status, setStatus] = useState('Draw or upload an image to get a prediction.');
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const theme = createTheme({
    palette: {
      type: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#4fc3f7' : '#2196f3',
      },
      secondary: {
        main: darkMode ? '#f48fb1' : '#f50057',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: 'Poppins, sans-serif',
    },
    overrides: {
      MuiPaper: {
        root: {
          transition: 'background-color 0.3s ease-in-out',
        },
      },
    },
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 10;
    ctx.shadowColor = darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.5)';
  }, [darkMode]);

  const startDrawing = (e) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCurrentPrediction(null);
    setProbabilities([]);
  };

  const predictDrawing = async () => {
    setIsLoading(true);
    setStatus('Predicting...');
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL('image/png');  // This converts the canvas to base64 image
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData }),  // Send base64 image as part of the request
      });
      const result = await response.json();
      if (result.digit !== undefined) {
        updatePrediction(result.digit, result.probabilities);
      } else {
        setStatus('Error: No prediction returned.');
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus('Error: Unable to predict. Please try again.');
      alert('There was an issue communicating with the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          predictDrawing();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const updatePrediction = (digit, probs) => {
    setCurrentPrediction(digit);
    setProbabilities(probs);
    setPredictions(prev => [digit, ...prev.slice(0, 9)]);
    setStatus('');
  };

  const chartData = {
    labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    datasets: [
      {
        label: 'Confidence',
        data: probabilities,
        fill: false,
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.light,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h2" align="center" gutterBottom style={{ 
            marginTop: '2rem',
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Digit Recognition
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Paper elevation={3} style={{ 
                padding: '2rem', 
                borderRadius: '1rem',
                backgroundColor: darkMode ? theme.palette.background.paper : '#ffffff',
              }}>
                <Typography variant="h5" gutterBottom style={{ color: darkMode ? theme.palette.text.primary : '#000000' }}>
                  Draw a Digit
                </Typography>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ marginBottom: '1rem' }}
                >
                  <canvas
                    ref={canvasRef}
                    width={280}
                    height={280}
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseMove={draw}
                    onMouseLeave={stopDrawing}
                    style={{
                      border: `2px solid ${darkMode ? theme.palette.divider : '#ffffff'}`,
                      borderRadius: '0.5rem',
                      cursor: 'crosshair',
                      backgroundColor: '#000000',
                    }}
                  />
                </motion.div>
                <Grid container spacing={2} justifyContent="center">
                  <Grid item>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<Delete />}
                        onClick={clearCanvas}
                      >
                        Clear
                      </Button>
                    </motion.div>
                  </Grid>
                  <Grid item>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Brush />}
                        onClick={predictDrawing}
                        disabled={isLoading}
                      >
                        {isLoading ? <CircularProgress size={24} /> : 'Predict'}
                      </Button>
                    </motion.div>
                  </Grid>
                  <Grid item>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="raised-button-file"
                        type="file"
                        onChange={handleImageUpload}
                      />
                      <label htmlFor="raised-button-file">
                        <Button
                          variant="contained"
                          component="span"
                          startIcon={<CloudUpload />}
                        >
                          Upload
                        </Button>
                      </label>
                    </motion.div>
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Paper elevation={3} style={{ padding: '2rem', borderRadius: '1rem' }}>
                <Typography variant="h5" gutterBottom>
                  Prediction Result
                </Typography>
                <AnimatePresence>
                  {currentPrediction !== null && (
                    <motion.div
                      key={currentPrediction}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 10 }}
                    >
                      <Typography variant="h1" align="center" style={{ marginBottom: '1rem' }}>
                        {currentPrediction}
                      </Typography>
                    </motion.div>
                  )}
                </AnimatePresence>
                <Typography variant="body1" align="center" gutterBottom>
                  {status}
                </Typography>
                {probabilities.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <Line data={chartData} options={chartOptions} />
                  </motion.div>
                )}
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Paper elevation={3} style={{ padding: '2rem', borderRadius: '1rem', marginTop: '2rem' }}>
            <Typography variant="h5" gutterBottom>
              Previous Predictions
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              <AnimatePresence>
                {predictions.map((digit, index) => (
                  <Grid item key={index}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Paper
                        elevation={2}
                        style={{
                          width: '50px',
                          height: '50px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          cursor: 'pointer',
                          backgroundColor: theme.palette.primary.main,
                          color: theme.palette.primary.contrastText,
                          borderRadius: '50%',
                        }}
                      >
                        <Typography variant="h5">{digit}</Typography>
                      </Paper>
                    </motion.div>
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>
          </Paper>
        </motion.div>

        <motion.div
          style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', marginBottom: '2rem' }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
                name="darkMode"
                color="primary"
              />
            }
            label={
              <IconButton color="inherit">
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            }
          />
        </motion.div>
      </Container>
    </ThemeProvider>
  );
}

export default App;