
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Project
 * 
 */
export type Project = $Result.DefaultSelection<Prisma.$ProjectPayload>
/**
 * Model MethodologyStep
 * 
 */
export type MethodologyStep = $Result.DefaultSelection<Prisma.$MethodologyStepPayload>
/**
 * Model LLMProvider
 * 
 */
export type LLMProvider = $Result.DefaultSelection<Prisma.$LLMProviderPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const ProjectStatus: {
  in_progress: 'in_progress',
  completed: 'completed',
  failed: 'failed'
};

export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus]

}

export type ProjectStatus = $Enums.ProjectStatus

export const ProjectStatus: typeof $Enums.ProjectStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Projects
 * const projects = await prisma.project.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Projects
   * const projects = await prisma.project.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.project`: Exposes CRUD operations for the **Project** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Projects
    * const projects = await prisma.project.findMany()
    * ```
    */
  get project(): Prisma.ProjectDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.methodologyStep`: Exposes CRUD operations for the **MethodologyStep** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MethodologySteps
    * const methodologySteps = await prisma.methodologyStep.findMany()
    * ```
    */
  get methodologyStep(): Prisma.MethodologyStepDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.lLMProvider`: Exposes CRUD operations for the **LLMProvider** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LLMProviders
    * const lLMProviders = await prisma.lLMProvider.findMany()
    * ```
    */
  get lLMProvider(): Prisma.LLMProviderDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.7.0
   * Query Engine version: 3cff47a7f5d65c3ea74883f1d736e41d68ce91ed
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Project: 'Project',
    MethodologyStep: 'MethodologyStep',
    LLMProvider: 'LLMProvider'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "project" | "methodologyStep" | "lLMProvider"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Project: {
        payload: Prisma.$ProjectPayload<ExtArgs>
        fields: Prisma.ProjectFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProjectFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProjectFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          findFirst: {
            args: Prisma.ProjectFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProjectFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          findMany: {
            args: Prisma.ProjectFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>[]
          }
          create: {
            args: Prisma.ProjectCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          createMany: {
            args: Prisma.ProjectCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProjectCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>[]
          }
          delete: {
            args: Prisma.ProjectDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          update: {
            args: Prisma.ProjectUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          deleteMany: {
            args: Prisma.ProjectDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProjectUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ProjectUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>[]
          }
          upsert: {
            args: Prisma.ProjectUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          aggregate: {
            args: Prisma.ProjectAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProject>
          }
          groupBy: {
            args: Prisma.ProjectGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProjectGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProjectCountArgs<ExtArgs>
            result: $Utils.Optional<ProjectCountAggregateOutputType> | number
          }
        }
      }
      MethodologyStep: {
        payload: Prisma.$MethodologyStepPayload<ExtArgs>
        fields: Prisma.MethodologyStepFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MethodologyStepFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MethodologyStepPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MethodologyStepFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MethodologyStepPayload>
          }
          findFirst: {
            args: Prisma.MethodologyStepFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MethodologyStepPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MethodologyStepFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MethodologyStepPayload>
          }
          findMany: {
            args: Prisma.MethodologyStepFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MethodologyStepPayload>[]
          }
          create: {
            args: Prisma.MethodologyStepCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MethodologyStepPayload>
          }
          createMany: {
            args: Prisma.MethodologyStepCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MethodologyStepCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MethodologyStepPayload>[]
          }
          delete: {
            args: Prisma.MethodologyStepDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MethodologyStepPayload>
          }
          update: {
            args: Prisma.MethodologyStepUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MethodologyStepPayload>
          }
          deleteMany: {
            args: Prisma.MethodologyStepDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MethodologyStepUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MethodologyStepUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MethodologyStepPayload>[]
          }
          upsert: {
            args: Prisma.MethodologyStepUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MethodologyStepPayload>
          }
          aggregate: {
            args: Prisma.MethodologyStepAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMethodologyStep>
          }
          groupBy: {
            args: Prisma.MethodologyStepGroupByArgs<ExtArgs>
            result: $Utils.Optional<MethodologyStepGroupByOutputType>[]
          }
          count: {
            args: Prisma.MethodologyStepCountArgs<ExtArgs>
            result: $Utils.Optional<MethodologyStepCountAggregateOutputType> | number
          }
        }
      }
      LLMProvider: {
        payload: Prisma.$LLMProviderPayload<ExtArgs>
        fields: Prisma.LLMProviderFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LLMProviderFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMProviderPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LLMProviderFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMProviderPayload>
          }
          findFirst: {
            args: Prisma.LLMProviderFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMProviderPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LLMProviderFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMProviderPayload>
          }
          findMany: {
            args: Prisma.LLMProviderFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMProviderPayload>[]
          }
          create: {
            args: Prisma.LLMProviderCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMProviderPayload>
          }
          createMany: {
            args: Prisma.LLMProviderCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LLMProviderCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMProviderPayload>[]
          }
          delete: {
            args: Prisma.LLMProviderDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMProviderPayload>
          }
          update: {
            args: Prisma.LLMProviderUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMProviderPayload>
          }
          deleteMany: {
            args: Prisma.LLMProviderDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LLMProviderUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LLMProviderUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMProviderPayload>[]
          }
          upsert: {
            args: Prisma.LLMProviderUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMProviderPayload>
          }
          aggregate: {
            args: Prisma.LLMProviderAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLLMProvider>
          }
          groupBy: {
            args: Prisma.LLMProviderGroupByArgs<ExtArgs>
            result: $Utils.Optional<LLMProviderGroupByOutputType>[]
          }
          count: {
            args: Prisma.LLMProviderCountArgs<ExtArgs>
            result: $Utils.Optional<LLMProviderCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    project?: ProjectOmit
    methodologyStep?: MethodologyStepOmit
    lLMProvider?: LLMProviderOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type ProjectCountOutputType
   */

  export type ProjectCountOutputType = {
    steps: number
  }

  export type ProjectCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    steps?: boolean | ProjectCountOutputTypeCountStepsArgs
  }

  // Custom InputTypes
  /**
   * ProjectCountOutputType without action
   */
  export type ProjectCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProjectCountOutputType
     */
    select?: ProjectCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ProjectCountOutputType without action
   */
  export type ProjectCountOutputTypeCountStepsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MethodologyStepWhereInput
  }


  /**
   * Count Type MethodologyStepCountOutputType
   */

  export type MethodologyStepCountOutputType = {
    llmProviders: number
  }

  export type MethodologyStepCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    llmProviders?: boolean | MethodologyStepCountOutputTypeCountLlmProvidersArgs
  }

  // Custom InputTypes
  /**
   * MethodologyStepCountOutputType without action
   */
  export type MethodologyStepCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MethodologyStepCountOutputType
     */
    select?: MethodologyStepCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * MethodologyStepCountOutputType without action
   */
  export type MethodologyStepCountOutputTypeCountLlmProvidersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LLMProviderWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Project
   */

  export type AggregateProject = {
    _count: ProjectCountAggregateOutputType | null
    _avg: ProjectAvgAggregateOutputType | null
    _sum: ProjectSumAggregateOutputType | null
    _min: ProjectMinAggregateOutputType | null
    _max: ProjectMaxAggregateOutputType | null
  }

  export type ProjectAvgAggregateOutputType = {
    id: number | null
  }

  export type ProjectSumAggregateOutputType = {
    id: number | null
  }

  export type ProjectMinAggregateOutputType = {
    id: number | null
    name: string | null
    description: string | null
    legalText: string | null
    status: $Enums.ProjectStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProjectMaxAggregateOutputType = {
    id: number | null
    name: string | null
    description: string | null
    legalText: string | null
    status: $Enums.ProjectStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProjectCountAggregateOutputType = {
    id: number
    name: number
    description: number
    legalText: number
    status: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ProjectAvgAggregateInputType = {
    id?: true
  }

  export type ProjectSumAggregateInputType = {
    id?: true
  }

  export type ProjectMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    legalText?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProjectMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    legalText?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProjectCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    legalText?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ProjectAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Project to aggregate.
     */
    where?: ProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Projects to fetch.
     */
    orderBy?: ProjectOrderByWithRelationInput | ProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Projects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Projects
    **/
    _count?: true | ProjectCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProjectAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProjectSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProjectMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProjectMaxAggregateInputType
  }

  export type GetProjectAggregateType<T extends ProjectAggregateArgs> = {
        [P in keyof T & keyof AggregateProject]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProject[P]>
      : GetScalarType<T[P], AggregateProject[P]>
  }




  export type ProjectGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProjectWhereInput
    orderBy?: ProjectOrderByWithAggregationInput | ProjectOrderByWithAggregationInput[]
    by: ProjectScalarFieldEnum[] | ProjectScalarFieldEnum
    having?: ProjectScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProjectCountAggregateInputType | true
    _avg?: ProjectAvgAggregateInputType
    _sum?: ProjectSumAggregateInputType
    _min?: ProjectMinAggregateInputType
    _max?: ProjectMaxAggregateInputType
  }

  export type ProjectGroupByOutputType = {
    id: number
    name: string
    description: string | null
    legalText: string
    status: $Enums.ProjectStatus
    createdAt: Date
    updatedAt: Date
    _count: ProjectCountAggregateOutputType | null
    _avg: ProjectAvgAggregateOutputType | null
    _sum: ProjectSumAggregateOutputType | null
    _min: ProjectMinAggregateOutputType | null
    _max: ProjectMaxAggregateOutputType | null
  }

  type GetProjectGroupByPayload<T extends ProjectGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProjectGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProjectGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProjectGroupByOutputType[P]>
            : GetScalarType<T[P], ProjectGroupByOutputType[P]>
        }
      >
    >


  export type ProjectSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    legalText?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    steps?: boolean | Project$stepsArgs<ExtArgs>
    _count?: boolean | ProjectCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["project"]>

  export type ProjectSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    legalText?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["project"]>

  export type ProjectSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    legalText?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["project"]>

  export type ProjectSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    legalText?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ProjectOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description" | "legalText" | "status" | "createdAt" | "updatedAt", ExtArgs["result"]["project"]>
  export type ProjectInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    steps?: boolean | Project$stepsArgs<ExtArgs>
    _count?: boolean | ProjectCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ProjectIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type ProjectIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ProjectPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Project"
    objects: {
      steps: Prisma.$MethodologyStepPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      description: string | null
      legalText: string
      status: $Enums.ProjectStatus
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["project"]>
    composites: {}
  }

  type ProjectGetPayload<S extends boolean | null | undefined | ProjectDefaultArgs> = $Result.GetResult<Prisma.$ProjectPayload, S>

  type ProjectCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ProjectFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProjectCountAggregateInputType | true
    }

  export interface ProjectDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Project'], meta: { name: 'Project' } }
    /**
     * Find zero or one Project that matches the filter.
     * @param {ProjectFindUniqueArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProjectFindUniqueArgs>(args: SelectSubset<T, ProjectFindUniqueArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Project that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProjectFindUniqueOrThrowArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProjectFindUniqueOrThrowArgs>(args: SelectSubset<T, ProjectFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Project that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectFindFirstArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProjectFindFirstArgs>(args?: SelectSubset<T, ProjectFindFirstArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Project that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectFindFirstOrThrowArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProjectFindFirstOrThrowArgs>(args?: SelectSubset<T, ProjectFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Projects that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Projects
     * const projects = await prisma.project.findMany()
     * 
     * // Get first 10 Projects
     * const projects = await prisma.project.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const projectWithIdOnly = await prisma.project.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProjectFindManyArgs>(args?: SelectSubset<T, ProjectFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Project.
     * @param {ProjectCreateArgs} args - Arguments to create a Project.
     * @example
     * // Create one Project
     * const Project = await prisma.project.create({
     *   data: {
     *     // ... data to create a Project
     *   }
     * })
     * 
     */
    create<T extends ProjectCreateArgs>(args: SelectSubset<T, ProjectCreateArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Projects.
     * @param {ProjectCreateManyArgs} args - Arguments to create many Projects.
     * @example
     * // Create many Projects
     * const project = await prisma.project.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProjectCreateManyArgs>(args?: SelectSubset<T, ProjectCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Projects and returns the data saved in the database.
     * @param {ProjectCreateManyAndReturnArgs} args - Arguments to create many Projects.
     * @example
     * // Create many Projects
     * const project = await prisma.project.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Projects and only return the `id`
     * const projectWithIdOnly = await prisma.project.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProjectCreateManyAndReturnArgs>(args?: SelectSubset<T, ProjectCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Project.
     * @param {ProjectDeleteArgs} args - Arguments to delete one Project.
     * @example
     * // Delete one Project
     * const Project = await prisma.project.delete({
     *   where: {
     *     // ... filter to delete one Project
     *   }
     * })
     * 
     */
    delete<T extends ProjectDeleteArgs>(args: SelectSubset<T, ProjectDeleteArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Project.
     * @param {ProjectUpdateArgs} args - Arguments to update one Project.
     * @example
     * // Update one Project
     * const project = await prisma.project.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProjectUpdateArgs>(args: SelectSubset<T, ProjectUpdateArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Projects.
     * @param {ProjectDeleteManyArgs} args - Arguments to filter Projects to delete.
     * @example
     * // Delete a few Projects
     * const { count } = await prisma.project.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProjectDeleteManyArgs>(args?: SelectSubset<T, ProjectDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Projects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Projects
     * const project = await prisma.project.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProjectUpdateManyArgs>(args: SelectSubset<T, ProjectUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Projects and returns the data updated in the database.
     * @param {ProjectUpdateManyAndReturnArgs} args - Arguments to update many Projects.
     * @example
     * // Update many Projects
     * const project = await prisma.project.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Projects and only return the `id`
     * const projectWithIdOnly = await prisma.project.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ProjectUpdateManyAndReturnArgs>(args: SelectSubset<T, ProjectUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Project.
     * @param {ProjectUpsertArgs} args - Arguments to update or create a Project.
     * @example
     * // Update or create a Project
     * const project = await prisma.project.upsert({
     *   create: {
     *     // ... data to create a Project
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Project we want to update
     *   }
     * })
     */
    upsert<T extends ProjectUpsertArgs>(args: SelectSubset<T, ProjectUpsertArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Projects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectCountArgs} args - Arguments to filter Projects to count.
     * @example
     * // Count the number of Projects
     * const count = await prisma.project.count({
     *   where: {
     *     // ... the filter for the Projects we want to count
     *   }
     * })
    **/
    count<T extends ProjectCountArgs>(
      args?: Subset<T, ProjectCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProjectCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Project.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProjectAggregateArgs>(args: Subset<T, ProjectAggregateArgs>): Prisma.PrismaPromise<GetProjectAggregateType<T>>

    /**
     * Group by Project.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProjectGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProjectGroupByArgs['orderBy'] }
        : { orderBy?: ProjectGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProjectGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProjectGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Project model
   */
  readonly fields: ProjectFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Project.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProjectClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    steps<T extends Project$stepsArgs<ExtArgs> = {}>(args?: Subset<T, Project$stepsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MethodologyStepPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Project model
   */
  interface ProjectFieldRefs {
    readonly id: FieldRef<"Project", 'Int'>
    readonly name: FieldRef<"Project", 'String'>
    readonly description: FieldRef<"Project", 'String'>
    readonly legalText: FieldRef<"Project", 'String'>
    readonly status: FieldRef<"Project", 'ProjectStatus'>
    readonly createdAt: FieldRef<"Project", 'DateTime'>
    readonly updatedAt: FieldRef<"Project", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Project findUnique
   */
  export type ProjectFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * Filter, which Project to fetch.
     */
    where: ProjectWhereUniqueInput
  }

  /**
   * Project findUniqueOrThrow
   */
  export type ProjectFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * Filter, which Project to fetch.
     */
    where: ProjectWhereUniqueInput
  }

  /**
   * Project findFirst
   */
  export type ProjectFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * Filter, which Project to fetch.
     */
    where?: ProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Projects to fetch.
     */
    orderBy?: ProjectOrderByWithRelationInput | ProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Projects.
     */
    cursor?: ProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Projects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Projects.
     */
    distinct?: ProjectScalarFieldEnum | ProjectScalarFieldEnum[]
  }

  /**
   * Project findFirstOrThrow
   */
  export type ProjectFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * Filter, which Project to fetch.
     */
    where?: ProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Projects to fetch.
     */
    orderBy?: ProjectOrderByWithRelationInput | ProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Projects.
     */
    cursor?: ProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Projects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Projects.
     */
    distinct?: ProjectScalarFieldEnum | ProjectScalarFieldEnum[]
  }

  /**
   * Project findMany
   */
  export type ProjectFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * Filter, which Projects to fetch.
     */
    where?: ProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Projects to fetch.
     */
    orderBy?: ProjectOrderByWithRelationInput | ProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Projects.
     */
    cursor?: ProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Projects.
     */
    skip?: number
    distinct?: ProjectScalarFieldEnum | ProjectScalarFieldEnum[]
  }

  /**
   * Project create
   */
  export type ProjectCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * The data needed to create a Project.
     */
    data: XOR<ProjectCreateInput, ProjectUncheckedCreateInput>
  }

  /**
   * Project createMany
   */
  export type ProjectCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Projects.
     */
    data: ProjectCreateManyInput | ProjectCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Project createManyAndReturn
   */
  export type ProjectCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * The data used to create many Projects.
     */
    data: ProjectCreateManyInput | ProjectCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Project update
   */
  export type ProjectUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * The data needed to update a Project.
     */
    data: XOR<ProjectUpdateInput, ProjectUncheckedUpdateInput>
    /**
     * Choose, which Project to update.
     */
    where: ProjectWhereUniqueInput
  }

  /**
   * Project updateMany
   */
  export type ProjectUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Projects.
     */
    data: XOR<ProjectUpdateManyMutationInput, ProjectUncheckedUpdateManyInput>
    /**
     * Filter which Projects to update
     */
    where?: ProjectWhereInput
    /**
     * Limit how many Projects to update.
     */
    limit?: number
  }

  /**
   * Project updateManyAndReturn
   */
  export type ProjectUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * The data used to update Projects.
     */
    data: XOR<ProjectUpdateManyMutationInput, ProjectUncheckedUpdateManyInput>
    /**
     * Filter which Projects to update
     */
    where?: ProjectWhereInput
    /**
     * Limit how many Projects to update.
     */
    limit?: number
  }

  /**
   * Project upsert
   */
  export type ProjectUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * The filter to search for the Project to update in case it exists.
     */
    where: ProjectWhereUniqueInput
    /**
     * In case the Project found by the `where` argument doesn't exist, create a new Project with this data.
     */
    create: XOR<ProjectCreateInput, ProjectUncheckedCreateInput>
    /**
     * In case the Project was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProjectUpdateInput, ProjectUncheckedUpdateInput>
  }

  /**
   * Project delete
   */
  export type ProjectDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * Filter which Project to delete.
     */
    where: ProjectWhereUniqueInput
  }

  /**
   * Project deleteMany
   */
  export type ProjectDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Projects to delete
     */
    where?: ProjectWhereInput
    /**
     * Limit how many Projects to delete.
     */
    limit?: number
  }

  /**
   * Project.steps
   */
  export type Project$stepsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MethodologyStep
     */
    select?: MethodologyStepSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MethodologyStep
     */
    omit?: MethodologyStepOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MethodologyStepInclude<ExtArgs> | null
    where?: MethodologyStepWhereInput
    orderBy?: MethodologyStepOrderByWithRelationInput | MethodologyStepOrderByWithRelationInput[]
    cursor?: MethodologyStepWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MethodologyStepScalarFieldEnum | MethodologyStepScalarFieldEnum[]
  }

  /**
   * Project without action
   */
  export type ProjectDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
  }


  /**
   * Model MethodologyStep
   */

  export type AggregateMethodologyStep = {
    _count: MethodologyStepCountAggregateOutputType | null
    _avg: MethodologyStepAvgAggregateOutputType | null
    _sum: MethodologyStepSumAggregateOutputType | null
    _min: MethodologyStepMinAggregateOutputType | null
    _max: MethodologyStepMaxAggregateOutputType | null
  }

  export type MethodologyStepAvgAggregateOutputType = {
    id: number | null
    projectId: number | null
    phase: number | null
    stepNumber: number | null
    confidenceScore: Decimal | null
  }

  export type MethodologyStepSumAggregateOutputType = {
    id: number | null
    projectId: number | null
    phase: number | null
    stepNumber: number | null
    confidenceScore: Decimal | null
  }

  export type MethodologyStepMinAggregateOutputType = {
    id: number | null
    projectId: number | null
    phase: number | null
    stepNumber: number | null
    stepName: string | null
    confidenceScore: Decimal | null
    schemaValid: boolean | null
    humanModified: boolean | null
    approved: boolean | null
    reviewNotes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MethodologyStepMaxAggregateOutputType = {
    id: number | null
    projectId: number | null
    phase: number | null
    stepNumber: number | null
    stepName: string | null
    confidenceScore: Decimal | null
    schemaValid: boolean | null
    humanModified: boolean | null
    approved: boolean | null
    reviewNotes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MethodologyStepCountAggregateOutputType = {
    id: number
    projectId: number
    phase: number
    stepNumber: number
    stepName: number
    input: number
    llmOutput: number
    humanOutput: number
    confidenceScore: number
    schemaValid: number
    humanModified: number
    approved: number
    reviewNotes: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type MethodologyStepAvgAggregateInputType = {
    id?: true
    projectId?: true
    phase?: true
    stepNumber?: true
    confidenceScore?: true
  }

  export type MethodologyStepSumAggregateInputType = {
    id?: true
    projectId?: true
    phase?: true
    stepNumber?: true
    confidenceScore?: true
  }

  export type MethodologyStepMinAggregateInputType = {
    id?: true
    projectId?: true
    phase?: true
    stepNumber?: true
    stepName?: true
    confidenceScore?: true
    schemaValid?: true
    humanModified?: true
    approved?: true
    reviewNotes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MethodologyStepMaxAggregateInputType = {
    id?: true
    projectId?: true
    phase?: true
    stepNumber?: true
    stepName?: true
    confidenceScore?: true
    schemaValid?: true
    humanModified?: true
    approved?: true
    reviewNotes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MethodologyStepCountAggregateInputType = {
    id?: true
    projectId?: true
    phase?: true
    stepNumber?: true
    stepName?: true
    input?: true
    llmOutput?: true
    humanOutput?: true
    confidenceScore?: true
    schemaValid?: true
    humanModified?: true
    approved?: true
    reviewNotes?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type MethodologyStepAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MethodologyStep to aggregate.
     */
    where?: MethodologyStepWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MethodologySteps to fetch.
     */
    orderBy?: MethodologyStepOrderByWithRelationInput | MethodologyStepOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MethodologyStepWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MethodologySteps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MethodologySteps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MethodologySteps
    **/
    _count?: true | MethodologyStepCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MethodologyStepAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MethodologyStepSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MethodologyStepMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MethodologyStepMaxAggregateInputType
  }

  export type GetMethodologyStepAggregateType<T extends MethodologyStepAggregateArgs> = {
        [P in keyof T & keyof AggregateMethodologyStep]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMethodologyStep[P]>
      : GetScalarType<T[P], AggregateMethodologyStep[P]>
  }




  export type MethodologyStepGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MethodologyStepWhereInput
    orderBy?: MethodologyStepOrderByWithAggregationInput | MethodologyStepOrderByWithAggregationInput[]
    by: MethodologyStepScalarFieldEnum[] | MethodologyStepScalarFieldEnum
    having?: MethodologyStepScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MethodologyStepCountAggregateInputType | true
    _avg?: MethodologyStepAvgAggregateInputType
    _sum?: MethodologyStepSumAggregateInputType
    _min?: MethodologyStepMinAggregateInputType
    _max?: MethodologyStepMaxAggregateInputType
  }

  export type MethodologyStepGroupByOutputType = {
    id: number
    projectId: number
    phase: number
    stepNumber: number
    stepName: string
    input: JsonValue
    llmOutput: JsonValue
    humanOutput: JsonValue | null
    confidenceScore: Decimal | null
    schemaValid: boolean
    humanModified: boolean
    approved: boolean
    reviewNotes: string | null
    createdAt: Date
    updatedAt: Date
    _count: MethodologyStepCountAggregateOutputType | null
    _avg: MethodologyStepAvgAggregateOutputType | null
    _sum: MethodologyStepSumAggregateOutputType | null
    _min: MethodologyStepMinAggregateOutputType | null
    _max: MethodologyStepMaxAggregateOutputType | null
  }

  type GetMethodologyStepGroupByPayload<T extends MethodologyStepGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MethodologyStepGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MethodologyStepGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MethodologyStepGroupByOutputType[P]>
            : GetScalarType<T[P], MethodologyStepGroupByOutputType[P]>
        }
      >
    >


  export type MethodologyStepSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    projectId?: boolean
    phase?: boolean
    stepNumber?: boolean
    stepName?: boolean
    input?: boolean
    llmOutput?: boolean
    humanOutput?: boolean
    confidenceScore?: boolean
    schemaValid?: boolean
    humanModified?: boolean
    approved?: boolean
    reviewNotes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    project?: boolean | ProjectDefaultArgs<ExtArgs>
    llmProviders?: boolean | MethodologyStep$llmProvidersArgs<ExtArgs>
    _count?: boolean | MethodologyStepCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["methodologyStep"]>

  export type MethodologyStepSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    projectId?: boolean
    phase?: boolean
    stepNumber?: boolean
    stepName?: boolean
    input?: boolean
    llmOutput?: boolean
    humanOutput?: boolean
    confidenceScore?: boolean
    schemaValid?: boolean
    humanModified?: boolean
    approved?: boolean
    reviewNotes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    project?: boolean | ProjectDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["methodologyStep"]>

  export type MethodologyStepSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    projectId?: boolean
    phase?: boolean
    stepNumber?: boolean
    stepName?: boolean
    input?: boolean
    llmOutput?: boolean
    humanOutput?: boolean
    confidenceScore?: boolean
    schemaValid?: boolean
    humanModified?: boolean
    approved?: boolean
    reviewNotes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    project?: boolean | ProjectDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["methodologyStep"]>

  export type MethodologyStepSelectScalar = {
    id?: boolean
    projectId?: boolean
    phase?: boolean
    stepNumber?: boolean
    stepName?: boolean
    input?: boolean
    llmOutput?: boolean
    humanOutput?: boolean
    confidenceScore?: boolean
    schemaValid?: boolean
    humanModified?: boolean
    approved?: boolean
    reviewNotes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type MethodologyStepOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "projectId" | "phase" | "stepNumber" | "stepName" | "input" | "llmOutput" | "humanOutput" | "confidenceScore" | "schemaValid" | "humanModified" | "approved" | "reviewNotes" | "createdAt" | "updatedAt", ExtArgs["result"]["methodologyStep"]>
  export type MethodologyStepInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    project?: boolean | ProjectDefaultArgs<ExtArgs>
    llmProviders?: boolean | MethodologyStep$llmProvidersArgs<ExtArgs>
    _count?: boolean | MethodologyStepCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type MethodologyStepIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    project?: boolean | ProjectDefaultArgs<ExtArgs>
  }
  export type MethodologyStepIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    project?: boolean | ProjectDefaultArgs<ExtArgs>
  }

  export type $MethodologyStepPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MethodologyStep"
    objects: {
      project: Prisma.$ProjectPayload<ExtArgs>
      llmProviders: Prisma.$LLMProviderPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      projectId: number
      phase: number
      stepNumber: number
      stepName: string
      input: Prisma.JsonValue
      llmOutput: Prisma.JsonValue
      humanOutput: Prisma.JsonValue | null
      confidenceScore: Prisma.Decimal | null
      schemaValid: boolean
      humanModified: boolean
      approved: boolean
      reviewNotes: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["methodologyStep"]>
    composites: {}
  }

  type MethodologyStepGetPayload<S extends boolean | null | undefined | MethodologyStepDefaultArgs> = $Result.GetResult<Prisma.$MethodologyStepPayload, S>

  type MethodologyStepCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MethodologyStepFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MethodologyStepCountAggregateInputType | true
    }

  export interface MethodologyStepDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MethodologyStep'], meta: { name: 'MethodologyStep' } }
    /**
     * Find zero or one MethodologyStep that matches the filter.
     * @param {MethodologyStepFindUniqueArgs} args - Arguments to find a MethodologyStep
     * @example
     * // Get one MethodologyStep
     * const methodologyStep = await prisma.methodologyStep.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MethodologyStepFindUniqueArgs>(args: SelectSubset<T, MethodologyStepFindUniqueArgs<ExtArgs>>): Prisma__MethodologyStepClient<$Result.GetResult<Prisma.$MethodologyStepPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MethodologyStep that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MethodologyStepFindUniqueOrThrowArgs} args - Arguments to find a MethodologyStep
     * @example
     * // Get one MethodologyStep
     * const methodologyStep = await prisma.methodologyStep.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MethodologyStepFindUniqueOrThrowArgs>(args: SelectSubset<T, MethodologyStepFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MethodologyStepClient<$Result.GetResult<Prisma.$MethodologyStepPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MethodologyStep that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MethodologyStepFindFirstArgs} args - Arguments to find a MethodologyStep
     * @example
     * // Get one MethodologyStep
     * const methodologyStep = await prisma.methodologyStep.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MethodologyStepFindFirstArgs>(args?: SelectSubset<T, MethodologyStepFindFirstArgs<ExtArgs>>): Prisma__MethodologyStepClient<$Result.GetResult<Prisma.$MethodologyStepPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MethodologyStep that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MethodologyStepFindFirstOrThrowArgs} args - Arguments to find a MethodologyStep
     * @example
     * // Get one MethodologyStep
     * const methodologyStep = await prisma.methodologyStep.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MethodologyStepFindFirstOrThrowArgs>(args?: SelectSubset<T, MethodologyStepFindFirstOrThrowArgs<ExtArgs>>): Prisma__MethodologyStepClient<$Result.GetResult<Prisma.$MethodologyStepPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MethodologySteps that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MethodologyStepFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MethodologySteps
     * const methodologySteps = await prisma.methodologyStep.findMany()
     * 
     * // Get first 10 MethodologySteps
     * const methodologySteps = await prisma.methodologyStep.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const methodologyStepWithIdOnly = await prisma.methodologyStep.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MethodologyStepFindManyArgs>(args?: SelectSubset<T, MethodologyStepFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MethodologyStepPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MethodologyStep.
     * @param {MethodologyStepCreateArgs} args - Arguments to create a MethodologyStep.
     * @example
     * // Create one MethodologyStep
     * const MethodologyStep = await prisma.methodologyStep.create({
     *   data: {
     *     // ... data to create a MethodologyStep
     *   }
     * })
     * 
     */
    create<T extends MethodologyStepCreateArgs>(args: SelectSubset<T, MethodologyStepCreateArgs<ExtArgs>>): Prisma__MethodologyStepClient<$Result.GetResult<Prisma.$MethodologyStepPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MethodologySteps.
     * @param {MethodologyStepCreateManyArgs} args - Arguments to create many MethodologySteps.
     * @example
     * // Create many MethodologySteps
     * const methodologyStep = await prisma.methodologyStep.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MethodologyStepCreateManyArgs>(args?: SelectSubset<T, MethodologyStepCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MethodologySteps and returns the data saved in the database.
     * @param {MethodologyStepCreateManyAndReturnArgs} args - Arguments to create many MethodologySteps.
     * @example
     * // Create many MethodologySteps
     * const methodologyStep = await prisma.methodologyStep.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MethodologySteps and only return the `id`
     * const methodologyStepWithIdOnly = await prisma.methodologyStep.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MethodologyStepCreateManyAndReturnArgs>(args?: SelectSubset<T, MethodologyStepCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MethodologyStepPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MethodologyStep.
     * @param {MethodologyStepDeleteArgs} args - Arguments to delete one MethodologyStep.
     * @example
     * // Delete one MethodologyStep
     * const MethodologyStep = await prisma.methodologyStep.delete({
     *   where: {
     *     // ... filter to delete one MethodologyStep
     *   }
     * })
     * 
     */
    delete<T extends MethodologyStepDeleteArgs>(args: SelectSubset<T, MethodologyStepDeleteArgs<ExtArgs>>): Prisma__MethodologyStepClient<$Result.GetResult<Prisma.$MethodologyStepPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MethodologyStep.
     * @param {MethodologyStepUpdateArgs} args - Arguments to update one MethodologyStep.
     * @example
     * // Update one MethodologyStep
     * const methodologyStep = await prisma.methodologyStep.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MethodologyStepUpdateArgs>(args: SelectSubset<T, MethodologyStepUpdateArgs<ExtArgs>>): Prisma__MethodologyStepClient<$Result.GetResult<Prisma.$MethodologyStepPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MethodologySteps.
     * @param {MethodologyStepDeleteManyArgs} args - Arguments to filter MethodologySteps to delete.
     * @example
     * // Delete a few MethodologySteps
     * const { count } = await prisma.methodologyStep.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MethodologyStepDeleteManyArgs>(args?: SelectSubset<T, MethodologyStepDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MethodologySteps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MethodologyStepUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MethodologySteps
     * const methodologyStep = await prisma.methodologyStep.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MethodologyStepUpdateManyArgs>(args: SelectSubset<T, MethodologyStepUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MethodologySteps and returns the data updated in the database.
     * @param {MethodologyStepUpdateManyAndReturnArgs} args - Arguments to update many MethodologySteps.
     * @example
     * // Update many MethodologySteps
     * const methodologyStep = await prisma.methodologyStep.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MethodologySteps and only return the `id`
     * const methodologyStepWithIdOnly = await prisma.methodologyStep.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MethodologyStepUpdateManyAndReturnArgs>(args: SelectSubset<T, MethodologyStepUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MethodologyStepPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MethodologyStep.
     * @param {MethodologyStepUpsertArgs} args - Arguments to update or create a MethodologyStep.
     * @example
     * // Update or create a MethodologyStep
     * const methodologyStep = await prisma.methodologyStep.upsert({
     *   create: {
     *     // ... data to create a MethodologyStep
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MethodologyStep we want to update
     *   }
     * })
     */
    upsert<T extends MethodologyStepUpsertArgs>(args: SelectSubset<T, MethodologyStepUpsertArgs<ExtArgs>>): Prisma__MethodologyStepClient<$Result.GetResult<Prisma.$MethodologyStepPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MethodologySteps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MethodologyStepCountArgs} args - Arguments to filter MethodologySteps to count.
     * @example
     * // Count the number of MethodologySteps
     * const count = await prisma.methodologyStep.count({
     *   where: {
     *     // ... the filter for the MethodologySteps we want to count
     *   }
     * })
    **/
    count<T extends MethodologyStepCountArgs>(
      args?: Subset<T, MethodologyStepCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MethodologyStepCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MethodologyStep.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MethodologyStepAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MethodologyStepAggregateArgs>(args: Subset<T, MethodologyStepAggregateArgs>): Prisma.PrismaPromise<GetMethodologyStepAggregateType<T>>

    /**
     * Group by MethodologyStep.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MethodologyStepGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MethodologyStepGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MethodologyStepGroupByArgs['orderBy'] }
        : { orderBy?: MethodologyStepGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MethodologyStepGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMethodologyStepGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MethodologyStep model
   */
  readonly fields: MethodologyStepFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MethodologyStep.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MethodologyStepClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    project<T extends ProjectDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProjectDefaultArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    llmProviders<T extends MethodologyStep$llmProvidersArgs<ExtArgs> = {}>(args?: Subset<T, MethodologyStep$llmProvidersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LLMProviderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MethodologyStep model
   */
  interface MethodologyStepFieldRefs {
    readonly id: FieldRef<"MethodologyStep", 'Int'>
    readonly projectId: FieldRef<"MethodologyStep", 'Int'>
    readonly phase: FieldRef<"MethodologyStep", 'Int'>
    readonly stepNumber: FieldRef<"MethodologyStep", 'Int'>
    readonly stepName: FieldRef<"MethodologyStep", 'String'>
    readonly input: FieldRef<"MethodologyStep", 'Json'>
    readonly llmOutput: FieldRef<"MethodologyStep", 'Json'>
    readonly humanOutput: FieldRef<"MethodologyStep", 'Json'>
    readonly confidenceScore: FieldRef<"MethodologyStep", 'Decimal'>
    readonly schemaValid: FieldRef<"MethodologyStep", 'Boolean'>
    readonly humanModified: FieldRef<"MethodologyStep", 'Boolean'>
    readonly approved: FieldRef<"MethodologyStep", 'Boolean'>
    readonly reviewNotes: FieldRef<"MethodologyStep", 'String'>
    readonly createdAt: FieldRef<"MethodologyStep", 'DateTime'>
    readonly updatedAt: FieldRef<"MethodologyStep", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MethodologyStep findUnique
   */
  export type MethodologyStepFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MethodologyStep
     */
    select?: MethodologyStepSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MethodologyStep
     */
    omit?: MethodologyStepOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MethodologyStepInclude<ExtArgs> | null
    /**
     * Filter, which MethodologyStep to fetch.
     */
    where: MethodologyStepWhereUniqueInput
  }

  /**
   * MethodologyStep findUniqueOrThrow
   */
  export type MethodologyStepFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MethodologyStep
     */
    select?: MethodologyStepSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MethodologyStep
     */
    omit?: MethodologyStepOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MethodologyStepInclude<ExtArgs> | null
    /**
     * Filter, which MethodologyStep to fetch.
     */
    where: MethodologyStepWhereUniqueInput
  }

  /**
   * MethodologyStep findFirst
   */
  export type MethodologyStepFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MethodologyStep
     */
    select?: MethodologyStepSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MethodologyStep
     */
    omit?: MethodologyStepOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MethodologyStepInclude<ExtArgs> | null
    /**
     * Filter, which MethodologyStep to fetch.
     */
    where?: MethodologyStepWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MethodologySteps to fetch.
     */
    orderBy?: MethodologyStepOrderByWithRelationInput | MethodologyStepOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MethodologySteps.
     */
    cursor?: MethodologyStepWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MethodologySteps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MethodologySteps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MethodologySteps.
     */
    distinct?: MethodologyStepScalarFieldEnum | MethodologyStepScalarFieldEnum[]
  }

  /**
   * MethodologyStep findFirstOrThrow
   */
  export type MethodologyStepFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MethodologyStep
     */
    select?: MethodologyStepSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MethodologyStep
     */
    omit?: MethodologyStepOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MethodologyStepInclude<ExtArgs> | null
    /**
     * Filter, which MethodologyStep to fetch.
     */
    where?: MethodologyStepWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MethodologySteps to fetch.
     */
    orderBy?: MethodologyStepOrderByWithRelationInput | MethodologyStepOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MethodologySteps.
     */
    cursor?: MethodologyStepWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MethodologySteps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MethodologySteps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MethodologySteps.
     */
    distinct?: MethodologyStepScalarFieldEnum | MethodologyStepScalarFieldEnum[]
  }

  /**
   * MethodologyStep findMany
   */
  export type MethodologyStepFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MethodologyStep
     */
    select?: MethodologyStepSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MethodologyStep
     */
    omit?: MethodologyStepOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MethodologyStepInclude<ExtArgs> | null
    /**
     * Filter, which MethodologySteps to fetch.
     */
    where?: MethodologyStepWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MethodologySteps to fetch.
     */
    orderBy?: MethodologyStepOrderByWithRelationInput | MethodologyStepOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MethodologySteps.
     */
    cursor?: MethodologyStepWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MethodologySteps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MethodologySteps.
     */
    skip?: number
    distinct?: MethodologyStepScalarFieldEnum | MethodologyStepScalarFieldEnum[]
  }

  /**
   * MethodologyStep create
   */
  export type MethodologyStepCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MethodologyStep
     */
    select?: MethodologyStepSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MethodologyStep
     */
    omit?: MethodologyStepOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MethodologyStepInclude<ExtArgs> | null
    /**
     * The data needed to create a MethodologyStep.
     */
    data: XOR<MethodologyStepCreateInput, MethodologyStepUncheckedCreateInput>
  }

  /**
   * MethodologyStep createMany
   */
  export type MethodologyStepCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MethodologySteps.
     */
    data: MethodologyStepCreateManyInput | MethodologyStepCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MethodologyStep createManyAndReturn
   */
  export type MethodologyStepCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MethodologyStep
     */
    select?: MethodologyStepSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MethodologyStep
     */
    omit?: MethodologyStepOmit<ExtArgs> | null
    /**
     * The data used to create many MethodologySteps.
     */
    data: MethodologyStepCreateManyInput | MethodologyStepCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MethodologyStepIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MethodologyStep update
   */
  export type MethodologyStepUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MethodologyStep
     */
    select?: MethodologyStepSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MethodologyStep
     */
    omit?: MethodologyStepOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MethodologyStepInclude<ExtArgs> | null
    /**
     * The data needed to update a MethodologyStep.
     */
    data: XOR<MethodologyStepUpdateInput, MethodologyStepUncheckedUpdateInput>
    /**
     * Choose, which MethodologyStep to update.
     */
    where: MethodologyStepWhereUniqueInput
  }

  /**
   * MethodologyStep updateMany
   */
  export type MethodologyStepUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MethodologySteps.
     */
    data: XOR<MethodologyStepUpdateManyMutationInput, MethodologyStepUncheckedUpdateManyInput>
    /**
     * Filter which MethodologySteps to update
     */
    where?: MethodologyStepWhereInput
    /**
     * Limit how many MethodologySteps to update.
     */
    limit?: number
  }

  /**
   * MethodologyStep updateManyAndReturn
   */
  export type MethodologyStepUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MethodologyStep
     */
    select?: MethodologyStepSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MethodologyStep
     */
    omit?: MethodologyStepOmit<ExtArgs> | null
    /**
     * The data used to update MethodologySteps.
     */
    data: XOR<MethodologyStepUpdateManyMutationInput, MethodologyStepUncheckedUpdateManyInput>
    /**
     * Filter which MethodologySteps to update
     */
    where?: MethodologyStepWhereInput
    /**
     * Limit how many MethodologySteps to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MethodologyStepIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * MethodologyStep upsert
   */
  export type MethodologyStepUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MethodologyStep
     */
    select?: MethodologyStepSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MethodologyStep
     */
    omit?: MethodologyStepOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MethodologyStepInclude<ExtArgs> | null
    /**
     * The filter to search for the MethodologyStep to update in case it exists.
     */
    where: MethodologyStepWhereUniqueInput
    /**
     * In case the MethodologyStep found by the `where` argument doesn't exist, create a new MethodologyStep with this data.
     */
    create: XOR<MethodologyStepCreateInput, MethodologyStepUncheckedCreateInput>
    /**
     * In case the MethodologyStep was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MethodologyStepUpdateInput, MethodologyStepUncheckedUpdateInput>
  }

  /**
   * MethodologyStep delete
   */
  export type MethodologyStepDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MethodologyStep
     */
    select?: MethodologyStepSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MethodologyStep
     */
    omit?: MethodologyStepOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MethodologyStepInclude<ExtArgs> | null
    /**
     * Filter which MethodologyStep to delete.
     */
    where: MethodologyStepWhereUniqueInput
  }

  /**
   * MethodologyStep deleteMany
   */
  export type MethodologyStepDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MethodologySteps to delete
     */
    where?: MethodologyStepWhereInput
    /**
     * Limit how many MethodologySteps to delete.
     */
    limit?: number
  }

  /**
   * MethodologyStep.llmProviders
   */
  export type MethodologyStep$llmProvidersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMProvider
     */
    select?: LLMProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMProvider
     */
    omit?: LLMProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMProviderInclude<ExtArgs> | null
    where?: LLMProviderWhereInput
    orderBy?: LLMProviderOrderByWithRelationInput | LLMProviderOrderByWithRelationInput[]
    cursor?: LLMProviderWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LLMProviderScalarFieldEnum | LLMProviderScalarFieldEnum[]
  }

  /**
   * MethodologyStep without action
   */
  export type MethodologyStepDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MethodologyStep
     */
    select?: MethodologyStepSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MethodologyStep
     */
    omit?: MethodologyStepOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MethodologyStepInclude<ExtArgs> | null
  }


  /**
   * Model LLMProvider
   */

  export type AggregateLLMProvider = {
    _count: LLMProviderCountAggregateOutputType | null
    _avg: LLMProviderAvgAggregateOutputType | null
    _sum: LLMProviderSumAggregateOutputType | null
    _min: LLMProviderMinAggregateOutputType | null
    _max: LLMProviderMaxAggregateOutputType | null
  }

  export type LLMProviderAvgAggregateOutputType = {
    id: number | null
    stepId: number | null
    apiCost: Decimal | null
    latencyMs: number | null
  }

  export type LLMProviderSumAggregateOutputType = {
    id: number | null
    stepId: number | null
    apiCost: Decimal | null
    latencyMs: number | null
  }

  export type LLMProviderMinAggregateOutputType = {
    id: number | null
    stepId: number | null
    provider: string | null
    model: string | null
    apiCost: Decimal | null
    latencyMs: number | null
  }

  export type LLMProviderMaxAggregateOutputType = {
    id: number | null
    stepId: number | null
    provider: string | null
    model: string | null
    apiCost: Decimal | null
    latencyMs: number | null
  }

  export type LLMProviderCountAggregateOutputType = {
    id: number
    stepId: number
    provider: number
    model: number
    apiCost: number
    latencyMs: number
    _all: number
  }


  export type LLMProviderAvgAggregateInputType = {
    id?: true
    stepId?: true
    apiCost?: true
    latencyMs?: true
  }

  export type LLMProviderSumAggregateInputType = {
    id?: true
    stepId?: true
    apiCost?: true
    latencyMs?: true
  }

  export type LLMProviderMinAggregateInputType = {
    id?: true
    stepId?: true
    provider?: true
    model?: true
    apiCost?: true
    latencyMs?: true
  }

  export type LLMProviderMaxAggregateInputType = {
    id?: true
    stepId?: true
    provider?: true
    model?: true
    apiCost?: true
    latencyMs?: true
  }

  export type LLMProviderCountAggregateInputType = {
    id?: true
    stepId?: true
    provider?: true
    model?: true
    apiCost?: true
    latencyMs?: true
    _all?: true
  }

  export type LLMProviderAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LLMProvider to aggregate.
     */
    where?: LLMProviderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LLMProviders to fetch.
     */
    orderBy?: LLMProviderOrderByWithRelationInput | LLMProviderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LLMProviderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LLMProviders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LLMProviders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LLMProviders
    **/
    _count?: true | LLMProviderCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LLMProviderAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LLMProviderSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LLMProviderMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LLMProviderMaxAggregateInputType
  }

  export type GetLLMProviderAggregateType<T extends LLMProviderAggregateArgs> = {
        [P in keyof T & keyof AggregateLLMProvider]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLLMProvider[P]>
      : GetScalarType<T[P], AggregateLLMProvider[P]>
  }




  export type LLMProviderGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LLMProviderWhereInput
    orderBy?: LLMProviderOrderByWithAggregationInput | LLMProviderOrderByWithAggregationInput[]
    by: LLMProviderScalarFieldEnum[] | LLMProviderScalarFieldEnum
    having?: LLMProviderScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LLMProviderCountAggregateInputType | true
    _avg?: LLMProviderAvgAggregateInputType
    _sum?: LLMProviderSumAggregateInputType
    _min?: LLMProviderMinAggregateInputType
    _max?: LLMProviderMaxAggregateInputType
  }

  export type LLMProviderGroupByOutputType = {
    id: number
    stepId: number
    provider: string
    model: string
    apiCost: Decimal | null
    latencyMs: number | null
    _count: LLMProviderCountAggregateOutputType | null
    _avg: LLMProviderAvgAggregateOutputType | null
    _sum: LLMProviderSumAggregateOutputType | null
    _min: LLMProviderMinAggregateOutputType | null
    _max: LLMProviderMaxAggregateOutputType | null
  }

  type GetLLMProviderGroupByPayload<T extends LLMProviderGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LLMProviderGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LLMProviderGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LLMProviderGroupByOutputType[P]>
            : GetScalarType<T[P], LLMProviderGroupByOutputType[P]>
        }
      >
    >


  export type LLMProviderSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    stepId?: boolean
    provider?: boolean
    model?: boolean
    apiCost?: boolean
    latencyMs?: boolean
    step?: boolean | MethodologyStepDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["lLMProvider"]>

  export type LLMProviderSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    stepId?: boolean
    provider?: boolean
    model?: boolean
    apiCost?: boolean
    latencyMs?: boolean
    step?: boolean | MethodologyStepDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["lLMProvider"]>

  export type LLMProviderSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    stepId?: boolean
    provider?: boolean
    model?: boolean
    apiCost?: boolean
    latencyMs?: boolean
    step?: boolean | MethodologyStepDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["lLMProvider"]>

  export type LLMProviderSelectScalar = {
    id?: boolean
    stepId?: boolean
    provider?: boolean
    model?: boolean
    apiCost?: boolean
    latencyMs?: boolean
  }

  export type LLMProviderOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "stepId" | "provider" | "model" | "apiCost" | "latencyMs", ExtArgs["result"]["lLMProvider"]>
  export type LLMProviderInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    step?: boolean | MethodologyStepDefaultArgs<ExtArgs>
  }
  export type LLMProviderIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    step?: boolean | MethodologyStepDefaultArgs<ExtArgs>
  }
  export type LLMProviderIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    step?: boolean | MethodologyStepDefaultArgs<ExtArgs>
  }

  export type $LLMProviderPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LLMProvider"
    objects: {
      step: Prisma.$MethodologyStepPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      stepId: number
      provider: string
      model: string
      apiCost: Prisma.Decimal | null
      latencyMs: number | null
    }, ExtArgs["result"]["lLMProvider"]>
    composites: {}
  }

  type LLMProviderGetPayload<S extends boolean | null | undefined | LLMProviderDefaultArgs> = $Result.GetResult<Prisma.$LLMProviderPayload, S>

  type LLMProviderCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LLMProviderFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LLMProviderCountAggregateInputType | true
    }

  export interface LLMProviderDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LLMProvider'], meta: { name: 'LLMProvider' } }
    /**
     * Find zero or one LLMProvider that matches the filter.
     * @param {LLMProviderFindUniqueArgs} args - Arguments to find a LLMProvider
     * @example
     * // Get one LLMProvider
     * const lLMProvider = await prisma.lLMProvider.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LLMProviderFindUniqueArgs>(args: SelectSubset<T, LLMProviderFindUniqueArgs<ExtArgs>>): Prisma__LLMProviderClient<$Result.GetResult<Prisma.$LLMProviderPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one LLMProvider that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LLMProviderFindUniqueOrThrowArgs} args - Arguments to find a LLMProvider
     * @example
     * // Get one LLMProvider
     * const lLMProvider = await prisma.lLMProvider.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LLMProviderFindUniqueOrThrowArgs>(args: SelectSubset<T, LLMProviderFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LLMProviderClient<$Result.GetResult<Prisma.$LLMProviderPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LLMProvider that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LLMProviderFindFirstArgs} args - Arguments to find a LLMProvider
     * @example
     * // Get one LLMProvider
     * const lLMProvider = await prisma.lLMProvider.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LLMProviderFindFirstArgs>(args?: SelectSubset<T, LLMProviderFindFirstArgs<ExtArgs>>): Prisma__LLMProviderClient<$Result.GetResult<Prisma.$LLMProviderPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LLMProvider that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LLMProviderFindFirstOrThrowArgs} args - Arguments to find a LLMProvider
     * @example
     * // Get one LLMProvider
     * const lLMProvider = await prisma.lLMProvider.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LLMProviderFindFirstOrThrowArgs>(args?: SelectSubset<T, LLMProviderFindFirstOrThrowArgs<ExtArgs>>): Prisma__LLMProviderClient<$Result.GetResult<Prisma.$LLMProviderPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more LLMProviders that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LLMProviderFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LLMProviders
     * const lLMProviders = await prisma.lLMProvider.findMany()
     * 
     * // Get first 10 LLMProviders
     * const lLMProviders = await prisma.lLMProvider.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const lLMProviderWithIdOnly = await prisma.lLMProvider.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LLMProviderFindManyArgs>(args?: SelectSubset<T, LLMProviderFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LLMProviderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a LLMProvider.
     * @param {LLMProviderCreateArgs} args - Arguments to create a LLMProvider.
     * @example
     * // Create one LLMProvider
     * const LLMProvider = await prisma.lLMProvider.create({
     *   data: {
     *     // ... data to create a LLMProvider
     *   }
     * })
     * 
     */
    create<T extends LLMProviderCreateArgs>(args: SelectSubset<T, LLMProviderCreateArgs<ExtArgs>>): Prisma__LLMProviderClient<$Result.GetResult<Prisma.$LLMProviderPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many LLMProviders.
     * @param {LLMProviderCreateManyArgs} args - Arguments to create many LLMProviders.
     * @example
     * // Create many LLMProviders
     * const lLMProvider = await prisma.lLMProvider.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LLMProviderCreateManyArgs>(args?: SelectSubset<T, LLMProviderCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many LLMProviders and returns the data saved in the database.
     * @param {LLMProviderCreateManyAndReturnArgs} args - Arguments to create many LLMProviders.
     * @example
     * // Create many LLMProviders
     * const lLMProvider = await prisma.lLMProvider.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many LLMProviders and only return the `id`
     * const lLMProviderWithIdOnly = await prisma.lLMProvider.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LLMProviderCreateManyAndReturnArgs>(args?: SelectSubset<T, LLMProviderCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LLMProviderPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a LLMProvider.
     * @param {LLMProviderDeleteArgs} args - Arguments to delete one LLMProvider.
     * @example
     * // Delete one LLMProvider
     * const LLMProvider = await prisma.lLMProvider.delete({
     *   where: {
     *     // ... filter to delete one LLMProvider
     *   }
     * })
     * 
     */
    delete<T extends LLMProviderDeleteArgs>(args: SelectSubset<T, LLMProviderDeleteArgs<ExtArgs>>): Prisma__LLMProviderClient<$Result.GetResult<Prisma.$LLMProviderPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one LLMProvider.
     * @param {LLMProviderUpdateArgs} args - Arguments to update one LLMProvider.
     * @example
     * // Update one LLMProvider
     * const lLMProvider = await prisma.lLMProvider.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LLMProviderUpdateArgs>(args: SelectSubset<T, LLMProviderUpdateArgs<ExtArgs>>): Prisma__LLMProviderClient<$Result.GetResult<Prisma.$LLMProviderPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more LLMProviders.
     * @param {LLMProviderDeleteManyArgs} args - Arguments to filter LLMProviders to delete.
     * @example
     * // Delete a few LLMProviders
     * const { count } = await prisma.lLMProvider.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LLMProviderDeleteManyArgs>(args?: SelectSubset<T, LLMProviderDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LLMProviders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LLMProviderUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LLMProviders
     * const lLMProvider = await prisma.lLMProvider.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LLMProviderUpdateManyArgs>(args: SelectSubset<T, LLMProviderUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LLMProviders and returns the data updated in the database.
     * @param {LLMProviderUpdateManyAndReturnArgs} args - Arguments to update many LLMProviders.
     * @example
     * // Update many LLMProviders
     * const lLMProvider = await prisma.lLMProvider.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more LLMProviders and only return the `id`
     * const lLMProviderWithIdOnly = await prisma.lLMProvider.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends LLMProviderUpdateManyAndReturnArgs>(args: SelectSubset<T, LLMProviderUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LLMProviderPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one LLMProvider.
     * @param {LLMProviderUpsertArgs} args - Arguments to update or create a LLMProvider.
     * @example
     * // Update or create a LLMProvider
     * const lLMProvider = await prisma.lLMProvider.upsert({
     *   create: {
     *     // ... data to create a LLMProvider
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LLMProvider we want to update
     *   }
     * })
     */
    upsert<T extends LLMProviderUpsertArgs>(args: SelectSubset<T, LLMProviderUpsertArgs<ExtArgs>>): Prisma__LLMProviderClient<$Result.GetResult<Prisma.$LLMProviderPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of LLMProviders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LLMProviderCountArgs} args - Arguments to filter LLMProviders to count.
     * @example
     * // Count the number of LLMProviders
     * const count = await prisma.lLMProvider.count({
     *   where: {
     *     // ... the filter for the LLMProviders we want to count
     *   }
     * })
    **/
    count<T extends LLMProviderCountArgs>(
      args?: Subset<T, LLMProviderCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LLMProviderCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LLMProvider.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LLMProviderAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LLMProviderAggregateArgs>(args: Subset<T, LLMProviderAggregateArgs>): Prisma.PrismaPromise<GetLLMProviderAggregateType<T>>

    /**
     * Group by LLMProvider.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LLMProviderGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LLMProviderGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LLMProviderGroupByArgs['orderBy'] }
        : { orderBy?: LLMProviderGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LLMProviderGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLLMProviderGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LLMProvider model
   */
  readonly fields: LLMProviderFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LLMProvider.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LLMProviderClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    step<T extends MethodologyStepDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MethodologyStepDefaultArgs<ExtArgs>>): Prisma__MethodologyStepClient<$Result.GetResult<Prisma.$MethodologyStepPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the LLMProvider model
   */
  interface LLMProviderFieldRefs {
    readonly id: FieldRef<"LLMProvider", 'Int'>
    readonly stepId: FieldRef<"LLMProvider", 'Int'>
    readonly provider: FieldRef<"LLMProvider", 'String'>
    readonly model: FieldRef<"LLMProvider", 'String'>
    readonly apiCost: FieldRef<"LLMProvider", 'Decimal'>
    readonly latencyMs: FieldRef<"LLMProvider", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * LLMProvider findUnique
   */
  export type LLMProviderFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMProvider
     */
    select?: LLMProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMProvider
     */
    omit?: LLMProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMProviderInclude<ExtArgs> | null
    /**
     * Filter, which LLMProvider to fetch.
     */
    where: LLMProviderWhereUniqueInput
  }

  /**
   * LLMProvider findUniqueOrThrow
   */
  export type LLMProviderFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMProvider
     */
    select?: LLMProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMProvider
     */
    omit?: LLMProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMProviderInclude<ExtArgs> | null
    /**
     * Filter, which LLMProvider to fetch.
     */
    where: LLMProviderWhereUniqueInput
  }

  /**
   * LLMProvider findFirst
   */
  export type LLMProviderFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMProvider
     */
    select?: LLMProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMProvider
     */
    omit?: LLMProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMProviderInclude<ExtArgs> | null
    /**
     * Filter, which LLMProvider to fetch.
     */
    where?: LLMProviderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LLMProviders to fetch.
     */
    orderBy?: LLMProviderOrderByWithRelationInput | LLMProviderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LLMProviders.
     */
    cursor?: LLMProviderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LLMProviders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LLMProviders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LLMProviders.
     */
    distinct?: LLMProviderScalarFieldEnum | LLMProviderScalarFieldEnum[]
  }

  /**
   * LLMProvider findFirstOrThrow
   */
  export type LLMProviderFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMProvider
     */
    select?: LLMProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMProvider
     */
    omit?: LLMProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMProviderInclude<ExtArgs> | null
    /**
     * Filter, which LLMProvider to fetch.
     */
    where?: LLMProviderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LLMProviders to fetch.
     */
    orderBy?: LLMProviderOrderByWithRelationInput | LLMProviderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LLMProviders.
     */
    cursor?: LLMProviderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LLMProviders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LLMProviders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LLMProviders.
     */
    distinct?: LLMProviderScalarFieldEnum | LLMProviderScalarFieldEnum[]
  }

  /**
   * LLMProvider findMany
   */
  export type LLMProviderFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMProvider
     */
    select?: LLMProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMProvider
     */
    omit?: LLMProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMProviderInclude<ExtArgs> | null
    /**
     * Filter, which LLMProviders to fetch.
     */
    where?: LLMProviderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LLMProviders to fetch.
     */
    orderBy?: LLMProviderOrderByWithRelationInput | LLMProviderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LLMProviders.
     */
    cursor?: LLMProviderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LLMProviders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LLMProviders.
     */
    skip?: number
    distinct?: LLMProviderScalarFieldEnum | LLMProviderScalarFieldEnum[]
  }

  /**
   * LLMProvider create
   */
  export type LLMProviderCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMProvider
     */
    select?: LLMProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMProvider
     */
    omit?: LLMProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMProviderInclude<ExtArgs> | null
    /**
     * The data needed to create a LLMProvider.
     */
    data: XOR<LLMProviderCreateInput, LLMProviderUncheckedCreateInput>
  }

  /**
   * LLMProvider createMany
   */
  export type LLMProviderCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LLMProviders.
     */
    data: LLMProviderCreateManyInput | LLMProviderCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LLMProvider createManyAndReturn
   */
  export type LLMProviderCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMProvider
     */
    select?: LLMProviderSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LLMProvider
     */
    omit?: LLMProviderOmit<ExtArgs> | null
    /**
     * The data used to create many LLMProviders.
     */
    data: LLMProviderCreateManyInput | LLMProviderCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMProviderIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * LLMProvider update
   */
  export type LLMProviderUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMProvider
     */
    select?: LLMProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMProvider
     */
    omit?: LLMProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMProviderInclude<ExtArgs> | null
    /**
     * The data needed to update a LLMProvider.
     */
    data: XOR<LLMProviderUpdateInput, LLMProviderUncheckedUpdateInput>
    /**
     * Choose, which LLMProvider to update.
     */
    where: LLMProviderWhereUniqueInput
  }

  /**
   * LLMProvider updateMany
   */
  export type LLMProviderUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LLMProviders.
     */
    data: XOR<LLMProviderUpdateManyMutationInput, LLMProviderUncheckedUpdateManyInput>
    /**
     * Filter which LLMProviders to update
     */
    where?: LLMProviderWhereInput
    /**
     * Limit how many LLMProviders to update.
     */
    limit?: number
  }

  /**
   * LLMProvider updateManyAndReturn
   */
  export type LLMProviderUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMProvider
     */
    select?: LLMProviderSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LLMProvider
     */
    omit?: LLMProviderOmit<ExtArgs> | null
    /**
     * The data used to update LLMProviders.
     */
    data: XOR<LLMProviderUpdateManyMutationInput, LLMProviderUncheckedUpdateManyInput>
    /**
     * Filter which LLMProviders to update
     */
    where?: LLMProviderWhereInput
    /**
     * Limit how many LLMProviders to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMProviderIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * LLMProvider upsert
   */
  export type LLMProviderUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMProvider
     */
    select?: LLMProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMProvider
     */
    omit?: LLMProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMProviderInclude<ExtArgs> | null
    /**
     * The filter to search for the LLMProvider to update in case it exists.
     */
    where: LLMProviderWhereUniqueInput
    /**
     * In case the LLMProvider found by the `where` argument doesn't exist, create a new LLMProvider with this data.
     */
    create: XOR<LLMProviderCreateInput, LLMProviderUncheckedCreateInput>
    /**
     * In case the LLMProvider was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LLMProviderUpdateInput, LLMProviderUncheckedUpdateInput>
  }

  /**
   * LLMProvider delete
   */
  export type LLMProviderDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMProvider
     */
    select?: LLMProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMProvider
     */
    omit?: LLMProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMProviderInclude<ExtArgs> | null
    /**
     * Filter which LLMProvider to delete.
     */
    where: LLMProviderWhereUniqueInput
  }

  /**
   * LLMProvider deleteMany
   */
  export type LLMProviderDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LLMProviders to delete
     */
    where?: LLMProviderWhereInput
    /**
     * Limit how many LLMProviders to delete.
     */
    limit?: number
  }

  /**
   * LLMProvider without action
   */
  export type LLMProviderDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMProvider
     */
    select?: LLMProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMProvider
     */
    omit?: LLMProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMProviderInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const ProjectScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    legalText: 'legalText',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ProjectScalarFieldEnum = (typeof ProjectScalarFieldEnum)[keyof typeof ProjectScalarFieldEnum]


  export const MethodologyStepScalarFieldEnum: {
    id: 'id',
    projectId: 'projectId',
    phase: 'phase',
    stepNumber: 'stepNumber',
    stepName: 'stepName',
    input: 'input',
    llmOutput: 'llmOutput',
    humanOutput: 'humanOutput',
    confidenceScore: 'confidenceScore',
    schemaValid: 'schemaValid',
    humanModified: 'humanModified',
    approved: 'approved',
    reviewNotes: 'reviewNotes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type MethodologyStepScalarFieldEnum = (typeof MethodologyStepScalarFieldEnum)[keyof typeof MethodologyStepScalarFieldEnum]


  export const LLMProviderScalarFieldEnum: {
    id: 'id',
    stepId: 'stepId',
    provider: 'provider',
    model: 'model',
    apiCost: 'apiCost',
    latencyMs: 'latencyMs'
  };

  export type LLMProviderScalarFieldEnum = (typeof LLMProviderScalarFieldEnum)[keyof typeof LLMProviderScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'ProjectStatus'
   */
  export type EnumProjectStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ProjectStatus'>
    


  /**
   * Reference to a field of type 'ProjectStatus[]'
   */
  export type ListEnumProjectStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ProjectStatus[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type ProjectWhereInput = {
    AND?: ProjectWhereInput | ProjectWhereInput[]
    OR?: ProjectWhereInput[]
    NOT?: ProjectWhereInput | ProjectWhereInput[]
    id?: IntFilter<"Project"> | number
    name?: StringFilter<"Project"> | string
    description?: StringNullableFilter<"Project"> | string | null
    legalText?: StringFilter<"Project"> | string
    status?: EnumProjectStatusFilter<"Project"> | $Enums.ProjectStatus
    createdAt?: DateTimeFilter<"Project"> | Date | string
    updatedAt?: DateTimeFilter<"Project"> | Date | string
    steps?: MethodologyStepListRelationFilter
  }

  export type ProjectOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    legalText?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    steps?: MethodologyStepOrderByRelationAggregateInput
  }

  export type ProjectWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    name?: string
    AND?: ProjectWhereInput | ProjectWhereInput[]
    OR?: ProjectWhereInput[]
    NOT?: ProjectWhereInput | ProjectWhereInput[]
    description?: StringNullableFilter<"Project"> | string | null
    legalText?: StringFilter<"Project"> | string
    status?: EnumProjectStatusFilter<"Project"> | $Enums.ProjectStatus
    createdAt?: DateTimeFilter<"Project"> | Date | string
    updatedAt?: DateTimeFilter<"Project"> | Date | string
    steps?: MethodologyStepListRelationFilter
  }, "id" | "name">

  export type ProjectOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    legalText?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ProjectCountOrderByAggregateInput
    _avg?: ProjectAvgOrderByAggregateInput
    _max?: ProjectMaxOrderByAggregateInput
    _min?: ProjectMinOrderByAggregateInput
    _sum?: ProjectSumOrderByAggregateInput
  }

  export type ProjectScalarWhereWithAggregatesInput = {
    AND?: ProjectScalarWhereWithAggregatesInput | ProjectScalarWhereWithAggregatesInput[]
    OR?: ProjectScalarWhereWithAggregatesInput[]
    NOT?: ProjectScalarWhereWithAggregatesInput | ProjectScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Project"> | number
    name?: StringWithAggregatesFilter<"Project"> | string
    description?: StringNullableWithAggregatesFilter<"Project"> | string | null
    legalText?: StringWithAggregatesFilter<"Project"> | string
    status?: EnumProjectStatusWithAggregatesFilter<"Project"> | $Enums.ProjectStatus
    createdAt?: DateTimeWithAggregatesFilter<"Project"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Project"> | Date | string
  }

  export type MethodologyStepWhereInput = {
    AND?: MethodologyStepWhereInput | MethodologyStepWhereInput[]
    OR?: MethodologyStepWhereInput[]
    NOT?: MethodologyStepWhereInput | MethodologyStepWhereInput[]
    id?: IntFilter<"MethodologyStep"> | number
    projectId?: IntFilter<"MethodologyStep"> | number
    phase?: IntFilter<"MethodologyStep"> | number
    stepNumber?: IntFilter<"MethodologyStep"> | number
    stepName?: StringFilter<"MethodologyStep"> | string
    input?: JsonFilter<"MethodologyStep">
    llmOutput?: JsonFilter<"MethodologyStep">
    humanOutput?: JsonNullableFilter<"MethodologyStep">
    confidenceScore?: DecimalNullableFilter<"MethodologyStep"> | Decimal | DecimalJsLike | number | string | null
    schemaValid?: BoolFilter<"MethodologyStep"> | boolean
    humanModified?: BoolFilter<"MethodologyStep"> | boolean
    approved?: BoolFilter<"MethodologyStep"> | boolean
    reviewNotes?: StringNullableFilter<"MethodologyStep"> | string | null
    createdAt?: DateTimeFilter<"MethodologyStep"> | Date | string
    updatedAt?: DateTimeFilter<"MethodologyStep"> | Date | string
    project?: XOR<ProjectScalarRelationFilter, ProjectWhereInput>
    llmProviders?: LLMProviderListRelationFilter
  }

  export type MethodologyStepOrderByWithRelationInput = {
    id?: SortOrder
    projectId?: SortOrder
    phase?: SortOrder
    stepNumber?: SortOrder
    stepName?: SortOrder
    input?: SortOrder
    llmOutput?: SortOrder
    humanOutput?: SortOrderInput | SortOrder
    confidenceScore?: SortOrderInput | SortOrder
    schemaValid?: SortOrder
    humanModified?: SortOrder
    approved?: SortOrder
    reviewNotes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    project?: ProjectOrderByWithRelationInput
    llmProviders?: LLMProviderOrderByRelationAggregateInput
  }

  export type MethodologyStepWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    projectId_phase_stepNumber?: MethodologyStepProjectIdPhaseStepNumberCompoundUniqueInput
    AND?: MethodologyStepWhereInput | MethodologyStepWhereInput[]
    OR?: MethodologyStepWhereInput[]
    NOT?: MethodologyStepWhereInput | MethodologyStepWhereInput[]
    projectId?: IntFilter<"MethodologyStep"> | number
    phase?: IntFilter<"MethodologyStep"> | number
    stepNumber?: IntFilter<"MethodologyStep"> | number
    stepName?: StringFilter<"MethodologyStep"> | string
    input?: JsonFilter<"MethodologyStep">
    llmOutput?: JsonFilter<"MethodologyStep">
    humanOutput?: JsonNullableFilter<"MethodologyStep">
    confidenceScore?: DecimalNullableFilter<"MethodologyStep"> | Decimal | DecimalJsLike | number | string | null
    schemaValid?: BoolFilter<"MethodologyStep"> | boolean
    humanModified?: BoolFilter<"MethodologyStep"> | boolean
    approved?: BoolFilter<"MethodologyStep"> | boolean
    reviewNotes?: StringNullableFilter<"MethodologyStep"> | string | null
    createdAt?: DateTimeFilter<"MethodologyStep"> | Date | string
    updatedAt?: DateTimeFilter<"MethodologyStep"> | Date | string
    project?: XOR<ProjectScalarRelationFilter, ProjectWhereInput>
    llmProviders?: LLMProviderListRelationFilter
  }, "id" | "projectId_phase_stepNumber">

  export type MethodologyStepOrderByWithAggregationInput = {
    id?: SortOrder
    projectId?: SortOrder
    phase?: SortOrder
    stepNumber?: SortOrder
    stepName?: SortOrder
    input?: SortOrder
    llmOutput?: SortOrder
    humanOutput?: SortOrderInput | SortOrder
    confidenceScore?: SortOrderInput | SortOrder
    schemaValid?: SortOrder
    humanModified?: SortOrder
    approved?: SortOrder
    reviewNotes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: MethodologyStepCountOrderByAggregateInput
    _avg?: MethodologyStepAvgOrderByAggregateInput
    _max?: MethodologyStepMaxOrderByAggregateInput
    _min?: MethodologyStepMinOrderByAggregateInput
    _sum?: MethodologyStepSumOrderByAggregateInput
  }

  export type MethodologyStepScalarWhereWithAggregatesInput = {
    AND?: MethodologyStepScalarWhereWithAggregatesInput | MethodologyStepScalarWhereWithAggregatesInput[]
    OR?: MethodologyStepScalarWhereWithAggregatesInput[]
    NOT?: MethodologyStepScalarWhereWithAggregatesInput | MethodologyStepScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"MethodologyStep"> | number
    projectId?: IntWithAggregatesFilter<"MethodologyStep"> | number
    phase?: IntWithAggregatesFilter<"MethodologyStep"> | number
    stepNumber?: IntWithAggregatesFilter<"MethodologyStep"> | number
    stepName?: StringWithAggregatesFilter<"MethodologyStep"> | string
    input?: JsonWithAggregatesFilter<"MethodologyStep">
    llmOutput?: JsonWithAggregatesFilter<"MethodologyStep">
    humanOutput?: JsonNullableWithAggregatesFilter<"MethodologyStep">
    confidenceScore?: DecimalNullableWithAggregatesFilter<"MethodologyStep"> | Decimal | DecimalJsLike | number | string | null
    schemaValid?: BoolWithAggregatesFilter<"MethodologyStep"> | boolean
    humanModified?: BoolWithAggregatesFilter<"MethodologyStep"> | boolean
    approved?: BoolWithAggregatesFilter<"MethodologyStep"> | boolean
    reviewNotes?: StringNullableWithAggregatesFilter<"MethodologyStep"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"MethodologyStep"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"MethodologyStep"> | Date | string
  }

  export type LLMProviderWhereInput = {
    AND?: LLMProviderWhereInput | LLMProviderWhereInput[]
    OR?: LLMProviderWhereInput[]
    NOT?: LLMProviderWhereInput | LLMProviderWhereInput[]
    id?: IntFilter<"LLMProvider"> | number
    stepId?: IntFilter<"LLMProvider"> | number
    provider?: StringFilter<"LLMProvider"> | string
    model?: StringFilter<"LLMProvider"> | string
    apiCost?: DecimalNullableFilter<"LLMProvider"> | Decimal | DecimalJsLike | number | string | null
    latencyMs?: IntNullableFilter<"LLMProvider"> | number | null
    step?: XOR<MethodologyStepScalarRelationFilter, MethodologyStepWhereInput>
  }

  export type LLMProviderOrderByWithRelationInput = {
    id?: SortOrder
    stepId?: SortOrder
    provider?: SortOrder
    model?: SortOrder
    apiCost?: SortOrderInput | SortOrder
    latencyMs?: SortOrderInput | SortOrder
    step?: MethodologyStepOrderByWithRelationInput
  }

  export type LLMProviderWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: LLMProviderWhereInput | LLMProviderWhereInput[]
    OR?: LLMProviderWhereInput[]
    NOT?: LLMProviderWhereInput | LLMProviderWhereInput[]
    stepId?: IntFilter<"LLMProvider"> | number
    provider?: StringFilter<"LLMProvider"> | string
    model?: StringFilter<"LLMProvider"> | string
    apiCost?: DecimalNullableFilter<"LLMProvider"> | Decimal | DecimalJsLike | number | string | null
    latencyMs?: IntNullableFilter<"LLMProvider"> | number | null
    step?: XOR<MethodologyStepScalarRelationFilter, MethodologyStepWhereInput>
  }, "id">

  export type LLMProviderOrderByWithAggregationInput = {
    id?: SortOrder
    stepId?: SortOrder
    provider?: SortOrder
    model?: SortOrder
    apiCost?: SortOrderInput | SortOrder
    latencyMs?: SortOrderInput | SortOrder
    _count?: LLMProviderCountOrderByAggregateInput
    _avg?: LLMProviderAvgOrderByAggregateInput
    _max?: LLMProviderMaxOrderByAggregateInput
    _min?: LLMProviderMinOrderByAggregateInput
    _sum?: LLMProviderSumOrderByAggregateInput
  }

  export type LLMProviderScalarWhereWithAggregatesInput = {
    AND?: LLMProviderScalarWhereWithAggregatesInput | LLMProviderScalarWhereWithAggregatesInput[]
    OR?: LLMProviderScalarWhereWithAggregatesInput[]
    NOT?: LLMProviderScalarWhereWithAggregatesInput | LLMProviderScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"LLMProvider"> | number
    stepId?: IntWithAggregatesFilter<"LLMProvider"> | number
    provider?: StringWithAggregatesFilter<"LLMProvider"> | string
    model?: StringWithAggregatesFilter<"LLMProvider"> | string
    apiCost?: DecimalNullableWithAggregatesFilter<"LLMProvider"> | Decimal | DecimalJsLike | number | string | null
    latencyMs?: IntNullableWithAggregatesFilter<"LLMProvider"> | number | null
  }

  export type ProjectCreateInput = {
    name: string
    description?: string | null
    legalText: string
    status?: $Enums.ProjectStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    steps?: MethodologyStepCreateNestedManyWithoutProjectInput
  }

  export type ProjectUncheckedCreateInput = {
    id?: number
    name: string
    description?: string | null
    legalText: string
    status?: $Enums.ProjectStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    steps?: MethodologyStepUncheckedCreateNestedManyWithoutProjectInput
  }

  export type ProjectUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    legalText?: StringFieldUpdateOperationsInput | string
    status?: EnumProjectStatusFieldUpdateOperationsInput | $Enums.ProjectStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    steps?: MethodologyStepUpdateManyWithoutProjectNestedInput
  }

  export type ProjectUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    legalText?: StringFieldUpdateOperationsInput | string
    status?: EnumProjectStatusFieldUpdateOperationsInput | $Enums.ProjectStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    steps?: MethodologyStepUncheckedUpdateManyWithoutProjectNestedInput
  }

  export type ProjectCreateManyInput = {
    id?: number
    name: string
    description?: string | null
    legalText: string
    status?: $Enums.ProjectStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProjectUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    legalText?: StringFieldUpdateOperationsInput | string
    status?: EnumProjectStatusFieldUpdateOperationsInput | $Enums.ProjectStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProjectUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    legalText?: StringFieldUpdateOperationsInput | string
    status?: EnumProjectStatusFieldUpdateOperationsInput | $Enums.ProjectStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MethodologyStepCreateInput = {
    phase: number
    stepNumber: number
    stepName: string
    input: JsonNullValueInput | InputJsonValue
    llmOutput: JsonNullValueInput | InputJsonValue
    humanOutput?: NullableJsonNullValueInput | InputJsonValue
    confidenceScore?: Decimal | DecimalJsLike | number | string | null
    schemaValid: boolean
    humanModified?: boolean
    approved?: boolean
    reviewNotes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    project: ProjectCreateNestedOneWithoutStepsInput
    llmProviders?: LLMProviderCreateNestedManyWithoutStepInput
  }

  export type MethodologyStepUncheckedCreateInput = {
    id?: number
    projectId: number
    phase: number
    stepNumber: number
    stepName: string
    input: JsonNullValueInput | InputJsonValue
    llmOutput: JsonNullValueInput | InputJsonValue
    humanOutput?: NullableJsonNullValueInput | InputJsonValue
    confidenceScore?: Decimal | DecimalJsLike | number | string | null
    schemaValid: boolean
    humanModified?: boolean
    approved?: boolean
    reviewNotes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    llmProviders?: LLMProviderUncheckedCreateNestedManyWithoutStepInput
  }

  export type MethodologyStepUpdateInput = {
    phase?: IntFieldUpdateOperationsInput | number
    stepNumber?: IntFieldUpdateOperationsInput | number
    stepName?: StringFieldUpdateOperationsInput | string
    input?: JsonNullValueInput | InputJsonValue
    llmOutput?: JsonNullValueInput | InputJsonValue
    humanOutput?: NullableJsonNullValueInput | InputJsonValue
    confidenceScore?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    schemaValid?: BoolFieldUpdateOperationsInput | boolean
    humanModified?: BoolFieldUpdateOperationsInput | boolean
    approved?: BoolFieldUpdateOperationsInput | boolean
    reviewNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    project?: ProjectUpdateOneRequiredWithoutStepsNestedInput
    llmProviders?: LLMProviderUpdateManyWithoutStepNestedInput
  }

  export type MethodologyStepUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    projectId?: IntFieldUpdateOperationsInput | number
    phase?: IntFieldUpdateOperationsInput | number
    stepNumber?: IntFieldUpdateOperationsInput | number
    stepName?: StringFieldUpdateOperationsInput | string
    input?: JsonNullValueInput | InputJsonValue
    llmOutput?: JsonNullValueInput | InputJsonValue
    humanOutput?: NullableJsonNullValueInput | InputJsonValue
    confidenceScore?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    schemaValid?: BoolFieldUpdateOperationsInput | boolean
    humanModified?: BoolFieldUpdateOperationsInput | boolean
    approved?: BoolFieldUpdateOperationsInput | boolean
    reviewNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    llmProviders?: LLMProviderUncheckedUpdateManyWithoutStepNestedInput
  }

  export type MethodologyStepCreateManyInput = {
    id?: number
    projectId: number
    phase: number
    stepNumber: number
    stepName: string
    input: JsonNullValueInput | InputJsonValue
    llmOutput: JsonNullValueInput | InputJsonValue
    humanOutput?: NullableJsonNullValueInput | InputJsonValue
    confidenceScore?: Decimal | DecimalJsLike | number | string | null
    schemaValid: boolean
    humanModified?: boolean
    approved?: boolean
    reviewNotes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MethodologyStepUpdateManyMutationInput = {
    phase?: IntFieldUpdateOperationsInput | number
    stepNumber?: IntFieldUpdateOperationsInput | number
    stepName?: StringFieldUpdateOperationsInput | string
    input?: JsonNullValueInput | InputJsonValue
    llmOutput?: JsonNullValueInput | InputJsonValue
    humanOutput?: NullableJsonNullValueInput | InputJsonValue
    confidenceScore?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    schemaValid?: BoolFieldUpdateOperationsInput | boolean
    humanModified?: BoolFieldUpdateOperationsInput | boolean
    approved?: BoolFieldUpdateOperationsInput | boolean
    reviewNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MethodologyStepUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    projectId?: IntFieldUpdateOperationsInput | number
    phase?: IntFieldUpdateOperationsInput | number
    stepNumber?: IntFieldUpdateOperationsInput | number
    stepName?: StringFieldUpdateOperationsInput | string
    input?: JsonNullValueInput | InputJsonValue
    llmOutput?: JsonNullValueInput | InputJsonValue
    humanOutput?: NullableJsonNullValueInput | InputJsonValue
    confidenceScore?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    schemaValid?: BoolFieldUpdateOperationsInput | boolean
    humanModified?: BoolFieldUpdateOperationsInput | boolean
    approved?: BoolFieldUpdateOperationsInput | boolean
    reviewNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LLMProviderCreateInput = {
    provider: string
    model: string
    apiCost?: Decimal | DecimalJsLike | number | string | null
    latencyMs?: number | null
    step: MethodologyStepCreateNestedOneWithoutLlmProvidersInput
  }

  export type LLMProviderUncheckedCreateInput = {
    id?: number
    stepId: number
    provider: string
    model: string
    apiCost?: Decimal | DecimalJsLike | number | string | null
    latencyMs?: number | null
  }

  export type LLMProviderUpdateInput = {
    provider?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    apiCost?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    latencyMs?: NullableIntFieldUpdateOperationsInput | number | null
    step?: MethodologyStepUpdateOneRequiredWithoutLlmProvidersNestedInput
  }

  export type LLMProviderUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    stepId?: IntFieldUpdateOperationsInput | number
    provider?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    apiCost?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    latencyMs?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type LLMProviderCreateManyInput = {
    id?: number
    stepId: number
    provider: string
    model: string
    apiCost?: Decimal | DecimalJsLike | number | string | null
    latencyMs?: number | null
  }

  export type LLMProviderUpdateManyMutationInput = {
    provider?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    apiCost?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    latencyMs?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type LLMProviderUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    stepId?: IntFieldUpdateOperationsInput | number
    provider?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    apiCost?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    latencyMs?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type EnumProjectStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ProjectStatus | EnumProjectStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ProjectStatus[] | ListEnumProjectStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProjectStatus[] | ListEnumProjectStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumProjectStatusFilter<$PrismaModel> | $Enums.ProjectStatus
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type MethodologyStepListRelationFilter = {
    every?: MethodologyStepWhereInput
    some?: MethodologyStepWhereInput
    none?: MethodologyStepWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type MethodologyStepOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProjectCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    legalText?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProjectAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type ProjectMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    legalText?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProjectMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    legalText?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProjectSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EnumProjectStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ProjectStatus | EnumProjectStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ProjectStatus[] | ListEnumProjectStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProjectStatus[] | ListEnumProjectStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumProjectStatusWithAggregatesFilter<$PrismaModel> | $Enums.ProjectStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumProjectStatusFilter<$PrismaModel>
    _max?: NestedEnumProjectStatusFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type DecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type ProjectScalarRelationFilter = {
    is?: ProjectWhereInput
    isNot?: ProjectWhereInput
  }

  export type LLMProviderListRelationFilter = {
    every?: LLMProviderWhereInput
    some?: LLMProviderWhereInput
    none?: LLMProviderWhereInput
  }

  export type LLMProviderOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MethodologyStepProjectIdPhaseStepNumberCompoundUniqueInput = {
    projectId: number
    phase: number
    stepNumber: number
  }

  export type MethodologyStepCountOrderByAggregateInput = {
    id?: SortOrder
    projectId?: SortOrder
    phase?: SortOrder
    stepNumber?: SortOrder
    stepName?: SortOrder
    input?: SortOrder
    llmOutput?: SortOrder
    humanOutput?: SortOrder
    confidenceScore?: SortOrder
    schemaValid?: SortOrder
    humanModified?: SortOrder
    approved?: SortOrder
    reviewNotes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MethodologyStepAvgOrderByAggregateInput = {
    id?: SortOrder
    projectId?: SortOrder
    phase?: SortOrder
    stepNumber?: SortOrder
    confidenceScore?: SortOrder
  }

  export type MethodologyStepMaxOrderByAggregateInput = {
    id?: SortOrder
    projectId?: SortOrder
    phase?: SortOrder
    stepNumber?: SortOrder
    stepName?: SortOrder
    confidenceScore?: SortOrder
    schemaValid?: SortOrder
    humanModified?: SortOrder
    approved?: SortOrder
    reviewNotes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MethodologyStepMinOrderByAggregateInput = {
    id?: SortOrder
    projectId?: SortOrder
    phase?: SortOrder
    stepNumber?: SortOrder
    stepName?: SortOrder
    confidenceScore?: SortOrder
    schemaValid?: SortOrder
    humanModified?: SortOrder
    approved?: SortOrder
    reviewNotes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MethodologyStepSumOrderByAggregateInput = {
    id?: SortOrder
    projectId?: SortOrder
    phase?: SortOrder
    stepNumber?: SortOrder
    confidenceScore?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type DecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type MethodologyStepScalarRelationFilter = {
    is?: MethodologyStepWhereInput
    isNot?: MethodologyStepWhereInput
  }

  export type LLMProviderCountOrderByAggregateInput = {
    id?: SortOrder
    stepId?: SortOrder
    provider?: SortOrder
    model?: SortOrder
    apiCost?: SortOrder
    latencyMs?: SortOrder
  }

  export type LLMProviderAvgOrderByAggregateInput = {
    id?: SortOrder
    stepId?: SortOrder
    apiCost?: SortOrder
    latencyMs?: SortOrder
  }

  export type LLMProviderMaxOrderByAggregateInput = {
    id?: SortOrder
    stepId?: SortOrder
    provider?: SortOrder
    model?: SortOrder
    apiCost?: SortOrder
    latencyMs?: SortOrder
  }

  export type LLMProviderMinOrderByAggregateInput = {
    id?: SortOrder
    stepId?: SortOrder
    provider?: SortOrder
    model?: SortOrder
    apiCost?: SortOrder
    latencyMs?: SortOrder
  }

  export type LLMProviderSumOrderByAggregateInput = {
    id?: SortOrder
    stepId?: SortOrder
    apiCost?: SortOrder
    latencyMs?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type MethodologyStepCreateNestedManyWithoutProjectInput = {
    create?: XOR<MethodologyStepCreateWithoutProjectInput, MethodologyStepUncheckedCreateWithoutProjectInput> | MethodologyStepCreateWithoutProjectInput[] | MethodologyStepUncheckedCreateWithoutProjectInput[]
    connectOrCreate?: MethodologyStepCreateOrConnectWithoutProjectInput | MethodologyStepCreateOrConnectWithoutProjectInput[]
    createMany?: MethodologyStepCreateManyProjectInputEnvelope
    connect?: MethodologyStepWhereUniqueInput | MethodologyStepWhereUniqueInput[]
  }

  export type MethodologyStepUncheckedCreateNestedManyWithoutProjectInput = {
    create?: XOR<MethodologyStepCreateWithoutProjectInput, MethodologyStepUncheckedCreateWithoutProjectInput> | MethodologyStepCreateWithoutProjectInput[] | MethodologyStepUncheckedCreateWithoutProjectInput[]
    connectOrCreate?: MethodologyStepCreateOrConnectWithoutProjectInput | MethodologyStepCreateOrConnectWithoutProjectInput[]
    createMany?: MethodologyStepCreateManyProjectInputEnvelope
    connect?: MethodologyStepWhereUniqueInput | MethodologyStepWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type EnumProjectStatusFieldUpdateOperationsInput = {
    set?: $Enums.ProjectStatus
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type MethodologyStepUpdateManyWithoutProjectNestedInput = {
    create?: XOR<MethodologyStepCreateWithoutProjectInput, MethodologyStepUncheckedCreateWithoutProjectInput> | MethodologyStepCreateWithoutProjectInput[] | MethodologyStepUncheckedCreateWithoutProjectInput[]
    connectOrCreate?: MethodologyStepCreateOrConnectWithoutProjectInput | MethodologyStepCreateOrConnectWithoutProjectInput[]
    upsert?: MethodologyStepUpsertWithWhereUniqueWithoutProjectInput | MethodologyStepUpsertWithWhereUniqueWithoutProjectInput[]
    createMany?: MethodologyStepCreateManyProjectInputEnvelope
    set?: MethodologyStepWhereUniqueInput | MethodologyStepWhereUniqueInput[]
    disconnect?: MethodologyStepWhereUniqueInput | MethodologyStepWhereUniqueInput[]
    delete?: MethodologyStepWhereUniqueInput | MethodologyStepWhereUniqueInput[]
    connect?: MethodologyStepWhereUniqueInput | MethodologyStepWhereUniqueInput[]
    update?: MethodologyStepUpdateWithWhereUniqueWithoutProjectInput | MethodologyStepUpdateWithWhereUniqueWithoutProjectInput[]
    updateMany?: MethodologyStepUpdateManyWithWhereWithoutProjectInput | MethodologyStepUpdateManyWithWhereWithoutProjectInput[]
    deleteMany?: MethodologyStepScalarWhereInput | MethodologyStepScalarWhereInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type MethodologyStepUncheckedUpdateManyWithoutProjectNestedInput = {
    create?: XOR<MethodologyStepCreateWithoutProjectInput, MethodologyStepUncheckedCreateWithoutProjectInput> | MethodologyStepCreateWithoutProjectInput[] | MethodologyStepUncheckedCreateWithoutProjectInput[]
    connectOrCreate?: MethodologyStepCreateOrConnectWithoutProjectInput | MethodologyStepCreateOrConnectWithoutProjectInput[]
    upsert?: MethodologyStepUpsertWithWhereUniqueWithoutProjectInput | MethodologyStepUpsertWithWhereUniqueWithoutProjectInput[]
    createMany?: MethodologyStepCreateManyProjectInputEnvelope
    set?: MethodologyStepWhereUniqueInput | MethodologyStepWhereUniqueInput[]
    disconnect?: MethodologyStepWhereUniqueInput | MethodologyStepWhereUniqueInput[]
    delete?: MethodologyStepWhereUniqueInput | MethodologyStepWhereUniqueInput[]
    connect?: MethodologyStepWhereUniqueInput | MethodologyStepWhereUniqueInput[]
    update?: MethodologyStepUpdateWithWhereUniqueWithoutProjectInput | MethodologyStepUpdateWithWhereUniqueWithoutProjectInput[]
    updateMany?: MethodologyStepUpdateManyWithWhereWithoutProjectInput | MethodologyStepUpdateManyWithWhereWithoutProjectInput[]
    deleteMany?: MethodologyStepScalarWhereInput | MethodologyStepScalarWhereInput[]
  }

  export type ProjectCreateNestedOneWithoutStepsInput = {
    create?: XOR<ProjectCreateWithoutStepsInput, ProjectUncheckedCreateWithoutStepsInput>
    connectOrCreate?: ProjectCreateOrConnectWithoutStepsInput
    connect?: ProjectWhereUniqueInput
  }

  export type LLMProviderCreateNestedManyWithoutStepInput = {
    create?: XOR<LLMProviderCreateWithoutStepInput, LLMProviderUncheckedCreateWithoutStepInput> | LLMProviderCreateWithoutStepInput[] | LLMProviderUncheckedCreateWithoutStepInput[]
    connectOrCreate?: LLMProviderCreateOrConnectWithoutStepInput | LLMProviderCreateOrConnectWithoutStepInput[]
    createMany?: LLMProviderCreateManyStepInputEnvelope
    connect?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
  }

  export type LLMProviderUncheckedCreateNestedManyWithoutStepInput = {
    create?: XOR<LLMProviderCreateWithoutStepInput, LLMProviderUncheckedCreateWithoutStepInput> | LLMProviderCreateWithoutStepInput[] | LLMProviderUncheckedCreateWithoutStepInput[]
    connectOrCreate?: LLMProviderCreateOrConnectWithoutStepInput | LLMProviderCreateOrConnectWithoutStepInput[]
    createMany?: LLMProviderCreateManyStepInputEnvelope
    connect?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
  }

  export type NullableDecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string | null
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type ProjectUpdateOneRequiredWithoutStepsNestedInput = {
    create?: XOR<ProjectCreateWithoutStepsInput, ProjectUncheckedCreateWithoutStepsInput>
    connectOrCreate?: ProjectCreateOrConnectWithoutStepsInput
    upsert?: ProjectUpsertWithoutStepsInput
    connect?: ProjectWhereUniqueInput
    update?: XOR<XOR<ProjectUpdateToOneWithWhereWithoutStepsInput, ProjectUpdateWithoutStepsInput>, ProjectUncheckedUpdateWithoutStepsInput>
  }

  export type LLMProviderUpdateManyWithoutStepNestedInput = {
    create?: XOR<LLMProviderCreateWithoutStepInput, LLMProviderUncheckedCreateWithoutStepInput> | LLMProviderCreateWithoutStepInput[] | LLMProviderUncheckedCreateWithoutStepInput[]
    connectOrCreate?: LLMProviderCreateOrConnectWithoutStepInput | LLMProviderCreateOrConnectWithoutStepInput[]
    upsert?: LLMProviderUpsertWithWhereUniqueWithoutStepInput | LLMProviderUpsertWithWhereUniqueWithoutStepInput[]
    createMany?: LLMProviderCreateManyStepInputEnvelope
    set?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    disconnect?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    delete?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    connect?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    update?: LLMProviderUpdateWithWhereUniqueWithoutStepInput | LLMProviderUpdateWithWhereUniqueWithoutStepInput[]
    updateMany?: LLMProviderUpdateManyWithWhereWithoutStepInput | LLMProviderUpdateManyWithWhereWithoutStepInput[]
    deleteMany?: LLMProviderScalarWhereInput | LLMProviderScalarWhereInput[]
  }

  export type LLMProviderUncheckedUpdateManyWithoutStepNestedInput = {
    create?: XOR<LLMProviderCreateWithoutStepInput, LLMProviderUncheckedCreateWithoutStepInput> | LLMProviderCreateWithoutStepInput[] | LLMProviderUncheckedCreateWithoutStepInput[]
    connectOrCreate?: LLMProviderCreateOrConnectWithoutStepInput | LLMProviderCreateOrConnectWithoutStepInput[]
    upsert?: LLMProviderUpsertWithWhereUniqueWithoutStepInput | LLMProviderUpsertWithWhereUniqueWithoutStepInput[]
    createMany?: LLMProviderCreateManyStepInputEnvelope
    set?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    disconnect?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    delete?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    connect?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    update?: LLMProviderUpdateWithWhereUniqueWithoutStepInput | LLMProviderUpdateWithWhereUniqueWithoutStepInput[]
    updateMany?: LLMProviderUpdateManyWithWhereWithoutStepInput | LLMProviderUpdateManyWithWhereWithoutStepInput[]
    deleteMany?: LLMProviderScalarWhereInput | LLMProviderScalarWhereInput[]
  }

  export type MethodologyStepCreateNestedOneWithoutLlmProvidersInput = {
    create?: XOR<MethodologyStepCreateWithoutLlmProvidersInput, MethodologyStepUncheckedCreateWithoutLlmProvidersInput>
    connectOrCreate?: MethodologyStepCreateOrConnectWithoutLlmProvidersInput
    connect?: MethodologyStepWhereUniqueInput
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type MethodologyStepUpdateOneRequiredWithoutLlmProvidersNestedInput = {
    create?: XOR<MethodologyStepCreateWithoutLlmProvidersInput, MethodologyStepUncheckedCreateWithoutLlmProvidersInput>
    connectOrCreate?: MethodologyStepCreateOrConnectWithoutLlmProvidersInput
    upsert?: MethodologyStepUpsertWithoutLlmProvidersInput
    connect?: MethodologyStepWhereUniqueInput
    update?: XOR<XOR<MethodologyStepUpdateToOneWithWhereWithoutLlmProvidersInput, MethodologyStepUpdateWithoutLlmProvidersInput>, MethodologyStepUncheckedUpdateWithoutLlmProvidersInput>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumProjectStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ProjectStatus | EnumProjectStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ProjectStatus[] | ListEnumProjectStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProjectStatus[] | ListEnumProjectStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumProjectStatusFilter<$PrismaModel> | $Enums.ProjectStatus
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumProjectStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ProjectStatus | EnumProjectStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ProjectStatus[] | ListEnumProjectStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProjectStatus[] | ListEnumProjectStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumProjectStatusWithAggregatesFilter<$PrismaModel> | $Enums.ProjectStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumProjectStatusFilter<$PrismaModel>
    _max?: NestedEnumProjectStatusFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedDecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type MethodologyStepCreateWithoutProjectInput = {
    phase: number
    stepNumber: number
    stepName: string
    input: JsonNullValueInput | InputJsonValue
    llmOutput: JsonNullValueInput | InputJsonValue
    humanOutput?: NullableJsonNullValueInput | InputJsonValue
    confidenceScore?: Decimal | DecimalJsLike | number | string | null
    schemaValid: boolean
    humanModified?: boolean
    approved?: boolean
    reviewNotes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    llmProviders?: LLMProviderCreateNestedManyWithoutStepInput
  }

  export type MethodologyStepUncheckedCreateWithoutProjectInput = {
    id?: number
    phase: number
    stepNumber: number
    stepName: string
    input: JsonNullValueInput | InputJsonValue
    llmOutput: JsonNullValueInput | InputJsonValue
    humanOutput?: NullableJsonNullValueInput | InputJsonValue
    confidenceScore?: Decimal | DecimalJsLike | number | string | null
    schemaValid: boolean
    humanModified?: boolean
    approved?: boolean
    reviewNotes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    llmProviders?: LLMProviderUncheckedCreateNestedManyWithoutStepInput
  }

  export type MethodologyStepCreateOrConnectWithoutProjectInput = {
    where: MethodologyStepWhereUniqueInput
    create: XOR<MethodologyStepCreateWithoutProjectInput, MethodologyStepUncheckedCreateWithoutProjectInput>
  }

  export type MethodologyStepCreateManyProjectInputEnvelope = {
    data: MethodologyStepCreateManyProjectInput | MethodologyStepCreateManyProjectInput[]
    skipDuplicates?: boolean
  }

  export type MethodologyStepUpsertWithWhereUniqueWithoutProjectInput = {
    where: MethodologyStepWhereUniqueInput
    update: XOR<MethodologyStepUpdateWithoutProjectInput, MethodologyStepUncheckedUpdateWithoutProjectInput>
    create: XOR<MethodologyStepCreateWithoutProjectInput, MethodologyStepUncheckedCreateWithoutProjectInput>
  }

  export type MethodologyStepUpdateWithWhereUniqueWithoutProjectInput = {
    where: MethodologyStepWhereUniqueInput
    data: XOR<MethodologyStepUpdateWithoutProjectInput, MethodologyStepUncheckedUpdateWithoutProjectInput>
  }

  export type MethodologyStepUpdateManyWithWhereWithoutProjectInput = {
    where: MethodologyStepScalarWhereInput
    data: XOR<MethodologyStepUpdateManyMutationInput, MethodologyStepUncheckedUpdateManyWithoutProjectInput>
  }

  export type MethodologyStepScalarWhereInput = {
    AND?: MethodologyStepScalarWhereInput | MethodologyStepScalarWhereInput[]
    OR?: MethodologyStepScalarWhereInput[]
    NOT?: MethodologyStepScalarWhereInput | MethodologyStepScalarWhereInput[]
    id?: IntFilter<"MethodologyStep"> | number
    projectId?: IntFilter<"MethodologyStep"> | number
    phase?: IntFilter<"MethodologyStep"> | number
    stepNumber?: IntFilter<"MethodologyStep"> | number
    stepName?: StringFilter<"MethodologyStep"> | string
    input?: JsonFilter<"MethodologyStep">
    llmOutput?: JsonFilter<"MethodologyStep">
    humanOutput?: JsonNullableFilter<"MethodologyStep">
    confidenceScore?: DecimalNullableFilter<"MethodologyStep"> | Decimal | DecimalJsLike | number | string | null
    schemaValid?: BoolFilter<"MethodologyStep"> | boolean
    humanModified?: BoolFilter<"MethodologyStep"> | boolean
    approved?: BoolFilter<"MethodologyStep"> | boolean
    reviewNotes?: StringNullableFilter<"MethodologyStep"> | string | null
    createdAt?: DateTimeFilter<"MethodologyStep"> | Date | string
    updatedAt?: DateTimeFilter<"MethodologyStep"> | Date | string
  }

  export type ProjectCreateWithoutStepsInput = {
    name: string
    description?: string | null
    legalText: string
    status?: $Enums.ProjectStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProjectUncheckedCreateWithoutStepsInput = {
    id?: number
    name: string
    description?: string | null
    legalText: string
    status?: $Enums.ProjectStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProjectCreateOrConnectWithoutStepsInput = {
    where: ProjectWhereUniqueInput
    create: XOR<ProjectCreateWithoutStepsInput, ProjectUncheckedCreateWithoutStepsInput>
  }

  export type LLMProviderCreateWithoutStepInput = {
    provider: string
    model: string
    apiCost?: Decimal | DecimalJsLike | number | string | null
    latencyMs?: number | null
  }

  export type LLMProviderUncheckedCreateWithoutStepInput = {
    id?: number
    provider: string
    model: string
    apiCost?: Decimal | DecimalJsLike | number | string | null
    latencyMs?: number | null
  }

  export type LLMProviderCreateOrConnectWithoutStepInput = {
    where: LLMProviderWhereUniqueInput
    create: XOR<LLMProviderCreateWithoutStepInput, LLMProviderUncheckedCreateWithoutStepInput>
  }

  export type LLMProviderCreateManyStepInputEnvelope = {
    data: LLMProviderCreateManyStepInput | LLMProviderCreateManyStepInput[]
    skipDuplicates?: boolean
  }

  export type ProjectUpsertWithoutStepsInput = {
    update: XOR<ProjectUpdateWithoutStepsInput, ProjectUncheckedUpdateWithoutStepsInput>
    create: XOR<ProjectCreateWithoutStepsInput, ProjectUncheckedCreateWithoutStepsInput>
    where?: ProjectWhereInput
  }

  export type ProjectUpdateToOneWithWhereWithoutStepsInput = {
    where?: ProjectWhereInput
    data: XOR<ProjectUpdateWithoutStepsInput, ProjectUncheckedUpdateWithoutStepsInput>
  }

  export type ProjectUpdateWithoutStepsInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    legalText?: StringFieldUpdateOperationsInput | string
    status?: EnumProjectStatusFieldUpdateOperationsInput | $Enums.ProjectStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProjectUncheckedUpdateWithoutStepsInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    legalText?: StringFieldUpdateOperationsInput | string
    status?: EnumProjectStatusFieldUpdateOperationsInput | $Enums.ProjectStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LLMProviderUpsertWithWhereUniqueWithoutStepInput = {
    where: LLMProviderWhereUniqueInput
    update: XOR<LLMProviderUpdateWithoutStepInput, LLMProviderUncheckedUpdateWithoutStepInput>
    create: XOR<LLMProviderCreateWithoutStepInput, LLMProviderUncheckedCreateWithoutStepInput>
  }

  export type LLMProviderUpdateWithWhereUniqueWithoutStepInput = {
    where: LLMProviderWhereUniqueInput
    data: XOR<LLMProviderUpdateWithoutStepInput, LLMProviderUncheckedUpdateWithoutStepInput>
  }

  export type LLMProviderUpdateManyWithWhereWithoutStepInput = {
    where: LLMProviderScalarWhereInput
    data: XOR<LLMProviderUpdateManyMutationInput, LLMProviderUncheckedUpdateManyWithoutStepInput>
  }

  export type LLMProviderScalarWhereInput = {
    AND?: LLMProviderScalarWhereInput | LLMProviderScalarWhereInput[]
    OR?: LLMProviderScalarWhereInput[]
    NOT?: LLMProviderScalarWhereInput | LLMProviderScalarWhereInput[]
    id?: IntFilter<"LLMProvider"> | number
    stepId?: IntFilter<"LLMProvider"> | number
    provider?: StringFilter<"LLMProvider"> | string
    model?: StringFilter<"LLMProvider"> | string
    apiCost?: DecimalNullableFilter<"LLMProvider"> | Decimal | DecimalJsLike | number | string | null
    latencyMs?: IntNullableFilter<"LLMProvider"> | number | null
  }

  export type MethodologyStepCreateWithoutLlmProvidersInput = {
    phase: number
    stepNumber: number
    stepName: string
    input: JsonNullValueInput | InputJsonValue
    llmOutput: JsonNullValueInput | InputJsonValue
    humanOutput?: NullableJsonNullValueInput | InputJsonValue
    confidenceScore?: Decimal | DecimalJsLike | number | string | null
    schemaValid: boolean
    humanModified?: boolean
    approved?: boolean
    reviewNotes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    project: ProjectCreateNestedOneWithoutStepsInput
  }

  export type MethodologyStepUncheckedCreateWithoutLlmProvidersInput = {
    id?: number
    projectId: number
    phase: number
    stepNumber: number
    stepName: string
    input: JsonNullValueInput | InputJsonValue
    llmOutput: JsonNullValueInput | InputJsonValue
    humanOutput?: NullableJsonNullValueInput | InputJsonValue
    confidenceScore?: Decimal | DecimalJsLike | number | string | null
    schemaValid: boolean
    humanModified?: boolean
    approved?: boolean
    reviewNotes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MethodologyStepCreateOrConnectWithoutLlmProvidersInput = {
    where: MethodologyStepWhereUniqueInput
    create: XOR<MethodologyStepCreateWithoutLlmProvidersInput, MethodologyStepUncheckedCreateWithoutLlmProvidersInput>
  }

  export type MethodologyStepUpsertWithoutLlmProvidersInput = {
    update: XOR<MethodologyStepUpdateWithoutLlmProvidersInput, MethodologyStepUncheckedUpdateWithoutLlmProvidersInput>
    create: XOR<MethodologyStepCreateWithoutLlmProvidersInput, MethodologyStepUncheckedCreateWithoutLlmProvidersInput>
    where?: MethodologyStepWhereInput
  }

  export type MethodologyStepUpdateToOneWithWhereWithoutLlmProvidersInput = {
    where?: MethodologyStepWhereInput
    data: XOR<MethodologyStepUpdateWithoutLlmProvidersInput, MethodologyStepUncheckedUpdateWithoutLlmProvidersInput>
  }

  export type MethodologyStepUpdateWithoutLlmProvidersInput = {
    phase?: IntFieldUpdateOperationsInput | number
    stepNumber?: IntFieldUpdateOperationsInput | number
    stepName?: StringFieldUpdateOperationsInput | string
    input?: JsonNullValueInput | InputJsonValue
    llmOutput?: JsonNullValueInput | InputJsonValue
    humanOutput?: NullableJsonNullValueInput | InputJsonValue
    confidenceScore?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    schemaValid?: BoolFieldUpdateOperationsInput | boolean
    humanModified?: BoolFieldUpdateOperationsInput | boolean
    approved?: BoolFieldUpdateOperationsInput | boolean
    reviewNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    project?: ProjectUpdateOneRequiredWithoutStepsNestedInput
  }

  export type MethodologyStepUncheckedUpdateWithoutLlmProvidersInput = {
    id?: IntFieldUpdateOperationsInput | number
    projectId?: IntFieldUpdateOperationsInput | number
    phase?: IntFieldUpdateOperationsInput | number
    stepNumber?: IntFieldUpdateOperationsInput | number
    stepName?: StringFieldUpdateOperationsInput | string
    input?: JsonNullValueInput | InputJsonValue
    llmOutput?: JsonNullValueInput | InputJsonValue
    humanOutput?: NullableJsonNullValueInput | InputJsonValue
    confidenceScore?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    schemaValid?: BoolFieldUpdateOperationsInput | boolean
    humanModified?: BoolFieldUpdateOperationsInput | boolean
    approved?: BoolFieldUpdateOperationsInput | boolean
    reviewNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MethodologyStepCreateManyProjectInput = {
    id?: number
    phase: number
    stepNumber: number
    stepName: string
    input: JsonNullValueInput | InputJsonValue
    llmOutput: JsonNullValueInput | InputJsonValue
    humanOutput?: NullableJsonNullValueInput | InputJsonValue
    confidenceScore?: Decimal | DecimalJsLike | number | string | null
    schemaValid: boolean
    humanModified?: boolean
    approved?: boolean
    reviewNotes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MethodologyStepUpdateWithoutProjectInput = {
    phase?: IntFieldUpdateOperationsInput | number
    stepNumber?: IntFieldUpdateOperationsInput | number
    stepName?: StringFieldUpdateOperationsInput | string
    input?: JsonNullValueInput | InputJsonValue
    llmOutput?: JsonNullValueInput | InputJsonValue
    humanOutput?: NullableJsonNullValueInput | InputJsonValue
    confidenceScore?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    schemaValid?: BoolFieldUpdateOperationsInput | boolean
    humanModified?: BoolFieldUpdateOperationsInput | boolean
    approved?: BoolFieldUpdateOperationsInput | boolean
    reviewNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    llmProviders?: LLMProviderUpdateManyWithoutStepNestedInput
  }

  export type MethodologyStepUncheckedUpdateWithoutProjectInput = {
    id?: IntFieldUpdateOperationsInput | number
    phase?: IntFieldUpdateOperationsInput | number
    stepNumber?: IntFieldUpdateOperationsInput | number
    stepName?: StringFieldUpdateOperationsInput | string
    input?: JsonNullValueInput | InputJsonValue
    llmOutput?: JsonNullValueInput | InputJsonValue
    humanOutput?: NullableJsonNullValueInput | InputJsonValue
    confidenceScore?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    schemaValid?: BoolFieldUpdateOperationsInput | boolean
    humanModified?: BoolFieldUpdateOperationsInput | boolean
    approved?: BoolFieldUpdateOperationsInput | boolean
    reviewNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    llmProviders?: LLMProviderUncheckedUpdateManyWithoutStepNestedInput
  }

  export type MethodologyStepUncheckedUpdateManyWithoutProjectInput = {
    id?: IntFieldUpdateOperationsInput | number
    phase?: IntFieldUpdateOperationsInput | number
    stepNumber?: IntFieldUpdateOperationsInput | number
    stepName?: StringFieldUpdateOperationsInput | string
    input?: JsonNullValueInput | InputJsonValue
    llmOutput?: JsonNullValueInput | InputJsonValue
    humanOutput?: NullableJsonNullValueInput | InputJsonValue
    confidenceScore?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    schemaValid?: BoolFieldUpdateOperationsInput | boolean
    humanModified?: BoolFieldUpdateOperationsInput | boolean
    approved?: BoolFieldUpdateOperationsInput | boolean
    reviewNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LLMProviderCreateManyStepInput = {
    id?: number
    provider: string
    model: string
    apiCost?: Decimal | DecimalJsLike | number | string | null
    latencyMs?: number | null
  }

  export type LLMProviderUpdateWithoutStepInput = {
    provider?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    apiCost?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    latencyMs?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type LLMProviderUncheckedUpdateWithoutStepInput = {
    id?: IntFieldUpdateOperationsInput | number
    provider?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    apiCost?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    latencyMs?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type LLMProviderUncheckedUpdateManyWithoutStepInput = {
    id?: IntFieldUpdateOperationsInput | number
    provider?: StringFieldUpdateOperationsInput | string
    model?: StringFieldUpdateOperationsInput | string
    apiCost?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    latencyMs?: NullableIntFieldUpdateOperationsInput | number | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}