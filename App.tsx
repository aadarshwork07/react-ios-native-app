import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View, Button, StyleSheet } from 'react-native';
import BrokenHealthKit, { HealthKitPermissions } from 'react-native-health';

const NativeModules = require('react-native').NativeModules;
const AppleHealthKit = NativeModules.AppleHealthKit;
AppleHealthKit.Constants = BrokenHealthKit.Constants;

function App() {
  const [status, setStatus] = useState('Not initialized');
  const [healthData, setHealthData] = useState({
    steps: 0,
    heartRate: [],
    sleep: [],
    activeEnergy: 0,
    distance: 0,
  });
  const [loading, setLoading] = useState(false);

  const permissions = {
    permissions: {
      read: [
        AppleHealthKit.Constants.Permissions.HeartRate,
        AppleHealthKit.Constants.Permissions.Steps,
        AppleHealthKit.Constants.Permissions.SleepAnalysis,
        AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
        AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
      ],
      write: [AppleHealthKit.Constants.Permissions.Steps],
    },
  };

  const initializeHealthKit = () => {
    setLoading(true);
    setStatus('Initializing HealthKit...');
    
    AppleHealthKit.initHealthKit(permissions, (error) => {
      if (error) {
        setStatus('Error: ' + error);
        setLoading(false);
        return;
      }
      setStatus('HealthKit initialized successfully');
      setLoading(false);
    });
  };

  const fetchHealthData = () => {
    setLoading(true);
    setStatus('Fetching health data...');
    const options = { date: new Date().toISOString() };
    
    AppleHealthKit.getStepCount(options, (error, results) => {
      if (!error) setHealthData(prev => ({ ...prev, steps: results.value || 0 }));
    });
    
    const heartRateOptions = {
      startDate: new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
      limit: 10,
    };
    AppleHealthKit.getHeartRateSamples(heartRateOptions, (error, results) => {
      if (!error) setHealthData(prev => ({ ...prev, heartRate: results }));
    });
    
    const sleepOptions = { startDate: new Date().toISOString() };
    AppleHealthKit.getSleepSamples(sleepOptions, (error, results) => {
      if (!error) setHealthData(prev => ({ ...prev, sleep: results }));
    });
    
    AppleHealthKit.getActiveEnergyBurned({}, (error, results) => {
      if (!error) setHealthData(prev => ({ ...prev, activeEnergy: results.value || 0 }));
    });
    
    AppleHealthKit.getDistanceWalkingRunning({}, (error, results) => {
      if (!error) setHealthData(prev => ({ ...prev, distance: results.value || 0 }));
    });
    
    setStatus('Health data retrieved successfully');
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>HealthKit Integration</Text>
        <View style={styles.statusContainer}>
          <Text>Status: {status}</Text>
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Initialize HealthKit" onPress={initializeHealthKit} disabled={loading} />
          <Button title="Fetch Health Data" onPress={fetchHealthData} disabled={loading} />
        </View>
        <View style={styles.dataContainer}>
          <Text>Steps: {healthData.steps}</Text>
          <Text>Active Energy: {healthData.activeEnergy} kcal</Text>
          <Text>Distance Walked: {healthData.distance} km</Text>
          {healthData.heartRate.length > 0 && <Text>Heart Rate: {healthData.heartRate[0]?.value} BPM</Text>}
          {healthData.sleep.length > 0 && <Text>Last Sleep: {new Date(healthData.sleep[0]?.startDate).toLocaleString()}</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  statusContainer: { marginVertical: 20, padding: 15, backgroundColor: '#f0f0f0', borderRadius: 8 },
  buttonContainer: { marginVertical: 20 },
  dataContainer: { marginTop: 20, padding: 15, backgroundColor: '#e6f7ff', borderRadius: 8 },
});

export default App;
