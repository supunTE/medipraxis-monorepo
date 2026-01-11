import type { UserRepository } from "../repositories";

export class UserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async getUserById(userId: string) {
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}
