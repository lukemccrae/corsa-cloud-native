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
  date?: Maybe<Scalars['String']['output']>;
  distance?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
};

export type MileData = {
  __typename?: 'MileData';
  elevationGain?: Maybe<Scalars['Int']['output']>;
  elevationLoss?: Maybe<Scalars['Int']['output']>;
  elevationProfile?: Maybe<Array<Maybe<Scalars['Int']['output']>>>;
  pace?: Maybe<Scalars['Int']['output']>;
  time?: Maybe<Scalars['Int']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  updateActivityById: Activity;
  updatePlan: Plan;
};


export type MutationUpdateActivityByIdArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdatePlanArgs = {
  planInput: PlanInput;
};

export type Plan = {
  __typename?: 'Plan';
  goalHours?: Maybe<Scalars['Int']['output']>;
  goalMinutes?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  mileData?: Maybe<Array<Maybe<MileData>>>;
  name?: Maybe<Scalars['String']['output']>;
  startTime?: Maybe<Scalars['String']['output']>;
};

export type PlanInput = {
  goalHours: Scalars['Int']['input'];
  goalMinutes: Scalars['Int']['input'];
  id: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  startTime?: InputMaybe<Scalars['String']['input']>;
};

export type Query = {
  __typename?: 'Query';
  getActivities: Array<Maybe<Activity>>;
  getActivityById?: Maybe<Activity>;
  getPlanByActivityId?: Maybe<Plan>;
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


export type QueryGetPlanByActivityIdArgs = {
  id: Scalars['String']['input'];
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
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  MileData: ResolverTypeWrapper<MileData>;
  Mutation: ResolverTypeWrapper<{}>;
  Plan: ResolverTypeWrapper<Plan>;
  PlanInput: PlanInput;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Activity: Activity;
  Boolean: Scalars['Boolean']['output'];
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  MileData: MileData;
  Mutation: {};
  Plan: Plan;
  PlanInput: PlanInput;
  Query: {};
  String: Scalars['String']['output'];
};

export type ActivityResolvers<ContextType = any, ParentType extends ResolversParentTypes['Activity'] = ResolversParentTypes['Activity']> = {
  date?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  distance?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MileDataResolvers<ContextType = any, ParentType extends ResolversParentTypes['MileData'] = ResolversParentTypes['MileData']> = {
  elevationGain?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  elevationLoss?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  elevationProfile?: Resolver<Maybe<Array<Maybe<ResolversTypes['Int']>>>, ParentType, ContextType>;
  pace?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  time?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  updateActivityById?: Resolver<ResolversTypes['Activity'], ParentType, ContextType, RequireFields<MutationUpdateActivityByIdArgs, 'id'>>;
  updatePlan?: Resolver<ResolversTypes['Plan'], ParentType, ContextType, RequireFields<MutationUpdatePlanArgs, 'planInput'>>;
};

export type PlanResolvers<ContextType = any, ParentType extends ResolversParentTypes['Plan'] = ResolversParentTypes['Plan']> = {
  goalHours?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  goalMinutes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mileData?: Resolver<Maybe<Array<Maybe<ResolversTypes['MileData']>>>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  startTime?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  getActivities?: Resolver<Array<Maybe<ResolversTypes['Activity']>>, ParentType, ContextType, RequireFields<QueryGetActivitiesArgs, 'dateFrom' | 'dateTo' | 'limit' | 'offset' | 'token' | 'userId'>>;
  getActivityById?: Resolver<Maybe<ResolversTypes['Activity']>, ParentType, ContextType, RequireFields<QueryGetActivityByIdArgs, 'id'>>;
  getPlanByActivityId?: Resolver<Maybe<ResolversTypes['Plan']>, ParentType, ContextType, RequireFields<QueryGetPlanByActivityIdArgs, 'id'>>;
};

export type Resolvers<ContextType = any> = {
  Activity?: ActivityResolvers<ContextType>;
  MileData?: MileDataResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Plan?: PlanResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
};

