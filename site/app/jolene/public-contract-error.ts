export class PublicJoleneContractError extends Error {
  readonly path: string;

  constructor(path: string, message: string) {
    super(`${path}: ${message}`);
    this.name = 'PublicJoleneContractError';
    this.path = path;
  }
}
