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

  async updateUser(userId: string, updateData: any) {
    // Check if user exists
    const existingUser = await this.userRepository.findUserById(userId);

    if (!existingUser) {
      throw new Error("User not found");
    }

    // Update the user
    const updatedUser = await this.userRepository.updateUser(
      userId,
      updateData
    );

    if (!updatedUser) {
      throw new Error("Failed to update user");
    }

    return updatedUser;
  }
}
