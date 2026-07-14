import type { RuntimeConfigError } from '@/core/config/runtimeConfig'

const errorCopy: Record<RuntimeConfigError['category'], { title: string; message: string }> = {
  missing: {
    title: 'Runtime configuration is missing',
    message: 'Mount a valid /config/runtime.json file and reload the application.',
  },
  'invalid-json': {
    title: 'Runtime configuration is not valid JSON',
    message: 'Check the deployed configuration file syntax and reload.',
  },
  'invalid-schema': {
    title: 'Runtime configuration is incompatible',
    message: 'Check the schema version and required fields.',
  },
  'untrusted-origin': {
    title: 'Runtime configuration contains an untrusted origin',
    message: 'Update the compiled project trust policy before using this API or identity provider.',
  },
  'unsafe-auth': {
    title: 'Cross-origin cookie authentication is not approved',
    message:
      'Use same-origin deployment or explicitly approve the exact HTTPS origin at build time.',
  },
  'mock-in-production': {
    title: 'Mock mode cannot run in production',
    message: 'Disable mock mode in the deployed runtime configuration.',
  },
}

export function renderBootstrapError(error: RuntimeConfigError): void {
  const root = document.getElementById('root')
  if (!root) {
    return
  }

  const copy = errorCopy[error.category]
  root.innerHTML = ''
  const main = document.createElement('main')
  main.className = 'bootstrap-error'
  main.innerHTML = '<div class="bootstrap-error__mark">!</div>' + '<h1></h1><p></p><code></code>'
  main.querySelector('h1')!.textContent = copy.title
  main.querySelector('p')!.textContent = copy.message
  main.querySelector('code')!.textContent = error.category
  root.append(main)
}
