import { describe, expect, it, jest } from "@jest/globals";

const createSecureStoreMock = () => {
  const mock = {
    setItemAsync: jest.fn() as jest.MockedFunction<
      (key: string, value: string) => Promise<void>
    >,
    getItemAsync: jest.fn() as jest.MockedFunction<
      (key: string) => Promise<string | null>
    >,
    deleteItemAsync: jest.fn() as jest.MockedFunction<
      (key: string) => Promise<void>
    >,
  };

  mock.setItemAsync.mockResolvedValue(undefined);
  mock.getItemAsync.mockResolvedValue(null);
  mock.deleteItemAsync.mockResolvedValue(undefined);

  return mock;
};

const createLocalStorageMock = () => ({
  setItem: jest.fn() as jest.MockedFunction<
    (key: string, value: string) => void
  >,
  getItem: jest.fn() as jest.MockedFunction<(key: string) => string | null>,
  removeItem: jest.fn() as jest.MockedFunction<(key: string) => void>,
});

const loadStorageModule = (
  platform: string,
  localStorageMock?: ReturnType<typeof createLocalStorageMock>
) => {
  jest.resetModules();
  const secureStoreMock = createSecureStoreMock();
  jest.doMock("expo-secure-store", () => secureStoreMock);
  jest.doMock("react-native", () => ({ Platform: { OS: platform } }));

  if (platform === "web") {
    (global as any).localStorage = localStorageMock ?? createLocalStorageMock();
  } else {
    delete (global as any).localStorage;
  }

  const storage =
    require("../utils/storage") as typeof import("../utils/storage");
  return {
    storage,
    secureStoreMock,
    localStorageMock: (global as any).localStorage,
  };
};

describe("storage helpers on native platforms", () => {
  it("proxies tokens to SecureStore", async () => {
    const { storage, secureStoreMock } = loadStorageModule("ios");

    await storage.saveToken("foo", "bar");
    expect(secureStoreMock.setItemAsync).toHaveBeenCalledWith("foo", "bar");

    secureStoreMock.getItemAsync.mockResolvedValue("baz");
    expect(await storage.getToken("foo")).toBe("baz");
    expect(secureStoreMock.getItemAsync).toHaveBeenCalledWith("foo");

    await storage.deleteToken("foo");
    expect(secureStoreMock.deleteItemAsync).toHaveBeenCalledWith("foo");
  });

  it("authStorage helpers reuse SecureStore", async () => {
    const { storage, secureStoreMock } = loadStorageModule("android");

    secureStoreMock.getItemAsync.mockResolvedValue(
      JSON.stringify({ name: "Tester" })
    );
    await expect(storage.authStorage.getUser()).resolves.toEqual({
      name: "Tester",
    });

    await storage.authStorage.clearAll();
    expect(secureStoreMock.deleteItemAsync).toHaveBeenCalledTimes(4);
  });
});

describe("storage helpers on the web", () => {
  it("falls back to localStorage", async () => {
    const localStorageMock = createLocalStorageMock();
    const { storage } = loadStorageModule("web", localStorageMock);

    await storage.saveToken("foo", "bar");
    expect(localStorageMock.setItem).toHaveBeenCalledWith("foo", "bar");

    localStorageMock.getItem.mockReturnValue("baz");
    expect(await storage.getToken("foo")).toBe("baz");
    expect(localStorageMock.getItem).toHaveBeenCalledWith("foo");

    await storage.deleteToken("foo");
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("foo");
  });
});
