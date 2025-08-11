// Environment variable validation utility
interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface EnvVariable {
  key: string;
  required: boolean;
  description: string;
  validator?: (value: string) => boolean;
}

const ENV_VARIABLES: EnvVariable[] = [
  {
    key: 'MAPBOX_TOKEN',
    required: true,
    description: 'Mapbox API access token',
    validator: (value) => value.startsWith('pk.') && value.length > 50
  },
  {
    key: 'MAPBOX_CENTER_LNG',
    required: false,
    description: 'Default map center longitude',
    validator: (value) => !isNaN(parseFloat(value)) && parseFloat(value) >= -180 && parseFloat(value) <= 180
  },
  {
    key: 'MAPBOX_CENTER_LAT',
    required: false,
    description: 'Default map center latitude',
    validator: (value) => !isNaN(parseFloat(value)) && parseFloat(value) >= -90 && parseFloat(value) <= 90
  },
  {
    key: 'MAPBOX_ZOOM',
    required: false,
    description: 'Default map zoom level',
    validator: (value) => !isNaN(parseFloat(value)) && parseFloat(value) >= 0 && parseFloat(value) <= 24
  },
  {
    key: 'MAPBOX_STYLE',
    required: false,
    description: 'Mapbox style URL',
    validator: (value) => value.startsWith('mapbox://styles/') || value.startsWith('https://')
  }
];

export const validateEnvironment = (): EnvValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  ENV_VARIABLES.forEach(({ key, required, description, validator }) => {
    const fullKey = `REACT_APP_${key}`;
    const value = process.env[fullKey];

    if (required && (!value || value.trim() === '')) {
      errors.push(`Missing required environment variable: ${fullKey} (${description})`);
    } else if (value && validator && !validator(value)) {
      const message = `Invalid value for ${fullKey}: ${description}`;
      if (required) {
        errors.push(message);
      } else {
        warnings.push(message);
      }
    } else if (!required && !value) {
      warnings.push(`Optional environment variable ${fullKey} not set, using default value`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const logEnvironmentStatus = (): void => {
  const result = validateEnvironment();
  
  if (result.isValid) {
    console.log('✅ Environment validation passed');
  } else {
    console.error('❌ Environment validation failed');
    result.errors.forEach(error => console.error(`  • ${error}`));
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️ Environment warnings:');
    result.warnings.forEach(warning => console.warn(`  • ${warning}`));
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('🔒 Security features enabled:');
    console.log('  • Content Security Policy');
    console.log('  • Secure localStorage handling');
    console.log('  • Environment variable validation');
    console.log('  • No hardcoded API tokens');
  }
};

// Validate environment on module load in development
if (process.env.NODE_ENV === 'development') {
  logEnvironmentStatus();
}