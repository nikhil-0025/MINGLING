declare module 'ioredis-mock' {
  import type { Redis as IORedis } from 'ioredis';

  const RedisMock: new (...args: any[]) => IORedis;
  export default RedisMock;
}
