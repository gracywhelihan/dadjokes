module.exports = {
  apps: [{
    name: 'dad-jokes',
    script: 'npm',
    args: 'start',
    env: {
      PORT: 3001,
      NODE_ENV: 'production'
    }
  }]
} 