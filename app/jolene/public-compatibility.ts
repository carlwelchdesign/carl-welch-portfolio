import {
  PUBLIC_JOLENE_SCHEMA_VERSION,
  type JobFitResponse,
  type PortfolioAnswerResponse,
  type PublicEvidenceManifest,
} from './public-contract.js';
import { PublicJoleneContractError } from './public-contract-error.js';

type EvidenceBearingResponse = Pick<
  PortfolioAnswerResponse | JobFitResponse,
  'schemaVersion' | 'corpusVersion' | 'citations'
>;

export function parseSchemaVersion(version: unknown, path = 'schemaVersion'): [number, number, number] {
  if (typeof version !== 'string' || !/^\d+\.\d+\.\d+$/.test(version)) {
    throw new PublicJoleneContractError(path, 'must be a semantic version');
  }
  return version.split('.').map(Number) as [number, number, number];
}

export function requireCompatibleSchemaVersion(
  version: unknown,
  path = 'schemaVersion',
): string {
  const [supportedMajor] = parseSchemaVersion(PUBLIC_JOLENE_SCHEMA_VERSION);
  const [receivedMajor] = parseSchemaVersion(version, path);
  if (receivedMajor !== supportedMajor) {
    throw new PublicJoleneContractError(
      path,
      `is incompatible with supported schema major ${supportedMajor}`,
    );
  }
  return version as string;
}

export function validateResponseAgainstManifest(
  response: EvidenceBearingResponse,
  manifest: PublicEvidenceManifest,
): void {
  requireCompatibleSchemaVersion(response.schemaVersion, 'response.schemaVersion');
  requireCompatibleSchemaVersion(manifest.schemaVersion, 'manifest.schemaVersion');
  if (response.corpusVersion !== manifest.corpusVersion) {
    throw new PublicJoleneContractError(
      'response.corpusVersion',
      'does not match the reviewed public evidence manifest',
    );
  }

  const revoked = new Set(manifest.revokedEvidenceIds);
  const citedRevokedEvidence = response.citations.find((citation) => revoked.has(citation.evidenceId));
  if (citedRevokedEvidence) {
    throw new PublicJoleneContractError(
      'response.citations',
      `contains revoked evidence ${citedRevokedEvidence.evidenceId}`,
    );
  }
}
