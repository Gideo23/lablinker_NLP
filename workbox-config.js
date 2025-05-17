module.exports = {
  globDirectory: "./",
  globPatterns: [
    "**/*.{html,js,css,png,svg,json,db}"
  ],
  swDest: "sw.js",
  runtimeCaching: [
    {
      urlPattern: /\/query/,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60 // 1 day
        }
      }
    }
  ]
};
