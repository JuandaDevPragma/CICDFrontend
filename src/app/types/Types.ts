export type RequestDto = {
  type: string;
  repo?: string;
}

export type RepoDetailDb = {
  app: string;
  type: string;
  bucket?: string; //nombre del bucket en caso de step functions, lambdas, etc
  name1?: string; // nombre del componente en paso 1 para configurar en aws (ecr, lambda, step function)
  name2?: string; // nombre del componente en paso 2 para configurar en aws (ecs, eks)
  name3?: string; // nombre opcional
  name4?: string; // nombre opcional
  stage?: number;
  link?:string;// the last build url
};

export type RepoDetailResponse = {
  props: RepoDetailDb;
  config: ConfigRepo;
  branches: Array<string>;
  detail?: Detail;
}

export type GetBuildRepo = {
  app: RepoDetailResponse;
  params: Params;
}

export type ConfigRepo = {
  url: string;
  clone: string;
}

export type CacheEntry<T> = {
  value: T;
  timestamp: number;
  ttl: number;
}

export type Detail = {
  account: string;
  region: string;
  branch: string;
};

export type Repositories = {
  params: Params;
  repos: Array<RepoDetailResponse>;
}

export type Params = {
  accounts: Array<string>;
  regions: Array<string>;
}


export type RequestBuild = {
  props: RepoDetailDb;
  config: ConfigRepo;
  detail: Detail;
}

export type BuildResponse = {
  id: string;
  link: string;
  message: string;
}


export type SingleRepoState = {
  state: number;
  link: string;
}
