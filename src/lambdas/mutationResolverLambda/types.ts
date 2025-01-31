import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type CreatedPlan = {
  __typename?: 'CreatedPlan';
  success: Scalars['Boolean']['output'];
};

export type DeletePlan = {
  __typename?: 'DeletePlan';
  success: Scalars['Boolean']['output'];
};

export type Feature = {
  __typename?: 'Feature';
  geometry: Geometry;
  properties?: Maybe<GeoProperties>;
  type: Scalars['String']['output'];
};

export type FeatureCollection = {
  __typename?: 'FeatureCollection';
  features?: Maybe<Array<Feature>>;
  type?: Maybe<Scalars['String']['output']>;
};

export type GeoProperties = {
  __typename?: 'GeoProperties';
  coordTimes?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  id?: Maybe<Scalars['Int']['output']>;
  lastMileDistance?: Maybe<Scalars['Float']['output']>;
  maxElevationInFeet?: Maybe<Scalars['Float']['output']>;
  maxGrade?: Maybe<Scalars['Float']['output']>;
  maxPace?: Maybe<Scalars['Int']['output']>;
  mileData?: Maybe<Array<Maybe<S3MileData>>>;
  minElevationInFeet?: Maybe<Scalars['Float']['output']>;
  minGrade?: Maybe<Scalars['Float']['output']>;
  minPace?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  pointMetadata?: Maybe<Array<Maybe<PointMetadata>>>;
};

export type Geometry = {
  __typename?: 'Geometry';
  coordinates?: Maybe<Array<Maybe<Array<Maybe<Scalars['Float']['output']>>>>>;
  type?: Maybe<Scalars['String']['output']>;
};

export type MileData = {
  __typename?: 'MileData';
  elevationGain: Scalars['Int']['output'];
  elevationLoss: Scalars['Int']['output'];
  gap?: Maybe<Scalars['Int']['output']>;
  mileVertProfile?: Maybe<Array<Maybe<Scalars['Int']['output']>>>;
  pace?: Maybe<Scalars['Int']['output']>;
  stopTime?: Maybe<Scalars['Int']['output']>;
};

export type MileDataInput = {
  pace?: InputMaybe<Scalars['Int']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createPlanFromGeoJson: CreatedPlan;
  deletePlanById: DeletePlan;
  publishPlan: PublishedPlan;
  updateArticleByPlanId: UpdatedArticle;
  updatePlanById: UpdatedPlan;
};


export type MutationCreatePlanFromGeoJsonArgs = {
  gpxId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
  username: Scalars['ID']['input'];
};


export type MutationDeletePlanByIdArgs = {
  slug: Scalars['ID']['input'];
  userId: Scalars['String']['input'];
};


export type MutationPublishPlanArgs = {
  published: Scalars['Boolean']['input'];
  slug: Scalars['ID']['input'];
  userId: Scalars['String']['input'];
};


export type MutationUpdateArticleByPlanIdArgs = {
  articleContent: Scalars['String']['input'];
  slug: Scalars['ID']['input'];
  userId: Scalars['String']['input'];
};


export type MutationUpdatePlanByIdArgs = {
  planInput: PlanInput;
};

export type Plan = {
  __typename?: 'Plan';
  articleContent?: Maybe<Scalars['String']['output']>;
  author?: Maybe<Scalars['String']['output']>;
  bucketKey?: Maybe<Scalars['String']['output']>;
  coverImage?: Maybe<Scalars['String']['output']>;
  distanceInMiles?: Maybe<Scalars['Int']['output']>;
  durationInSeconds?: Maybe<Scalars['Int']['output']>;
  gainInMeters?: Maybe<Scalars['Int']['output']>;
  gap?: Maybe<Scalars['Int']['output']>;
  lastMileDistance?: Maybe<Scalars['Float']['output']>;
  lossInMeters?: Maybe<Scalars['Int']['output']>;
  mileData?: Maybe<Array<Maybe<MileData>>>;
  name?: Maybe<Scalars['String']['output']>;
  profilePhoto?: Maybe<Scalars['String']['output']>;
  published?: Maybe<Scalars['Boolean']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  startTime?: Maybe<Scalars['String']['output']>;
  timezone?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type PlanInput = {
  articleContent: Scalars['String']['input'];
  paces: Array<Scalars['Int']['input']>;
  planName: Scalars['String']['input'];
  sortKey: Scalars['String']['input'];
  startTime: Scalars['Int']['input'];
  userId: Scalars['String']['input'];
};

export type PointMetadata = {
  __typename?: 'PointMetadata';
  cumulativeDistance?: Maybe<Scalars['Float']['output']>;
  elevation?: Maybe<Scalars['Float']['output']>;
  grade?: Maybe<Scalars['Float']['output']>;
  pace?: Maybe<Scalars['Int']['output']>;
  time?: Maybe<Scalars['String']['output']>;
};

export type PublishedPlan = {
  __typename?: 'PublishedPlan';
  success: Scalars['Boolean']['output'];
};

export type Query = {
  __typename?: 'Query';
  getGeoJsonByBucketKey: FeatureCollection;
  getPlanById: Plan;
  getPlansByUserId?: Maybe<Array<Maybe<Plan>>>;
  getPublishedPlans?: Maybe<Array<Maybe<Plan>>>;
  getPublishedUserInfo?: Maybe<User>;
  getUserByUsername?: Maybe<User>;
};


export type QueryGetGeoJsonByBucketKeyArgs = {
  bucketKey: Scalars['String']['input'];
};


export type QueryGetPlanByIdArgs = {
  slug: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type QueryGetPlansByUserIdArgs = {
  userId: Scalars['ID']['input'];
};


export type QueryGetPublishedUserInfoArgs = {
  username: Scalars['String']['input'];
};


export type QueryGetUserByUsernameArgs = {
  username: Scalars['String']['input'];
};

export type S3MileData = {
  __typename?: 'S3MileData';
  elevationGain: Scalars['Float']['output'];
  elevationLoss: Scalars['Float']['output'];
  index: Scalars['Int']['output'];
  stopTime: Scalars['Int']['output'];
};

export type UpdatedArticle = {
  __typename?: 'UpdatedArticle';
  success: Scalars['Boolean']['output'];
};

export type UpdatedPlan = {
  __typename?: 'UpdatedPlan';
  success: Scalars['Boolean']['output'];
};

export type User = {
  __typename?: 'User';
  bio?: Maybe<Scalars['String']['output']>;
  plans?: Maybe<Array<Maybe<Plan>>>;
  profilePicture?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['ID']['output']>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CreatedPlan: ResolverTypeWrapper<CreatedPlan>;
  DeletePlan: ResolverTypeWrapper<DeletePlan>;
  Feature: ResolverTypeWrapper<Feature>;
  FeatureCollection: ResolverTypeWrapper<FeatureCollection>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  GeoProperties: ResolverTypeWrapper<GeoProperties>;
  Geometry: ResolverTypeWrapper<Geometry>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  MileData: ResolverTypeWrapper<MileData>;
  MileDataInput: MileDataInput;
  Mutation: ResolverTypeWrapper<{}>;
  Plan: ResolverTypeWrapper<Plan>;
  PlanInput: PlanInput;
  PointMetadata: ResolverTypeWrapper<PointMetadata>;
  PublishedPlan: ResolverTypeWrapper<PublishedPlan>;
  Query: ResolverTypeWrapper<{}>;
  S3MileData: ResolverTypeWrapper<S3MileData>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  UpdatedArticle: ResolverTypeWrapper<UpdatedArticle>;
  UpdatedPlan: ResolverTypeWrapper<UpdatedPlan>;
  User: ResolverTypeWrapper<User>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  CreatedPlan: CreatedPlan;
  DeletePlan: DeletePlan;
  Feature: Feature;
  FeatureCollection: FeatureCollection;
  Float: Scalars['Float']['output'];
  GeoProperties: GeoProperties;
  Geometry: Geometry;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  MileData: MileData;
  MileDataInput: MileDataInput;
  Mutation: {};
  Plan: Plan;
  PlanInput: PlanInput;
  PointMetadata: PointMetadata;
  PublishedPlan: PublishedPlan;
  Query: {};
  S3MileData: S3MileData;
  String: Scalars['String']['output'];
  UpdatedArticle: UpdatedArticle;
  UpdatedPlan: UpdatedPlan;
  User: User;
};

export type Aws_Cognito_User_PoolsDirectiveArgs = {
  cognito_groups?: Maybe<Array<Maybe<Scalars['String']['input']>>>;
};

export type Aws_Cognito_User_PoolsDirectiveResolver<Result, Parent, ContextType = any, Args = Aws_Cognito_User_PoolsDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type Aws_IamDirectiveArgs = { };

export type Aws_IamDirectiveResolver<Result, Parent, ContextType = any, Args = Aws_IamDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type CreatedPlanResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreatedPlan'] = ResolversParentTypes['CreatedPlan']> = {
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeletePlanResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeletePlan'] = ResolversParentTypes['DeletePlan']> = {
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FeatureResolvers<ContextType = any, ParentType extends ResolversParentTypes['Feature'] = ResolversParentTypes['Feature']> = {
  geometry?: Resolver<ResolversTypes['Geometry'], ParentType, ContextType>;
  properties?: Resolver<Maybe<ResolversTypes['GeoProperties']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FeatureCollectionResolvers<ContextType = any, ParentType extends ResolversParentTypes['FeatureCollection'] = ResolversParentTypes['FeatureCollection']> = {
  features?: Resolver<Maybe<Array<ResolversTypes['Feature']>>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GeoPropertiesResolvers<ContextType = any, ParentType extends ResolversParentTypes['GeoProperties'] = ResolversParentTypes['GeoProperties']> = {
  coordTimes?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  lastMileDistance?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  maxElevationInFeet?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  maxGrade?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  maxPace?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  mileData?: Resolver<Maybe<Array<Maybe<ResolversTypes['S3MileData']>>>, ParentType, ContextType>;
  minElevationInFeet?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  minGrade?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  minPace?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  pointMetadata?: Resolver<Maybe<Array<Maybe<ResolversTypes['PointMetadata']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GeometryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Geometry'] = ResolversParentTypes['Geometry']> = {
  coordinates?: Resolver<Maybe<Array<Maybe<Array<Maybe<ResolversTypes['Float']>>>>>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MileDataResolvers<ContextType = any, ParentType extends ResolversParentTypes['MileData'] = ResolversParentTypes['MileData']> = {
  elevationGain?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  elevationLoss?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  gap?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  mileVertProfile?: Resolver<Maybe<Array<Maybe<ResolversTypes['Int']>>>, ParentType, ContextType>;
  pace?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  stopTime?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createPlanFromGeoJson?: Resolver<ResolversTypes['CreatedPlan'], ParentType, ContextType, RequireFields<MutationCreatePlanFromGeoJsonArgs, 'gpxId' | 'userId' | 'username'>>;
  deletePlanById?: Resolver<ResolversTypes['DeletePlan'], ParentType, ContextType, RequireFields<MutationDeletePlanByIdArgs, 'slug' | 'userId'>>;
  publishPlan?: Resolver<ResolversTypes['PublishedPlan'], ParentType, ContextType, RequireFields<MutationPublishPlanArgs, 'published' | 'slug' | 'userId'>>;
  updateArticleByPlanId?: Resolver<ResolversTypes['UpdatedArticle'], ParentType, ContextType, RequireFields<MutationUpdateArticleByPlanIdArgs, 'articleContent' | 'slug' | 'userId'>>;
  updatePlanById?: Resolver<ResolversTypes['UpdatedPlan'], ParentType, ContextType, RequireFields<MutationUpdatePlanByIdArgs, 'planInput'>>;
};

export type PlanResolvers<ContextType = any, ParentType extends ResolversParentTypes['Plan'] = ResolversParentTypes['Plan']> = {
  articleContent?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  author?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  bucketKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  coverImage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  distanceInMiles?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  durationInSeconds?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  gainInMeters?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  gap?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  lastMileDistance?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  lossInMeters?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  mileData?: Resolver<Maybe<Array<Maybe<ResolversTypes['MileData']>>>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  profilePhoto?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  published?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  slug?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  startTime?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  timezone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PointMetadataResolvers<ContextType = any, ParentType extends ResolversParentTypes['PointMetadata'] = ResolversParentTypes['PointMetadata']> = {
  cumulativeDistance?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  elevation?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  grade?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  pace?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  time?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PublishedPlanResolvers<ContextType = any, ParentType extends ResolversParentTypes['PublishedPlan'] = ResolversParentTypes['PublishedPlan']> = {
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  getGeoJsonByBucketKey?: Resolver<ResolversTypes['FeatureCollection'], ParentType, ContextType, RequireFields<QueryGetGeoJsonByBucketKeyArgs, 'bucketKey'>>;
  getPlanById?: Resolver<ResolversTypes['Plan'], ParentType, ContextType, RequireFields<QueryGetPlanByIdArgs, 'slug' | 'userId'>>;
  getPlansByUserId?: Resolver<Maybe<Array<Maybe<ResolversTypes['Plan']>>>, ParentType, ContextType, RequireFields<QueryGetPlansByUserIdArgs, 'userId'>>;
  getPublishedPlans?: Resolver<Maybe<Array<Maybe<ResolversTypes['Plan']>>>, ParentType, ContextType>;
  getPublishedUserInfo?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryGetPublishedUserInfoArgs, 'username'>>;
  getUserByUsername?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryGetUserByUsernameArgs, 'username'>>;
};

export type S3MileDataResolvers<ContextType = any, ParentType extends ResolversParentTypes['S3MileData'] = ResolversParentTypes['S3MileData']> = {
  elevationGain?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  elevationLoss?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  index?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  stopTime?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdatedArticleResolvers<ContextType = any, ParentType extends ResolversParentTypes['UpdatedArticle'] = ResolversParentTypes['UpdatedArticle']> = {
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdatedPlanResolvers<ContextType = any, ParentType extends ResolversParentTypes['UpdatedPlan'] = ResolversParentTypes['UpdatedPlan']> = {
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  bio?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  plans?: Resolver<Maybe<Array<Maybe<ResolversTypes['Plan']>>>, ParentType, ContextType>;
  profilePicture?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  CreatedPlan?: CreatedPlanResolvers<ContextType>;
  DeletePlan?: DeletePlanResolvers<ContextType>;
  Feature?: FeatureResolvers<ContextType>;
  FeatureCollection?: FeatureCollectionResolvers<ContextType>;
  GeoProperties?: GeoPropertiesResolvers<ContextType>;
  Geometry?: GeometryResolvers<ContextType>;
  MileData?: MileDataResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Plan?: PlanResolvers<ContextType>;
  PointMetadata?: PointMetadataResolvers<ContextType>;
  PublishedPlan?: PublishedPlanResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  S3MileData?: S3MileDataResolvers<ContextType>;
  UpdatedArticle?: UpdatedArticleResolvers<ContextType>;
  UpdatedPlan?: UpdatedPlanResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
};

export type DirectiveResolvers<ContextType = any> = {
  aws_cognito_user_pools?: Aws_Cognito_User_PoolsDirectiveResolver<any, any, ContextType>;
  aws_iam?: Aws_IamDirectiveResolver<any, any, ContextType>;
};
