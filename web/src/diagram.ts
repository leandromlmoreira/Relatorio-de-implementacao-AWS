export const architectureDiagram = `
<svg viewBox="0 0 900 460" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagrama da arquitetura: internet passa por Route 53, CloudFront e um Application Load Balancer até instâncias EC2 em Auto Scaling dentro de uma VPC, que se conectam a um RDS MySQL Multi-AZ; CloudWatch monitora EC2 e RDS; S3 recebe backups.">
  <defs>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="#787774" />
    </marker>
  </defs>

  <circle cx="60" cy="70" r="26" fill="#F7F6F3" stroke="#EAEAEA" />
  <text x="60" y="112" text-anchor="middle" font-size="13" fill="#2F3437">Internet</text>

  <rect x="150" y="46" width="120" height="48" rx="8" fill="#E1F3FE" stroke="#EAEAEA" />
  <text x="210" y="66" text-anchor="middle" font-size="12" fill="#1F6C9F">Route 53</text>
  <text x="210" y="82" text-anchor="middle" font-size="11" fill="#1F6C9F">DNS</text>

  <rect x="310" y="46" width="130" height="48" rx="8" fill="#E1F3FE" stroke="#EAEAEA" />
  <text x="375" y="66" text-anchor="middle" font-size="12" fill="#1F6C9F">CloudFront</text>
  <text x="375" y="82" text-anchor="middle" font-size="11" fill="#1F6C9F">CDN</text>

  <line x1="86" y1="70" x2="150" y2="70" stroke="#787774" stroke-width="1.4" marker-end="url(#arrow)" />
  <line x1="270" y1="70" x2="310" y2="70" stroke="#787774" stroke-width="1.4" marker-end="url(#arrow)" />

  <rect x="20" y="150" width="860" height="290" rx="14" fill="none" stroke="#EAEAEA" stroke-width="1.4" stroke-dasharray="4 4" />
  <text x="40" y="172" font-size="12" fill="#787774" letter-spacing="0.05em">VPC</text>

  <rect x="360" y="150" width="180" height="56" rx="8" fill="#FBF3DB" stroke="#EAEAEA" />
  <text x="450" y="172" text-anchor="middle" font-size="12" fill="#956400">Application Load</text>
  <text x="450" y="188" text-anchor="middle" font-size="12" fill="#956400">Balancer</text>

  <line x1="375" y1="70" x2="450" y2="150" stroke="#787774" stroke-width="1.4" marker-end="url(#arrow)" />

  <rect x="60" y="250" width="150" height="50" rx="8" fill="#E1F3FE" stroke="#EAEAEA" />
  <text x="135" y="279" text-anchor="middle" font-size="12" fill="#1F6C9F">EC2 (subnet A)</text>

  <rect x="240" y="250" width="150" height="50" rx="8" fill="#E1F3FE" stroke="#EAEAEA" />
  <text x="315" y="279" text-anchor="middle" font-size="12" fill="#1F6C9F">EC2 (subnet B)</text>

  <rect x="60" y="222" width="330" height="98" rx="10" fill="none" stroke="#EAEAEA" stroke-width="1.2" />
  <text x="76" y="238" font-size="11" fill="#787774">Auto Scaling (1–5 instâncias)</text>

  <line x1="450" y1="206" x2="450" y2="222" stroke="#787774" stroke-width="1.4" />
  <line x1="450" y1="222" x2="135" y2="250" stroke="#787774" stroke-width="1.4" marker-end="url(#arrow)" />
  <line x1="450" y1="222" x2="315" y2="250" stroke="#787774" stroke-width="1.4" marker-end="url(#arrow)" />

  <rect x="630" y="250" width="190" height="60" rx="8" fill="#EDF3EC" stroke="#EAEAEA" />
  <text x="725" y="276" text-anchor="middle" font-size="12" fill="#346538">RDS MySQL</text>
  <text x="725" y="292" text-anchor="middle" font-size="11" fill="#346538">Multi-AZ (privado)</text>

  <line x1="390" y1="275" x2="630" y2="280" stroke="#787774" stroke-width="1.4" marker-end="url(#arrow)" />

  <rect x="630" y="150" width="190" height="50" rx="8" fill="#FDEBEC" stroke="#EAEAEA" />
  <text x="725" y="172" text-anchor="middle" font-size="12" fill="#9F2F2D">CloudWatch</text>
  <text x="725" y="186" text-anchor="middle" font-size="10" fill="#9F2F2D">métricas · logs · alertas</text>

  <line x1="315" y1="250" x2="700" y2="200" stroke="#787774" stroke-width="1" stroke-dasharray="3 3" marker-end="url(#arrow)" />
  <line x1="720" y1="250" x2="720" y2="200" stroke="#787774" stroke-width="1" stroke-dasharray="3 3" marker-end="url(#arrow)" />

  <rect x="60" y="360" width="150" height="50" rx="8" fill="#F7F6F3" stroke="#EAEAEA" />
  <text x="135" y="389" text-anchor="middle" font-size="12" fill="#2F3437">S3 (backups)</text>

  <line x1="725" y1="310" x2="200" y2="382" stroke="#787774" stroke-width="1" stroke-dasharray="3 3" marker-end="url(#arrow)" />
</svg>
`
