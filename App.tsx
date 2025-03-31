import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View, Button, StyleSheet } from 'react-native';

// Import the broken HealthKit in TypeScript format
import BrokenHealthKit, { HealthKitPermissions, HealthValue } from 'react-native-health';

// Fix the module as suggested
const NativeModules = require('react-native').NativeModules;
const AppleHealthKit = NativeModules.AppleHealthKit;
// Copy the Constants from the broken import to preserve type information
AppleHealthKit.Constants = BrokenHealthKit.Constants;

function App() {
  const [status, setStatus] = useState('Not initialized');
  const [healthData, setHealthData] = useState({
    steps: 0,
    heartRate: [],
  });
  const [loading, setLoading] = useState(false);
  
  const initializeHealthKit = () => {
    try {
      setLoading(true);
      setStatus('Initializing HealthKit...');
      
      const permissions = {
        permissions: {
          read: [
            AppleHealthKit.Constants.Permissions.HeartRate,
            AppleHealthKit.Constants.Permissions.Steps,
            AppleHealthKit.Constants.Permissions.SleepAnalysis,
          ],
          write: [
            AppleHealthKit.Constants.Permissions.Steps,
          ],
        },
      };
      
      AppleHealthKit.initHealthKit(permissions, (error) => {
        if (error) {
          console.log('Error initializing HealthKit:', error);
          setStatus('Error: ' + error);
          setLoading(false);
          return;
        }
        
        console.log('HealthKit initialized successfully');
        setStatus('HealthKit initialized successfully');
        setLoading(false);
      });
    } catch (error) {
      console.error('Exception during initialization:', error);
      setStatus('Exception: ' + error.message);
      setLoading(false);
    }
  };
  
  const fetchHealthData = () => {
    try {
      setLoading(true);
      setStatus('Fetching health data...');
      
      // Get step count
      const options = {
        date: new Date().toISOString(),
      };
      
      AppleHealthKit.getStepCount(options, (error, results) => {
        if (error) {
          console.log('Error getting step count:', error);
          setStatus('Error getting step count: ' + error);
          setLoading(false);
          return;
        }
        
        console.log('Step count results:', results);
        setHealthData(prevData => ({ ...prevData, steps: results.value || 0 }));
        
        // Get heart rate samples
        const heartRateOptions = {
          startDate: new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
          endDate: new Date().toISOString(),
          limit: 10,
        };
        
        AppleHealthKit.getHeartRateSamples(heartRateOptions, (error, results) => {
          setLoading(false);
          
          if (error) {
            console.log('Error getting heart rate:', error);
            setStatus('Step count fetched, but error getting heart rate: ' + error);
            return;
          }
          
          console.log('Heart rate results:', results);
          setHealthData(prevData => ({ ...prevData, heartRate: results }));
          setStatus('Health data retrieved successfully');
        });
      });
    } catch (error) {
      console.error('Exception during data fetch:', error);
      setStatus('Exception: ' + error.message);
      setLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>HealthKit Integration</Text>
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={styles.statusValue}>{status}</Text>
          {loading && <Text style={styles.loadingText}>Loading...</Text>}
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Initialize HealthKit"
            onPress={initializeHealthKit}
            disabled={loading}
          />
          
          <View style={styles.buttonSpacer} />
          
          <Button
            title="Fetch Health Data"
            onPress={fetchHealthData}
            disabled={loading}
          />
        </View>
        
        {healthData.steps > 0 && (
          <View style={styles.dataContainer}>
            <Text style={styles.dataTitle}>Step Count</Text>
            <Text style={styles.dataValue}>{healthData.steps}</Text>
          </View>
        )}
        
        {healthData.heartRate.length > 0 && (
          <View style={styles.dataContainer}>
            <Text style={styles.dataTitle}>Heart Rate Samples</Text>
            {healthData.heartRate.map((sample, index) => (
              <View key={index} style={styles.sampleContainer}>
                <Text style={styles.sampleValue}>{sample.value} BPM</Text>
                <Text style={styles.sampleDate}>
                  {new Date(sample.startDate).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusContainer: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statusValue: {
    fontSize: 16,
  },
  loadingText: {
    marginTop: 10,
    fontStyle: 'italic',
    color: '#666',
  },
  buttonContainer: {
    marginVertical: 20,
  },
  buttonSpacer: {
    height: 10,
  },
  dataContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e6f7ff',
    borderRadius: 8,
  },
  dataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dataValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  sampleContainer: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: '#0066cc',
  },
  sampleValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sampleDate: {
    fontSize: 12,
    color: '#666',
  },
});

export default App;