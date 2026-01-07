#!/usr/bin/env node

/**
 * ASTRYX - Generate Sample Data Script
 * Creates sample anomalies, workflows, and data sources for development/testing
 */

const { Sequelize, DataTypes } = require('sequelize');
const crypto = require('crypto');

// Database connection
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgres://astryx:astryx@localhost:5432/astryx',
  {
    logging: false,
  }
);

// Sample data
const anomalyTypes = [
  'earthquake',
  'wildfire',
  'flood',
  'severe_storm',
  'volcanic_activity',
  'tsunami',
  'drought',
  'air_quality',
  'traffic_incident',
  'infrastructure_failure',
];

const severities = ['low', 'medium', 'high', 'critical'];
const statuses = ['detected', 'analyzing', 'verified', 'confirmed', 'resolved'];

const locations = [
  { name: 'Los Angeles, USA', lat: 34.0522, lng: -118.2437, country: 'USA' },
  { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503, country: 'Japan' },
  { name: 'London, UK', lat: 51.5074, lng: -0.1278, country: 'UK' },
  { name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093, country: 'Australia' },
  { name: 'Mumbai, India', lat: 19.076, lng: 72.8777, country: 'India' },
  { name: 'São Paulo, Brazil', lat: -23.5505, lng: -46.6333, country: 'Brazil' },
  { name: 'Cairo, Egypt', lat: 30.0444, lng: 31.2357, country: 'Egypt' },
  { name: 'Berlin, Germany', lat: 52.52, lng: 13.405, country: 'Germany' },
  { name: 'Mexico City, Mexico', lat: 19.4326, lng: -99.1332, country: 'Mexico' },
  { name: 'Cape Town, South Africa', lat: -33.9249, lng: 18.4241, country: 'South Africa' },
];

const dataSources = [
  {
    name: 'USGS Earthquakes',
    type: 'usgs',
    url: 'https://earthquake.usgs.gov/fdsnws/event/1',
    isActive: true,
    schedule: '*/15 * * * *',
    config: { minMagnitude: 2.5, format: 'geojson' },
  },
  {
    name: 'NASA EONET',
    type: 'eonet',
    url: 'https://eonet.gsfc.nasa.gov/api/v3',
    isActive: true,
    schedule: '*/30 * * * *',
    config: { status: 'open', limit: 50 },
  },
  {
    name: 'OpenWeatherMap',
    type: 'openweather',
    url: 'https://api.openweathermap.org/data/2.5',
    isActive: true,
    schedule: '0 * * * *',
    config: { units: 'metric' },
  },
  {
    name: 'GDELT Project',
    type: 'gdelt',
    url: 'https://api.gdeltproject.org/api/v2',
    isActive: false,
    schedule: '*/60 * * * *',
    config: { mode: 'artlist', maxRecords: 100 },
  },
  {
    name: 'TomTom Traffic',
    type: 'tomtom',
    url: 'https://api.tomtom.com/traffic',
    isActive: false,
    schedule: '*/5 * * * *',
    config: { style: 'night' },
  },
];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function generateAnomaly() {
  const type = randomChoice(anomalyTypes);
  const location = randomChoice(locations);
  const severity = randomChoice(severities);
  const status = randomChoice(statuses);

  return {
    id: crypto.randomUUID(),
    type,
    title: `${type.replace('_', ' ').toUpperCase()} detected near ${location.name}`,
    description: `Automated detection of ${type.replace('_', ' ')} event in the ${location.name} region. Multiple data sources confirm this anomaly.`,
    severity,
    status,
    latitude: location.lat + randomFloat(-1, 1),
    longitude: location.lng + randomFloat(-1, 1),
    location: location.name,
    country: location.country,
    confidence: randomFloat(0.6, 1),
    impactRadius: Math.floor(randomFloat(5, 100)),
    affectedPopulation: Math.floor(randomFloat(1000, 1000000)),
    source: randomChoice(['usgs', 'eonet', 'openweather', 'gdelt', 'manual']),
    rawData: {
      magnitude: randomFloat(2, 8),
      depth: randomFloat(0, 100),
      timestamp: new Date().toISOString(),
    },
    aiAnalysis: {
      summary: `AI analysis indicates a ${severity} severity ${type.replace('_', ' ')} event with high confidence.`,
      recommendations: [
        'Monitor situation closely',
        'Alert local authorities if escalation occurs',
        'Prepare emergency response protocols',
      ],
      relatedEvents: [],
      riskFactors: ['Population density', 'Infrastructure proximity', 'Historical patterns'],
    },
    metadata: {
      firstDetected: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      lastUpdated: new Date().toISOString(),
      sources: ['USGS', 'NASA EONET', 'Local sensors'],
    },
    createdAt: new Date(Date.now() - Math.random() * 604800000),
    updatedAt: new Date(),
  };
}

async function generateSampleData() {
  console.log('🚀 ASTRYX Sample Data Generator\n');

  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Create tables if not exist
    console.log('📦 Syncing database schema...');
    
    // Define models inline for the script
    const Anomaly = sequelize.define('Anomaly', {
      id: { type: DataTypes.UUID, primaryKey: true },
      type: DataTypes.STRING,
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      severity: DataTypes.STRING,
      status: DataTypes.STRING,
      latitude: DataTypes.FLOAT,
      longitude: DataTypes.FLOAT,
      location: DataTypes.STRING,
      country: DataTypes.STRING,
      confidence: DataTypes.FLOAT,
      impactRadius: DataTypes.INTEGER,
      affectedPopulation: DataTypes.INTEGER,
      source: DataTypes.STRING,
      rawData: DataTypes.JSONB,
      aiAnalysis: DataTypes.JSONB,
      metadata: DataTypes.JSONB,
    }, { tableName: 'anomalies' });

    const DataSource = sequelize.define('DataSource', {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      name: DataTypes.STRING,
      type: DataTypes.STRING,
      url: DataTypes.STRING,
      isActive: DataTypes.BOOLEAN,
      schedule: DataTypes.STRING,
      config: DataTypes.JSONB,
      lastFetchAt: DataTypes.DATE,
      lastFetchStatus: DataTypes.STRING,
      fetchCount: DataTypes.INTEGER,
      errorCount: DataTypes.INTEGER,
    }, { tableName: 'data_sources' });

    await sequelize.sync();
    console.log('✅ Schema synced\n');

    // Generate anomalies
    console.log('🌍 Generating sample anomalies...');
    const anomalies = Array.from({ length: 25 }, generateAnomaly);
    await Anomaly.bulkCreate(anomalies, { ignoreDuplicates: true });
    console.log(`✅ Created ${anomalies.length} anomalies\n`);

    // Generate data sources
    console.log('📡 Creating data sources...');
    const sourcesWithIds = dataSources.map(s => ({
      ...s,
      id: crypto.randomUUID(),
      lastFetchAt: new Date(Date.now() - Math.random() * 3600000),
      lastFetchStatus: 'success',
      fetchCount: Math.floor(Math.random() * 1000),
      errorCount: Math.floor(Math.random() * 10),
    }));
    await DataSource.bulkCreate(sourcesWithIds, { ignoreDuplicates: true });
    console.log(`✅ Created ${dataSources.length} data sources\n`);

    console.log('═'.repeat(50));
    console.log('🎉 Sample data generation complete!');
    console.log('═'.repeat(50));
    console.log('\nData summary:');
    console.log(`  • Anomalies: ${anomalies.length}`);
    console.log(`  • Data Sources: ${dataSources.length}`);
    console.log('\nYou can now start the ASTRYX application.');

  } catch (error) {
    console.error('❌ Error generating sample data:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

generateSampleData();
