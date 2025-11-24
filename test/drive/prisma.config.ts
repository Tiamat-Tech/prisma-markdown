import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "drive.prisma",
  datasource: {
    url: "localhost",
  },
});
