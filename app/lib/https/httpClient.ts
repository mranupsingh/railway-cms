'use client'

import { clientApi } from "./axios.client";
import { createVersionedApiService } from "./createVersionedApiService";
import { ApiVersion } from "./types";

export const httpClient = {
    ...createVersionedApiService(clientApi, ApiVersion.V1),
    v1: createVersionedApiService(clientApi, ApiVersion.V1),
    v2: createVersionedApiService(clientApi, ApiVersion.V2),
};
