import { z } from 'zod';

const configSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),

  // Database Configuration
  MONGODB_URI: z.string().url(),
  MONGODB_TEST_URI: z.string().url().optional(),

  // JWT Configuration
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRE: z.string().default('15m'),
  JWT_REFRESH_EXPIRE: z.string().default('7d'),

  // Security Configuration
  BCRYPT_ROUNDS: z.coerce.number().min(8).max(20).default(12),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(1000),

  // File Upload Configuration
  MAX_FILE_SIZE: z.coerce.number().default(10485760), // 10MB
  ALLOWED_FILE_TYPES: z.string().default('pdf,doc,docx,txt,jpg,jpeg,png,zip'),

  // Cloudinary Configuration
  CLOUDINARY_CLOUD_NAME: z.string().default('dhw4acerz'),
  CLOUDINARY_API_KEY: z.string().default('384713789766646'),
  CLOUDINARY_API_SECRET: z.string().default('yOUwuJ7kQ0u4ZqYKsEhal-WrU6I'),

  // CORS Configuration
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
});

type Config = z.infer<typeof configSchema>;

function validateConfig(): Config {
  try {
    return configSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Configuration validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error('❌ Unknown configuration error:', error);
    }
    process.exit(1);
  }
}

export const config = validateConfig();
