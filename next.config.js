/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(png|jpg|gif|svg)$/i,
      use: [
        {
          loader: 'url-loader',
          options: {
            limit: 8192,
          },
        },
      ],
    });
    return config;
  },
  images: {
    domains: ['tile.openstreetmap.org'],
  },
};

module.exports = nextConfig; 