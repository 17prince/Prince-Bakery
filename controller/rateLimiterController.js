const redis = require('redis');
const { RateLimiterRedis } = require('rate-limiter-flexible');
const AppError = require('../utiles/appError');
const User = require('../models/userModel');

let redisUrl = process.env.REDIS_URL.replace(/<password>/, process.env.REDIS_PASSWORD);
redisUrl = redisUrl.replace(/<Endpoint>/, process.env.REDIS_ENDPOINT);

// Creating redis clinte- connect to Redis
const redisClinte = redis.createClient(redisUrl, {
  enable_offline_queue: true,
});

redisClinte.on('error', (err) => new AppError('Redis connection error', 401));

const maxLimitPerDay = 100;
const maxConsecutiveFailsByEmailAndIP = 10;

const limitSlowBruteByIP = new RateLimiterRedis({
  storeClient: redisClinte,
  keyPrefix: 'login_fail_ip_per_day',
  // total number of point or attemps for user.
  // 1 fail = 1 point
  points: maxLimitPerDay,
  // delete key after 24 hour
  duration: 24 * 60 * 60,
  // number of seconds to block the route if comsumed points > points
  blockDuration: 24 * 60 * 60, // block for 1 day, if 100 wrong attemps per day
});

const limiterConsecutiveFailsByEmailAndIP = new RateLimiterRedis({
  storeClient: redisClinte,
  keyPrefix: 'login_fail_consecutive_email_and_ip',
  points: maxConsecutiveFailsByEmailAndIP,
  duration: 60 * 60, // delete key after 1 hour
  blockDuration: 60 * 60, // block for 1 hour
});

exports.routeRateLimit = async (req, res, next) => {
  // get key for attempted login
  const emailIPKey = `${req.body.email}_${req.ip}`;

  const [resEmailAndIP, resSlowByIP] = await Promise.all([
    limiterConsecutiveFailsByEmailAndIP.get(emailIPKey),
    limitSlowBruteByIP.get(req.ip),
  ]);

  let retrySecs = 0;

  // check if the IP + email already blocked
  if (resEmailAndIP !== null && resEmailAndIP.consumedPoints > maxConsecutiveFailsByEmailAndIP) {
    retrySecs = Math.round(resEmailAndIP.msBeforeNext / 1000) || 1;
  } else if (resSlowByIP !== null && resSlowByIP.consumedPoints > maxLimitPerDay) {
    retrySecs = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
  }

  if (retrySecs > 0) {
    return next(
      new AppError(`Too many login request. Please try again in ${retrySecs} seconds`, 429)
    );
  }
  // for non-block ip + email or new user.
  const user = await User.findOne({ email: req.body.email }).select('+password');

  try {
    if (!user || !(await user.checkPassword(req.body.password, user.password))) {
      const promises = [
        limiterConsecutiveFailsByEmailAndIP.consume(emailIPKey),
        limitSlowBruteByIP.consume(req.ip),
      ];

      await Promise.all(promises);
      return next();
    }
  } catch (err) {
    if (err instanceof Error) {
      console.log(err);
    } else {
      const timeOut = String(Math.round(err.msBeforeNext / 1000)) || 1;
      return next(new AppError(`Too many login attempts. Retry after ${timeOut} seconds`, 429));
    }
  }

  if (resEmailAndIP !== null && resEmailAndIP.consumedPoints > 0) {
    await limiterConsecutiveFailsByEmailAndIP.delete(emailIPKey);
  }
  next();
};
