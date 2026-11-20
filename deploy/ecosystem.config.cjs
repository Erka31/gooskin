// pm2 тохиргоо: сервер унавал автоматаар дахин асаана.
//   npm install -g pm2
//   pm2 start deploy/ecosystem.config.cjs
//   pm2 save && pm2 startup   (компьютер асахад автоматаар асаах)
module.exports = {
  apps: [
    {
      name: "gooskin",
      script: "server/index.js",
      cwd: __dirname + "/..",
      instances: 1, // SQLite тул 1 процесс
      autorestart: true,
      max_memory_restart: "400M",
      env: { NODE_ENV: "production" },
      out_file: "logs/out.log",
      error_file: "logs/error.log",
      time: true,
    },
  ],
};
