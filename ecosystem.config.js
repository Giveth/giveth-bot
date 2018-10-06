module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps: [
      // First application
      {
        name: 'giveth-bot',
        script: './index.js',
        log_date_format: 'YYYY-MM-DD HH:mm',
        env: {
          NODE_ENV: 'debug',
        },
        env_production: {
          NODE_ENV: 'production',
        },
      },
    ],
  };