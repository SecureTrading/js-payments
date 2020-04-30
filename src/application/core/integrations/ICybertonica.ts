export interface ICybertonica {
  init(apiUserName: string): Promise<string | undefined>;
  getTransactionId(): Promise<string | undefined>;
}
