import { registerAs } from '@nestjs/config';
import ms from 'ms';

const seconds = (value: string): number => {
  const milliseconds = ms(value);
  // Ensure we have a number before division
  return typeof milliseconds === 'number' ? milliseconds / 1000 : 0;
};

export default registerAs(
  'auth',
  (): Record<string, any> => ({
    accessToken: {
      secret: process.env.ACCESS_TOKEN_SECRET_KEY,
      expirationTime: seconds(process.env.ACCESS_TOKEN_EXPIRED ?? '1d'),
    },
    refreshToken: {
      secret: process.env.REFRESH_TOKEN_SECRET_KEY,
      expirationTime: seconds(process.env.REFRESH_TOKEN_EXPIRED ?? '7d'),
    },
  }),
);
