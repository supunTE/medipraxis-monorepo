export class ControllerResponse<T> {
  constructor(
    public success: boolean,
    public data: T | null,
    public error: string | null = null
  ) {}

  static success<T>(data: T): ControllerResponse<T> {
    return new ControllerResponse<T>(true, data);
  }

  static failure(error: string): ControllerResponse<null> {
    return new ControllerResponse<null>(false, null, error);
  }
}
