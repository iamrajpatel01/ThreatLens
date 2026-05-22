const fs = require('fs');
const path = require('path');

const serverTsPath = path.join(__dirname, 'server.ts');
const initialDataPath = path.join(__dirname, 'src', 'initialData.ts');
const appTsxPath = path.join(__dirname, 'src', 'App.tsx');

let serverTs = fs.readFileSync(serverTsPath, 'utf8');
const initialData = fs.readFileSync(initialDataPath, 'utf8');

// Extract the data arrays from initialData.ts
// Remove exports, change const to let
const dataBlocks = initialData
  .replace(/import .*\n+/g, '')
  .replace(/export const /g, 'let ')
  .replace(/INITIAL_ASSETS: Asset\[\]/g, 'INITIAL_ASSETS: any[]')
  .replace(/INITIAL_SERVICES: Service\[\]/g, 'INITIAL_SERVICES: any[]')
  .replace(/INITIAL_IDENTITIES: IdentityStatus\[\]/g, 'INITIAL_IDENTITIES: any[]')
  .replace(/INITIAL_VULNERABILITIES: Vulnerability\[\]/g, 'INITIAL_VULNERABILITIES: any[]')
  .replace(/INITIAL_REMEDIATIONS: Remediation\[\]/g, 'INITIAL_REMEDIATIONS: any[]');

// Insert dataBlocks into server.ts before `const isWithinScope`
serverTs = serverTs.replace(
  '// Helper to assert whether safe scope boundary validation applies',
  dataBlocks + '\n\n// Helper to assert whether safe scope boundary validation applies'
);

// Add the new endpoint `/api/initial-state` right after `/api/scopes`
const initialStateEndpoint = `
// Fetch initial state data
app.get("/api/initial-state", (req, res) => {
  res.json({
    assets: INITIAL_ASSETS,
    services: INITIAL_SERVICES,
    identities: INITIAL_IDENTITIES,
    vulnerabilities: INITIAL_VULNERABILITIES,
    remediations: INITIAL_REMEDIATIONS
  });
});
`;

serverTs = serverTs.replace(
  '// Configure validation scopes strictly under authorization principles',
  initialStateEndpoint + '\n// Configure validation scopes strictly under authorization principles'
);

// Fix TS types inside server.ts for the imported data by either adding any or just leaving it (it's TS)
// It has `let INITIAL_ASSETS: any[] = [...]` so it's fine.

fs.writeFileSync(serverTsPath, serverTs);

let appTsx = fs.readFileSync(appTsxPath, 'utf8');

appTsx = appTsx.replace(
  "import { INITIAL_ASSETS, INITIAL_SERVICES, INITIAL_IDENTITIES, INITIAL_VULNERABILITIES, INITIAL_REMEDIATIONS } from './initialData';\n",
  ''
);

appTsx = appTsx.replace(
  "const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);",
  "const [assets, setAssets] = useState<Asset[]>([]);"
);

appTsx = appTsx.replace(
  "const [services] = useState<Service[]>(INITIAL_SERVICES);",
  "const [services, setServices] = useState<Service[]>([]);"
);

appTsx = appTsx.replace(
  "const [identities, setIdentities] = useState<IdentityStatus[]>(INITIAL_IDENTITIES);",
  "const [identities, setIdentities] = useState<IdentityStatus[]>([]);"
);

appTsx = appTsx.replace(
  "const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>(INITIAL_VULNERABILITIES);",
  "const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);"
);

appTsx = appTsx.replace(
  "const [remediations, setRemediations] = useState<Remediation[]>(INITIAL_REMEDIATIONS);",
  "const [remediations, setRemediations] = useState<Remediation[]>([]);"
);

const fetchCode = `  useEffect(() => {
    fetch('/api/scopes')
      .then(res => res.json())
      .then(data => {
        if (data.authorizedScopes) setAuthorizedScopes(data.authorizedScopes);
        if (data.discoveryLogs) setScopeLogs(data.discoveryLogs);
        if (data.idorHistory) setIdorTests(data.idorHistory);
      })
      .catch(err => {
        console.error("Unable to load platform session config schemas: ", err);
      });

    fetch('/api/initial-state')
      .then(res => res.json())
      .then(data => {
        if (data.assets) setAssets(data.assets);
        if (data.services) setServices(data.services);
        if (data.identities) setIdentities(data.identities);
        if (data.vulnerabilities) setVulnerabilities(data.vulnerabilities);
        if (data.remediations) setRemediations(data.remediations);
      })
      .catch(err => {
        console.error("Unable to load initial state data: ", err);
      });
  }, []);`;

appTsx = appTsx.replace(
  /  \/\/ Sync state variables initially on boot\n  useEffect\(\(\) => \{[\s\S]*?  \}, \[\]\);/,
  `  // Sync state variables initially on boot\n${fetchCode}`
);

fs.writeFileSync(appTsxPath, appTsx);

// Delete initialData.ts
fs.unlinkSync(initialDataPath);

console.log('Refactoring complete');
