import { z } from 'zod';

export const familyNameSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Family name is required')
    .max(100, 'Family name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_']+$/, 'Family name contains invalid characters')
});

export const familyCodeSchema = z.object({
  code: z.string()
    .trim()
    .length(8, 'Family code must be 8 characters')
    .regex(/^[a-z0-9\-]+$/, 'Invalid family code format')
});

export const inviteEmailSchema = z.object({
  email: z.string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .optional()
    .or(z.literal(''))
});

export const geofenceSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Geofence name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_']+$/, 'Name contains invalid characters'),
  latitude: z.number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .finite('Invalid latitude value'),
  longitude: z.number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .finite('Invalid longitude value'),
  radius: z.number()
    .int('Radius must be a whole number')
    .min(10, 'Radius must be at least 10 meters')
    .max(50000, 'Radius must be less than 50km'),
  type: z.enum(['safe_zone', 'restricted_zone', 'notification_zone'], {
    errorMap: () => ({ message: 'Invalid geofence type' })
  })
});
