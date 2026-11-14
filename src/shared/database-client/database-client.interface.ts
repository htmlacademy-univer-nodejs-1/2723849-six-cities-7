export interface IDatabaseClient {
  connect(uri?: string): Promise<void>;
  disconnect(): Promise<void>;
}
