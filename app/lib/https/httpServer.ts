import { serverApi } from "./axios.server";
import { createVersionedApiService } from "./createVersionedApiService";
import { ApiVersion } from "./types";

export const httpServer = {
    ...createVersionedApiService(serverApi, ApiVersion.V1),
    v1: createVersionedApiService(serverApi, ApiVersion.V1),
    v2: createVersionedApiService(serverApi, ApiVersion.V2),
};
