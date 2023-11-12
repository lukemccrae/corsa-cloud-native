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

export type Activity = {
  __typename?: 'Activity';
  distance: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  start_date?: Maybe<Scalars['String']['output']>;
};

export type CreatedPlan = {
  __typename?: 'CreatedPlan';
  success: Scalars['Boolean']['output'];
};

export type Feature = {
  __typename?: 'Feature';
  geometry?: Maybe<Geometry>;
  properties?: Maybe<GeoProperties>;
  type?: Maybe<Scalars['String']['output']>;
};

export type FeatureCollection = {
  __typename?: 'FeatureCollection';
  features?: Maybe<Array<Feature>>;
  type?: Maybe<Scalars['String']['output']>;
};

export type GeoProperties = {
  __typename?: 'GeoProperties';
  id?: Maybe<Scalars['Int']['output']>;
  lastMileDistance?: Maybe<Scalars['Float']['output']>;
  mileData?: Maybe<Array<Maybe<S3MileData>>>;
  name?: Maybe<Scalars['String']['output']>;
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
  mileVertProfile?: Maybe<Array<Maybe<Scalars['Int']['output']>>>;
  pace?: Maybe<Scalars['Int']['output']>;
};

export type MileDataInput = {
  pace?: InputMaybe<Scalars['Int']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createPlanFromActivity: CreatedPlan;
  createPlanFromGpx: CreatedPlan;
  updatePlanById: UpdatedPlan;
};


export type MutationCreatePlanFromActivityArgs = {
  activityId: Scalars['ID']['input'];
  planName: Scalars['String']['input'];
  token: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationCreatePlanFromGpxArgs = {
  gpx: Scalars['String']['input'];
};


export type MutationUpdatePlanByIdArgs = {
  planInput: PlanInput;
};

export type Plan = {
  __typename?: 'Plan';
  id?: Maybe<Scalars['String']['output']>;
  mileData?: Maybe<Array<Maybe<MileData>>>;
  name?: Maybe<Scalars['String']['output']>;
  startTime?: Maybe<Scalars['Int']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type PlanInput = {
  paces: Array<Scalars['Int']['input']>;
  planName: Scalars['String']['input'];
  sortKey: Scalars['String']['input'];
  startTime: Scalars['Int']['input'];
  userId: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  getActivities: Array<Maybe<Activity>>;
  getActivityById?: Maybe<Activity>;
  getGeoJsonBySortKey: FeatureCollection;
  getPlansByUserId?: Maybe<Array<Maybe<Plan>>>;
};


export type QueryGetActivitiesArgs = {
  dateFrom: Scalars['Int']['input'];
  dateTo: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
  offset: Scalars['Int']['input'];
  token: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type QueryGetActivityByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetGeoJsonBySortKeyArgs = {
  sortKey: Scalars['String']['input'];
};


export type QueryGetPlansByUserIdArgs = {
  userId: Scalars['ID']['input'];
};

export type S3MileData = {
  __typename?: 'S3MileData';
  elevationGain: Scalars['Float']['output'];
  elevationLoss: Scalars['Float']['output'];
  index: Scalars['Int']['output'];
};

export type UpdatedPlan = {
  __typename?: 'UpdatedPlan';
  success: Scalars['Boolean']['output'];
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
  Activity: ResolverTypeWrapper<Activity>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CreatedPlan: ResolverTypeWrapper<CreatedPlan>;
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
  Query: ResolverTypeWrapper<{}>;
  S3MileData: ResolverTypeWrapper<S3MileData>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  UpdatedPlan: ResolverTypeWrapper<UpdatedPlan>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Activity: Activity;
  Boolean: Scalars['Boolean']['output'];
  CreatedPlan: CreatedPlan;
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
  Query: {};
  S3MileData: S3MileData;
  String: Scalars['String']['output'];
  UpdatedPlan: UpdatedPlan;
};

export type ActivityResolvers<ContextType = any, ParentType extends ResolversParentTypes['Activity'] = ResolversParentTypes['Activity']> = {
  distance?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  start_date?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreatedPlanResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreatedPlan'] = ResolversParentTypes['CreatedPlan']> = {
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FeatureResolvers<ContextType = any, ParentType extends ResolversParentTypes['Feature'] = ResolversParentTypes['Feature']> = {
  geometry?: Resolver<Maybe<ResolversTypes['Geometry']>, ParentType, ContextType>;
  properties?: Resolver<Maybe<ResolversTypes['GeoProperties']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FeatureCollectionResolvers<ContextType = any, ParentType extends ResolversParentTypes['FeatureCollection'] = ResolversParentTypes['FeatureCollection']> = {
  features?: Resolver<Maybe<Array<ResolversTypes['Feature']>>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GeoPropertiesResolvers<ContextType = any, ParentType extends ResolversParentTypes['GeoProperties'] = ResolversParentTypes['GeoProperties']> = {
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  lastMileDistance?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  mileData?: Resolver<Maybe<Array<Maybe<ResolversTypes['S3MileData']>>>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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
  mileVertProfile?: Resolver<Maybe<Array<Maybe<ResolversTypes['Int']>>>, ParentType, ContextType>;
  pace?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createPlanFromActivity?: Resolver<ResolversTypes['CreatedPlan'], ParentType, ContextType, RequireFields<MutationCreatePlanFromActivityArgs, 'activityId' | 'planName' | 'token' | 'userId'>>;
  createPlanFromGpx?: Resolver<ResolversTypes['CreatedPlan'], ParentType, ContextType, RequireFields<MutationCreatePlanFromGpxArgs, 'gpx'>>;
  updatePlanById?: Resolver<ResolversTypes['UpdatedPlan'], ParentType, ContextType, RequireFields<MutationUpdatePlanByIdArgs, 'planInput'>>;
};

export type PlanResolvers<ContextType = any, ParentType extends ResolversParentTypes['Plan'] = ResolversParentTypes['Plan']> = {
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mileData?: Resolver<Maybe<Array<Maybe<ResolversTypes['MileData']>>>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  startTime?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  userId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  getActivities?: Resolver<Array<Maybe<ResolversTypes['Activity']>>, ParentType, ContextType, RequireFields<QueryGetActivitiesArgs, 'dateFrom' | 'dateTo' | 'limit' | 'offset' | 'token' | 'userId'>>;
  getActivityById?: Resolver<Maybe<ResolversTypes['Activity']>, ParentType, ContextType, RequireFields<QueryGetActivityByIdArgs, 'id'>>;
  getGeoJsonBySortKey?: Resolver<ResolversTypes['FeatureCollection'], ParentType, ContextType, RequireFields<QueryGetGeoJsonBySortKeyArgs, 'sortKey'>>;
  getPlansByUserId?: Resolver<Maybe<Array<Maybe<ResolversTypes['Plan']>>>, ParentType, ContextType, RequireFields<QueryGetPlansByUserIdArgs, 'userId'>>;
};

export type S3MileDataResolvers<ContextType = any, ParentType extends ResolversParentTypes['S3MileData'] = ResolversParentTypes['S3MileData']> = {
  elevationGain?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  elevationLoss?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  index?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdatedPlanResolvers<ContextType = any, ParentType extends ResolversParentTypes['UpdatedPlan'] = ResolversParentTypes['UpdatedPlan']> = {
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Activity?: ActivityResolvers<ContextType>;
  CreatedPlan?: CreatedPlanResolvers<ContextType>;
  Feature?: FeatureResolvers<ContextType>;
  FeatureCollection?: FeatureCollectionResolvers<ContextType>;
  GeoProperties?: GeoPropertiesResolvers<ContextType>;
  Geometry?: GeometryResolvers<ContextType>;
  MileData?: MileDataResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Plan?: PlanResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  S3MileData?: S3MileDataResolvers<ContextType>;
  UpdatedPlan?: UpdatedPlanResolvers<ContextType>;
};

