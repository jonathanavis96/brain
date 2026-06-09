import { beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";

const TEST_DATA_DIR = path.join(process.cwd(), "data");
const TEST_DB_PATH = path.join(TEST_DATA_DIR, "test.db");

beforeEach(() => {
  // Ensure clean state for each test
  if (!fs.existsSync(TEST_DATA_DIR)) {
    fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
  }
});

afterEach(() => {
  // Clean up test database after each test
  const files = [TEST_DB_PATH, `${TEST_DB_PATH}-wal`, `${TEST_DB_PATH}-shm`];
  for (const f of files) {
    if (fs.existsSync(f)) {
      try {
        fs.unlinkSync(f);
      } catch {
        // ignore cleanup errors
      }
    }
  }
});
