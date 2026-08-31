/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: ['@quiltt/react', '@apollo/client'],
  // Next 16.3+ defaults experimental.useTypeScriptCli to true, which requires
  // `typescript/bin/tsc`. Our `typescript` alias (npm:@typescript/typescript6)
  // only ships bin/tsc6; it provides the JS compiler API (lib/typescript.js)
  // that this repo's split TypeScript setup is built around. Use the API path.
  experimental: {
    useTypeScriptCli: false,
  },
}

export default config
