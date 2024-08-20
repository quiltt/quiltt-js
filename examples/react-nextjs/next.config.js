import NodePolyfillPlugin from 'node-polyfill-webpack-plugin'

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: ['@quiltt/react', '@apollo/client'],
  webpack(config, { isServer }) {
    if (!isServer) {
      config.plugins.push(new NodePolyfillPlugin())
    }

    return config
  },
}

export default config
