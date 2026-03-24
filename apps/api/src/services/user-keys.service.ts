import type { UserKeysRepository } from "../repositories";

export class UserKeysService {
  constructor(private userKeysRepository: UserKeysRepository) {}

  async saveUserKeys(
    userId: string,
    publicKey: string,
    wrappedPrivateKey: string,
    pbkdf2Salt: string
  ) {
    return this.userKeysRepository.upsert(
      userId,
      publicKey,
      wrappedPrivateKey,
      pbkdf2Salt
    );
  }

  async getUserKeys(userId: string) {
    const keys = await this.userKeysRepository.findByUserId(userId);
    if (!keys) {
      throw new Error("User keys not found");
    }
    return keys;
  }

  async getPublicKeyByUserId(userId: string): Promise<string> {
    const keys = await this.userKeysRepository.findByUserId(userId);
    if (!keys) {
      throw new Error("User keys not found");
    }
    return keys.public_key;
  }
}
