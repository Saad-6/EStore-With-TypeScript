/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'randomuser.me',
      'images.ctfassets.net',
      'plus.unsplash.com',
      'media.istockphoto.com',
      'fakestoreapi.com',
      'i.imgur.com',
      'madofficialstore.shop',
      'demo.nopcommerce.com',
      'assets.curology.com',
      'www.shopmanto.com',
      'www.gulahmedshop.com',
      'pk.sapphireonline.pk',
      'localhost',
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5123',
        pathname: '/images/**',
      },
    ],
  },
};

// Disable SSL validation in development only
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export default nextConfig;
